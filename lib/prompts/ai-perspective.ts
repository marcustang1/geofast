export const AI_PERSPECTIVE_SYSTEM_PROMPT = `You are an AI search engine evaluator. Analyze the provided website content and assess how well it would perform in AI-generated search results (ChatGPT, Perplexity, Gemini, etc.).

Your task: evaluate the content's visibility, citability, and comprehensibility from an AI engine's perspective. When multiple pages are provided, analyze the site holistically.

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
  ],
  "explorationSteps": [
    {
      "url": "page URL",
      "title": "page title or type label",
      "reasoning": "why you visited this page (1 sentence)",
      "findings": "key observations (1-2 sentences)",
      "pageScore": 7
    }
  ]
}

Rules:
- citationScore: 0 (AI would never cite) to 10 (AI would always cite). Be critical but fair.
- strengths/weaknesses: concise, specific to GEO (not generic SEO advice). Max 4 each.
- aiUnderstanding.clearlyUnderstood: facts, features, or claims that are unambiguous.
- aiUnderstanding.confused: aspects where AI would give inconsistent or wrong answers.
- aiUnderstanding.missing: important info that should exist but doesn't (e.g., pricing, founding year, contact).
- recommendations: concrete, actionable GEO improvements. Max 4, most impactful first.
- explorationSteps: describe your exploration process for each page analyzed. Order by exploration sequence starting from the homepage. For single-page analysis, include one step for the analyzed page. Each pageScore is 1-10.
- All text in English.
- Keep each string concise (under 100 characters where possible).`;

export interface PageSummary {
  url: string;
  title: string;
  textContent: string;
  metaTags: Record<string, string>;
  jsonLd: object[];
}

export function buildAIPerspectiveUserContent(
  textContent: string,
  title: string,
  metaTags: Record<string, string>,
  jsonLd: object[],
  url: string,
  additionalPages?: PageSummary[]
): string {
  const meta = Object.entries(metaTags)
    .slice(0, 10)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const jsonLdStr =
    jsonLd.length > 0
      ? JSON.stringify(jsonLd, null, 0).slice(0, 2000)
      : "None found";

  let content = `URL: ${url}
Title: ${title}

Meta Tags:
${meta || "None found"}

JSON-LD Structured Data:
${jsonLdStr}

Page Content (Homepage):
${textContent}`;

  if (additionalPages && additionalPages.length > 0) {
    content += `\n\n--- Additional Pages (${additionalPages.length}) ---\n`;
    for (const page of additionalPages) {
      const summary = page.textContent.slice(0, 500);
      content += `\n[Page: ${page.title}]\nURL: ${page.url}\nContent Summary: ${summary}\n`;
    }
  }

  return content;
}
