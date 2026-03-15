import type { Issue } from "@/lib/types";

const SUPPRESSED_FACTORS = new Set([
  "answer capsules",
  "citation patterns",
  "definition patterns",
  "direct answer statements",
  "quoted attribution",
  "summary/conclusion",
  "transition usage",
  "attribution indicators",
  "section length",
  "jargon density",
  "paragraph structure",
  "readability",
  "tables presence",
  "topic consistency",
  "ai crawler access",
]);

const MERGE_MAP: Record<string, string> = {
  "content freshness": "publication date",
};

const CRITICAL_WHITELIST = new Set([
  "llms.txt presence",
  "text extraction quality",
]);

const THEME_KEYWORDS: [string[], string][] = [
  [["author", "expert", "attribution", "byline", "credential"], "author"],
  [["publication date", "freshness", "updated date", "last updated", "datePublished"], "freshness"],
  [["structured data", "json-ld", "schema"], "schema"],
  [["crawler", "crawl access", "bot access"], "crawler"],
];

function shouldSuppress(title: string): boolean {
  return SUPPRESSED_FACTORS.has(title.toLowerCase());
}

function canonicalTitle(title: string): string {
  const lower = title.toLowerCase();
  return MERGE_MAP[lower] ?? lower;
}

function themeKey(title: string): string | null {
  const lower = title.toLowerCase();
  for (const [keywords, theme] of THEME_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return theme;
  }
  return null;
}

/**
 * Filter, deduplicate, and merge issues — including cross-page merging.
 * Issues with the same canonical title from different pages are merged into one
 * with combined affectedPages.
 */
export function filterAndDeduplicateIssues(issues: Issue[]): Issue[] {
  const seenByTitle = new Map<string, Issue>();
  const seenByTheme = new Set<string>();
  const result: Issue[] = [];

  for (const issue of issues) {
    if (shouldSuppress(issue.title)) continue;

    const canonical = canonicalTitle(issue.title);
    const existing = seenByTitle.get(canonical);

    if (existing) {
      const pageUrl = issue.affectedPage ?? issue.affectedPages?.[0];
      if (pageUrl && !existing.affectedPages.includes(pageUrl)) {
        existing.affectedPages.push(pageUrl);
        existing.estimatedImpact = existing.affectedPages.length;
      }
      continue;
    }

    const theme = themeKey(issue.title);
    if (theme && seenByTheme.has(theme)) continue;

    const adjusted: Issue = {
      ...issue,
      affectedPages: issue.affectedPages?.length > 0
        ? [...issue.affectedPages]
        : issue.affectedPage ? [issue.affectedPage] : [],
      estimatedImpact: issue.estimatedImpact || 1,
    };

    if (adjusted.severity === "critical") {
      const isLLMIssue = adjusted.id.startsWith("llm-");
      const isCriticalAllowed =
        CRITICAL_WHITELIST.has(adjusted.title.toLowerCase()) || isLLMIssue;

      if (!isCriticalAllowed) {
        adjusted.severity = "warning";
        adjusted.type = "warning";
      }
    }

    seenByTitle.set(canonical, adjusted);
    if (theme) seenByTheme.add(theme);
    result.push(adjusted);
  }

  const criticalCount = result.filter((i) => i.severity === "critical").length;
  if (criticalCount > 3) {
    let downgraded = 0;
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i].severity === "critical") {
        result[i] = { ...result[i], severity: "warning", type: "warning" };
        downgraded++;
        if (criticalCount - downgraded <= 3) break;
      }
    }
  }

  return result;
}
