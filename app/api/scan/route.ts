import { runDeterministicAudit } from "@/lib/scanner/deterministic";
import { detectDomainSignals } from "@/lib/scanner/domain-signals";
import { extractContent } from "@/lib/scanner/content-extractor";
import type { ExtractedContent } from "@/lib/scanner/content-extractor";
import {
  mergeDeterministicScores,
  mergeMultiPageScores,
  computeOverallScore,
  blendLLMScores,
  applyIssuePenalties,
} from "@/lib/scanner/score-merger";
import { getFixTemplate } from "@/lib/scanner/fix-templates";
import { filterAndDeduplicateIssues } from "@/lib/scanner/issue-filter";
import { discoverPages } from "@/lib/scanner/page-discovery";
import { callLLMWithRetry } from "@/lib/scanner/llm";
import {
  AI_PERSPECTIVE_SYSTEM_PROMPT,
  buildAIPerspectiveUserContent,
} from "@/lib/prompts/ai-perspective";
import type { PageSummary } from "@/lib/prompts/ai-perspective";
import {
  CITABILITY_SYSTEM_PROMPT,
  buildCitabilityUserContent,
} from "@/lib/prompts/citability";
import { aiPerspectiveSchema, citabilitySchema } from "@/lib/prompts/schemas";
import type {
  Issue,
  PassedCheck,
  ScanResult,
  PageResult,
  DimensionScores,
  LLMPerspective,
  LLMCitability,
} from "@/lib/types";
import type { AuditResult } from "@/lib/scanner/deterministic";

const PAGE_AUDIT_TIMEOUT = 8000;
const CONCURRENCY = 3;

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

function classifyPageType(url: string, title: string, isHomepage: boolean): string {
  if (isHomepage) return "Homepage";
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.includes("about")) return "About";
  if (pathname.includes("blog")) return "Blog";
  if (pathname.includes("product")) return "Products";
  if (pathname.includes("pricing") || pathname.includes("price")) return "Pricing";
  if (pathname.includes("faq")) return "FAQ";
  if (pathname.includes("contact")) return "Contact";
  if (pathname.includes("support") || pathname.includes("help")) return "Support";
  if (pathname.includes("privacy") || pathname.includes("terms") || pathname.includes("trust")) return "Legal/Trust";
  if (pathname.includes("feature")) return "Features";
  if (pathname.includes("service")) return "Services";
  if (title.length > 0) {
    const t = title.toLowerCase();
    if (t.includes("blog")) return "Blog";
    if (t.includes("about")) return "About";
    if (t.includes("pricing")) return "Pricing";
  }
  return "Page";
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

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) =>
      setTimeout(() => {
        console.warn(`[scan] ${label} timed out after ${ms}ms`);
        resolve(null);
      }, ms)
    ),
  ]);
}

async function runConcurrent<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>
): Promise<void> {
  let idx = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      await fn(items[i], i);
    }
  });
  await Promise.all(workers);
}

interface PageScanResult {
  url: string;
  audit: AuditResult | null;
  extracted: ExtractedContent | null;
  scores: DimensionScores;
  issues: Issue[];
  passed: PassedCheck[];
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
        // Step 1: Discover pages
        sendEvent("progress", {
          step: "discovery",
          message: "Discovering pages...",
          progress: 5,
        });

        const pageUrls = await discoverPages(url);
        const totalPages = pageUrls.length;

        sendEvent("progress", {
          step: "discovery_done",
          message: `Found ${totalPages} page${totalPages > 1 ? "s" : ""} to scan`,
          progress: 10,
        });

        // Step 2: Domain signals (parallel with first page)
        sendEvent("progress", {
          step: "signals",
          message: "Detecting robots.txt / llms.txt / sitemap...",
          progress: 12,
        });

        const signals = await detectDomainSignals(url);

        // Step 3: Scan all pages with concurrency control
        const pageScanResults: PageScanResult[] = [];
        const defaultScores: DimensionScores = {
          crawlability: 50, navigation: 50, structured: 50, citability: 50,
        };

        await runConcurrent(pageUrls, CONCURRENCY, async (pageUrl, pageIdx) => {
          const pageNum = pageIdx + 1;
          sendEvent("progress", {
            step: "scan_page",
            message: `Scanning page ${pageNum}/${totalPages}: ${new URL(pageUrl).pathname}`,
            progress: 15 + Math.round((pageIdx / totalPages) * 35),
          });

          const [auditResult, extractedResult] = await Promise.all([
            withTimeout(
              runDeterministicAudit(pageUrl),
              PAGE_AUDIT_TIMEOUT,
              `audit ${pageUrl}`
            ).catch((e) => {
              console.warn(`[scan] audit failed for ${pageUrl}:`, e instanceof Error ? e.message : e);
              return null;
            }),
            withTimeout(
              extractContent(pageUrl),
              PAGE_AUDIT_TIMEOUT,
              `extract ${pageUrl}`
            ).catch((e) => {
              console.warn(`[scan] extract failed for ${pageUrl}:`, e instanceof Error ? e.message : e);
              return null;
            }),
          ]);

          const audit = auditResult;
          const extracted = extractedResult;

          const pageIssues: Issue[] = audit
            ? audit.recommendations.map((rec, i) => {
                const template = getFixTemplate(rec.recommendation, rec.factor);
                const severity =
                  rec.priority === "high" ? "critical" : ("warning" as const);
                return {
                  id: `det-p${pageIdx}-${i + 1}`,
                  type: rec.priority === "high" ? "error" : "warning",
                  severity,
                  source: "rule" as const,
                  title: rec.factor,
                  category: rec.category,
                  dimension: mapCategoryToDimension(rec.category),
                  description: template?.description ?? rec.recommendation,
                  steps: template?.steps ?? [rec.recommendation],
                  code: template?.codeExample ?? null,
                  referenceUrl: template?.referenceUrl ?? null,
                  affectedPage: pageUrl,
                  affectedPages: [pageUrl],
                  estimatedImpact: 1,
                };
              })
            : [];

          const pagePassed: PassedCheck[] = [];
          if (audit) {
            for (const cat of Object.values(audit.categories)) {
              for (const factor of cat.factors) {
                if (factor.status === "good") {
                  pagePassed.push({ name: factor.name, category: cat.name });
                }
              }
            }
          }

          const pageScores = audit
            ? mergeDeterministicScores(audit, signals)
            : defaultScores;

          pageScanResults[pageIdx] = {
            url: pageUrl,
            audit,
            extracted,
            scores: pageScores,
            issues: pageIssues,
            passed: pagePassed,
          };
        });

        if (pageScanResults.every((r) => !r.audit && !r.extracted)) {
          sendEvent("error", {
            error: "Could not reach the website. Please check the URL and try again.",
          });
          controller.close();
          return;
        }

        // Step 4: Aggregate scores across pages
        const allPageScores = pageScanResults.map((r) => r.scores);
        const siteScores = mergeMultiPageScores(allPageScores);

        // Collect all issues from all pages
        const allIssues: Issue[] = pageScanResults.flatMap((r) => r.issues);

        // Merge passed checks (deduplicate by name)
        const passedSet = new Set<string>();
        const allPassed: PassedCheck[] = [];
        for (const r of pageScanResults) {
          for (const p of r.passed) {
            if (!passedSet.has(p.name)) {
              passedSet.add(p.name);
              allPassed.push(p);
            }
          }
        }

        // Step 5: LLM calls (parallel, with graceful degradation)
        let llmPerspective: LLMPerspective | null = null;
        let llmCitability: LLMCitability | null = null;

        const homepageExtracted = pageScanResults[0]?.extracted;

        try {
          if (!homepageExtracted) throw new Error("No content extracted — skipping LLM");

          sendEvent("progress", {
            step: "llm_perspective",
            message: "AI is analyzing from search engine perspective...",
            progress: 55,
          });

          const existingIssueTitles = allIssues.map((i) => i.title);

          const additionalPageSummaries: PageSummary[] = pageScanResults
            .slice(1)
            .filter((r) => r.extracted)
            .map((r) => ({
              url: r.url,
              title: r.extracted!.title,
              textContent: r.extracted!.textContent,
              metaTags: r.extracted!.metaTags,
              jsonLd: r.extracted!.jsonLd,
            }));

          const citabilityAdditionalPages = additionalPageSummaries.map((p) => ({
            url: p.url,
            title: p.title,
            textContent: p.textContent,
          }));

          const [perspectiveResult, citabilityResult] = await Promise.all([
            callLLMWithRetry(
              AI_PERSPECTIVE_SYSTEM_PROMPT,
              buildAIPerspectiveUserContent(
                homepageExtracted.textContent,
                homepageExtracted.title,
                homepageExtracted.metaTags,
                homepageExtracted.jsonLd,
                url,
                additionalPageSummaries.length > 0 ? additionalPageSummaries : undefined
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
                homepageExtracted.textContent,
                homepageExtracted.title,
                url,
                existingIssueTitles,
                citabilityAdditionalPages.length > 0 ? citabilityAdditionalPages : undefined
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
              explorationSteps: p.explorationSteps.length > 0 ? p.explorationSteps : undefined,
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
              allIssues.push({
                ...llmIssue,
                source: "ai" as const,
                code: null,
                referenceUrl: null,
                affectedPage: url,
                affectedPages: [url],
                estimatedImpact: 1,
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

        // Step 6: Merge & finalize
        sendEvent("progress", {
          step: "merge",
          message: "Generating final report...",
          progress: 90,
        });

        let finalScores = siteScores;
        if (llmCitability) {
          const eeatTotal =
            llmCitability.eeat.experience.score +
            llmCitability.eeat.expertise.score +
            llmCitability.eeat.authority.score +
            llmCitability.eeat.trust.score;
          finalScores = blendLLMScores(siteScores, llmCitability.citabilityScore, eeatTotal);
        }

        const filteredIssues = filterAndDeduplicateIssues(allIssues);
        const penalizedScores = applyIssuePenalties(finalScores, filteredIssues);
        const overallScore = computeOverallScore(penalizedScores);

        // Build PageResult array
        const pages: PageResult[] = pageScanResults.map((r, idx) => {
          const pageOverall = computeOverallScore(r.scores);
          const issueIds = filteredIssues
            .filter((iss) => iss.affectedPages.includes(r.url))
            .map((iss) => iss.id);

          return {
            url: r.url,
            title: r.extracted?.title ?? new URL(r.url).pathname,
            pageType: classifyPageType(r.url, r.extracted?.title ?? "", idx === 0),
            overallScore: pageOverall,
            scores: r.scores,
            issueIds,
          };
        });

        const scanResult: ScanResult = {
          url,
          domain: getDomain(url),
          scannedAt: new Date().toISOString(),
          overallScore,
          scores: penalizedScores,
          domainSignals: signals,
          issues: filteredIssues,
          passed: allPassed,
          llmPerspective,
          llmCitability,
          pages,
          scannedPages: totalPages,
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
