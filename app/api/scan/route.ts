import { runDeterministicAudit } from "@/lib/scanner/deterministic";
import { detectDomainSignals } from "@/lib/scanner/domain-signals";
import { extractContent } from "@/lib/scanner/content-extractor";
import {
  mergeDeterministicScores,
  computeOverallScore,
  blendLLMScores,
} from "@/lib/scanner/score-merger";
import { getFixTemplate } from "@/lib/scanner/fix-templates";
import { callLLMWithRetry } from "@/lib/scanner/llm";
import {
  AI_PERSPECTIVE_SYSTEM_PROMPT,
  buildAIPerspectiveUserContent,
} from "@/lib/prompts/ai-perspective";
import {
  CITABILITY_SYSTEM_PROMPT,
  buildCitabilityUserContent,
} from "@/lib/prompts/citability";
import { aiPerspectiveSchema, citabilitySchema } from "@/lib/prompts/schemas";
import type {
  Issue,
  PassedCheck,
  ScanResult,
  LLMPerspective,
  LLMCitability,
} from "@/lib/types";

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  new URL(url);
  return url;
}

function getDomain(url: string): string {
  return new URL(url).hostname;
}

function mapCategoryToDimension(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("extractability")) return "AI Crawlability";
  if (lower.includes("structure")) return "AI Navigation";
  if (
    lower.includes("authority") ||
    lower.includes("entity clarity") ||
    lower.includes("entity consistency")
  )
    return "Structured Data";
  if (
    lower.includes("answerability") ||
    lower.includes("grounding") ||
    lower.includes("readability") ||
    lower.includes("compression")
  )
    return "Citability";
  return "Citability";
}

export async function POST(request: Request) {
  let url: string;
  try {
    const body = await request.json();
    const rawUrl = body?.url;
    if (!rawUrl || typeof rawUrl !== "string") {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    try {
      url = normalizeUrl(rawUrl);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        // Step 1: Fetch & extract (each step tolerates individual failures)
        sendEvent("progress", {
          step: "fetch",
          message: "Fetching page content...",
          progress: 10,
        });

        const [auditResult, signals, extractedResult] = await Promise.all([
          runDeterministicAudit(url).catch((e) => {
            console.warn("[scan] aiseo-audit failed:", e instanceof Error ? e.message : e);
            return null;
          }),
          detectDomainSignals(url).then((r) => {
            sendEvent("progress", {
              step: "domain",
              message: "Detecting robots.txt / llms.txt / sitemap...",
              progress: 25,
            });
            return r;
          }),
          extractContent(url).catch((e) => {
            console.warn("[scan] content extraction failed:", e instanceof Error ? e.message : e);
            return null;
          }),
        ]);

        if (!auditResult && !extractedResult) {
          sendEvent("error", {
            error: "Could not reach the website. Please check the URL and try again.",
          });
          controller.close();
          return;
        }

        const audit = auditResult;
        const extracted = extractedResult;

        // Step 2: Deterministic analysis
        sendEvent("progress", {
          step: "analyze",
          message: "Running deterministic analysis...",
          progress: 45,
        });

        const issues: Issue[] = audit
          ? audit.recommendations.map((rec, i) => {
              const template = getFixTemplate(rec.recommendation, rec.factor);
              const severity =
                rec.priority === "high" ? "critical" : ("warning" as const);
              return {
                id: `det-${i + 1}`,
                type: rec.priority === "high" ? "error" : "warning",
                severity,
                title: rec.factor,
                category: rec.category,
                dimension: mapCategoryToDimension(rec.category),
                description: template?.description ?? rec.recommendation,
                steps: template?.steps ?? [rec.recommendation],
                code: template?.codeExample ?? null,
                referenceUrl: template?.referenceUrl ?? null,
                affectedPage: url,
              };
            })
          : [];

        const passed: PassedCheck[] = [];
        if (audit) {
          for (const cat of Object.values(audit.categories)) {
            for (const factor of cat.factors) {
              if (factor.status === "good") {
                passed.push({ name: factor.name, category: cat.name });
              }
            }
          }
        }

        const defaultScores = { crawlability: 50, navigation: 50, structured: 50, citability: 50 };
        const deterministicScores = audit
          ? mergeDeterministicScores(audit, signals)
          : defaultScores;

        // Step 3: LLM calls (parallel, with graceful degradation)
        let llmPerspective: LLMPerspective | null = null;
        let llmCitability: LLMCitability | null = null;

        try {
          if (!extracted) throw new Error("No content extracted — skipping LLM");

          sendEvent("progress", {
            step: "llm_perspective",
            message: "AI is analyzing from search engine perspective...",
            progress: 55,
          });

          const existingIssueTitles = issues.map((i) => i.title);

          const [perspectiveResult, citabilityResult] = await Promise.all([
            callLLMWithRetry(
              AI_PERSPECTIVE_SYSTEM_PROMPT,
              buildAIPerspectiveUserContent(
                extracted.textContent,
                extracted.title,
                extracted.metaTags,
                extracted.jsonLd,
                url
              )
            ).then((r) => {
              sendEvent("progress", {
                step: "llm_citability",
                message: "AI is evaluating content citability...",
                progress: 75,
              });
              return r;
            }),
            callLLMWithRetry(
              CITABILITY_SYSTEM_PROMPT,
              buildCitabilityUserContent(
                extracted.textContent,
                extracted.title,
                url,
                existingIssueTitles
              )
            ),
          ]);

          const perspectiveParsed = aiPerspectiveSchema.safeParse(
            perspectiveResult.json
          );
          if (perspectiveParsed.success) {
            const p = perspectiveParsed.data;
            llmPerspective = {
              brandOverview: p.brandOverview,
              citationScore: p.citationScore,
              citationReasoning: p.citationReasoning,
              strengths: p.strengths,
              weaknesses: p.weaknesses,
              aiUnderstanding: p.aiUnderstanding,
              recommendations: p.recommendations,
            };
          } else {
            console.warn(
              "[scan] AI perspective Zod validation failed:",
              perspectiveParsed.error.issues
            );
          }

          const citabilityParsed = citabilitySchema.safeParse(
            citabilityResult.json
          );
          if (citabilityParsed.success) {
            const c = citabilityParsed.data;
            llmCitability = {
              citabilityScore: c.citabilityScore,
              eeat: c.eeat,
              issues: c.issues.map((iss, idx) => ({
                id: `llm-${idx + 1}`,
                type: iss.type,
                severity: iss.severity,
                title: iss.title,
                category: iss.category,
                dimension: iss.dimension,
                description: iss.description,
                steps: iss.steps,
              })),
            };

            for (const llmIssue of llmCitability.issues) {
              issues.push({
                ...llmIssue,
                code: null,
                referenceUrl: null,
                affectedPage: url,
              });
            }
          } else {
            console.warn(
              "[scan] Citability Zod validation failed:",
              citabilityParsed.error.issues
            );
          }
        } catch (llmError) {
          console.error(
            "[scan] LLM failed, returning deterministic-only:",
            llmError instanceof Error ? llmError.message : llmError
          );
        }

        // Step 4: Merge & finalize
        sendEvent("progress", {
          step: "merge",
          message: "Generating final report...",
          progress: 95,
        });

        let finalScores = deterministicScores;
        if (llmCitability) {
          const eeatTotal =
            llmCitability.eeat.experience.score +
            llmCitability.eeat.expertise.score +
            llmCitability.eeat.authority.score +
            llmCitability.eeat.trust.score;
          finalScores = blendLLMScores(
            deterministicScores,
            llmCitability.citabilityScore,
            eeatTotal
          );
        }

        const overallScore = computeOverallScore(finalScores);

        const scanResult: ScanResult = {
          url,
          domain: getDomain(url),
          scannedAt: new Date().toISOString(),
          overallScore,
          scores: finalScores,
          domainSignals: signals,
          issues,
          passed,
          llmPerspective,
          llmCitability,
        };

        sendEvent("complete", { scanResult });
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("[scan] Error:", message);

        let userMessage = "Scan failed. Please try again later.";
        if (
          message.includes("ECONNREFUSED") ||
          message.includes("ENOTFOUND") ||
          message.includes("timeout")
        ) {
          userMessage =
            "Could not reach the website. Please check the URL and try again.";
        }

        sendEvent("error", { error: userMessage });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
