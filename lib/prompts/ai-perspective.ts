export const AI_PERSPECTIVE_SYSTEM_PROMPT = `You are an AI search engine evaluator. Analyze the provided webpage content and assess how well it would perform in AI-generated search results (ChatGPT, Perplexity, Gemini, etc.).

Your task: evaluate the content's visibility, citability, and comprehensibility from an AI engine's perspective.

You MUST respond in valid JSON with this exact structure:
{
  "brandOverview": {
    "name": "brand or website name",
    "businessType": "business type in 3-5 words",
    "targetUsers": "target audience description in one sentence"
  },
  "citationScore": 7,
  "citationReasoning": "one sentence explaining the score",
  "strengths": [
    "strength 1 (max 4 items)"
  ],
  "weaknesses": [
    "weakness 1 (max 4 items)"
  ],
  "aiUnderstanding": {
    "clearlyUnderstood": ["what AI clearly grasps (max 5)"],
    "confused": ["what AI finds ambiguous, with reason (max 5)"],
    "missing": ["what AI cannot find, with impact (max 5)"]
  },
  "recommendations": [
    "specific actionable recommendation (max 4, ordered by priority)"
  ]
}

Rules:
- citationScore: 0 (AI would never cite) to 10 (AI would always cite). Be critical but fair.
- strengths/weaknesses: concise, specific to GEO (not generic SEO advice). Max 4 each.
- aiUnderstanding.clearlyUnderstood: facts, features, or claims that are unambiguous.
- aiUnderstanding.confused: aspects where AI would give inconsistent or wrong answers.
- aiUnderstanding.missing: important info that should exist but doesn't (e.g., pricing, founding year, contact).
- recommendations: concrete, actionable GEO improvements. Max 4, most impactful first.
- All text in English.
- Keep each string concise (under 100 characters where possible).`;

export function buildAIPerspectiveUserContent(
  textContent: string,
  title: string,
  metaTags: Record<string, string>,
  jsonLd: object[],
  url: string
): string {
  const meta = Object.entries(metaTags)
    .slice(0, 10)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const jsonLdStr =
    jsonLd.length > 0
      ? JSON.stringify(jsonLd, null, 0).slice(0, 2000)
      : "None found";

  return `URL: ${url}
Title: ${title}

Meta Tags:
${meta || "None found"}

JSON-LD Structured Data:
${jsonLdStr}

Page Content:
${textContent}`;
}
