import type { AuditResult, FactorResult } from "./deterministic";
import type { DomainSignals, DimensionScores } from "@/lib/types";

function categoryPct(cat: { score: number; maxScore: number }): number {
  if (!cat || cat.maxScore === 0) return 0;
  return Math.round((cat.score / cat.maxScore) * 100);
}

function factorsPct(factors: FactorResult[]): number {
  const max = factors.reduce((s, f) => s + f.maxScore, 0);
  if (max === 0) return 0;
  const got = factors.reduce((s, f) => s + f.score, 0);
  return Math.round((got / max) * 100);
}

function pickFactors(
  cat: { factors: FactorResult[] } | undefined,
  names: string[]
): FactorResult[] {
  if (!cat) return [];
  const lower = names.map((n) => n.toLowerCase());
  return cat.factors.filter((f) => lower.includes(f.name.toLowerCase()));
}

function clamp(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

export function mergeDeterministicScores(
  audit: AuditResult,
  signals: DomainSignals
): DimensionScores {
  const cats = audit.categories;

  // --- AI Crawlability ---
  const crawlBase = categoryPct(
    cats["contentExtractability"] ?? { score: 0, maxScore: 1 }
  );
  const robotsBonus = signals.robotsTxt ? 12 : 0;
  const sitemapBonus = signals.sitemapXml ? 12 : 0;
  const crawlability = clamp(crawlBase + robotsBonus + sitemapBonus);

  // --- AI Navigation ---
  const structureScore = categoryPct(
    cats["contentStructure"] ?? { score: 0, maxScore: 1 }
  );
  const navAuthorityFactors = pickFactors(cats["authorityContext"], [
    "Contact/About Links",
    "Organization Identity",
  ]);
  const navAuthorityScore =
    navAuthorityFactors.length > 0 ? factorsPct(navAuthorityFactors) : 50;
  const navigation = clamp(structureScore * 0.6 + navAuthorityScore * 0.4);

  // --- Structured Data ---
  const structuredFactors = pickFactors(cats["authorityContext"], [
    "Structured Data",
    "Schema Completeness",
  ]);
  const structuredAuthorityScore =
    structuredFactors.length > 0 ? factorsPct(structuredFactors) : 50;
  const entityClarityScore = categoryPct(
    cats["entityClarity"] ?? { score: 0, maxScore: 1 }
  );
  const hasJsonLd = structuredFactors.some(
    (f) => f.name.toLowerCase() === "structured data" && f.status === "good"
  );
  const jsonLdBonus = hasJsonLd ? 15 : 0;
  const structured = clamp(
    structuredAuthorityScore * 0.7 + entityClarityScore * 0.3 + jsonLdBonus
  );

  // --- Citability ---
  const answerability = categoryPct(
    cats["answerability"] ?? { score: 0, maxScore: 1 }
  );
  const grounding = categoryPct(
    cats["groundingSignals"] ?? { score: 0, maxScore: 1 }
  );
  const entityClarity = categoryPct(
    cats["entityClarity"] ?? { score: 0, maxScore: 1 }
  );
  const readability = categoryPct(
    cats["readabilityForCompression"] ?? { score: 0, maxScore: 1 }
  );
  const citability = clamp(
    grounding * 0.35 +
      entityClarity * 0.35 +
      answerability * 0.15 +
      readability * 0.15
  );

  return { crawlability, navigation, structured, citability };
}

/**
 * Merge scores from multiple pages. Homepage (index 0) gets 2x weight.
 */
export function mergeMultiPageScores(
  pageScores: DimensionScores[]
): DimensionScores {
  if (pageScores.length === 0) return { crawlability: 50, navigation: 50, structured: 50, citability: 50 };
  if (pageScores.length === 1) return pageScores[0];

  const keys: (keyof DimensionScores)[] = ["crawlability", "navigation", "structured", "citability"];
  const result = { crawlability: 0, navigation: 0, structured: 0, citability: 0 };

  for (const key of keys) {
    let weightedSum = pageScores[0][key] * 2;
    let totalWeight = 2;
    for (let i = 1; i < pageScores.length; i++) {
      weightedSum += pageScores[i][key];
      totalWeight += 1;
    }
    result[key] = clamp(weightedSum / totalWeight);
  }

  return result;
}

export function computeOverallScore(scores: DimensionScores): number {
  const { crawlability, navigation, structured, citability } = scores;
  return clamp(
    crawlability * 0.25 +
      navigation * 0.25 +
      structured * 0.25 +
      citability * 0.25
  );
}

const DIMENSION_MAP: Record<string, keyof DimensionScores> = {
  "ai crawlability": "crawlability",
  "ai navigation": "navigation",
  "structured data": "structured",
  "citability": "citability",
};

const MAX_PENALTY_PER_DIMENSION = 15;

export function applyIssuePenalties(
  scores: DimensionScores,
  issues: { severity: string; dimension: string }[]
): DimensionScores {
  const penalties: Record<keyof DimensionScores, number> = {
    crawlability: 0,
    navigation: 0,
    structured: 0,
    citability: 0,
  };

  for (const issue of issues) {
    const key = DIMENSION_MAP[issue.dimension.toLowerCase()];
    if (!key) continue;
    penalties[key] += issue.severity === "critical" ? 5 : 2;
  }

  for (const key of Object.keys(penalties) as (keyof DimensionScores)[]) {
    penalties[key] = Math.min(penalties[key], MAX_PENALTY_PER_DIMENSION);
  }

  return {
    crawlability: clamp(scores.crawlability - penalties.crawlability),
    navigation: clamp(scores.navigation - penalties.navigation),
    structured: clamp(scores.structured - penalties.structured),
    citability: clamp(scores.citability - penalties.citability),
  };
}

/**
 * Blend LLM citability score (0-100) into the deterministic citability dimension.
 * Deterministic weight: 50%, LLM weight: 50% (capped at 80).
 * Also boost structured dimension slightly with E-E-A-T total.
 */
export function blendLLMScores(
  deterministicScores: DimensionScores,
  llmCitabilityScore: number,
  eeatTotal: number
): DimensionScores {
  const llmNormalized = Math.min(llmCitabilityScore, 80);
  const blendedCitability = clamp(
    deterministicScores.citability * 0.5 + llmNormalized * 0.5
  );

  const eeatBonus = clamp(eeatTotal) * 0.1;
  const blendedStructured = clamp(deterministicScores.structured + eeatBonus);

  return {
    ...deterministicScores,
    citability: blendedCitability,
    structured: blendedStructured,
  };
}
