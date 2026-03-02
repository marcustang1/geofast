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
  const sitemapBonus = signals.sitemapXml ? 5 : 0;
  const crawlability = clamp(crawlBase + sitemapBonus);

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
    "Publication Date",
    "Entity Consistency",
  ]);
  const structuredAuthorityScore =
    structuredFactors.length > 0 ? factorsPct(structuredFactors) : 50;
  const entityClarityScore = categoryPct(
    cats["entityClarity"] ?? { score: 0, maxScore: 1 }
  );
  const structured = clamp(
    structuredAuthorityScore * 0.8 + entityClarityScore * 0.2
  );

  // --- Citability ---
  const answerability = categoryPct(
    cats["answerability"] ?? { score: 0, maxScore: 1 }
  );
  const entityClarity = categoryPct(
    cats["entityClarity"] ?? { score: 0, maxScore: 1 }
  );
  const grounding = categoryPct(
    cats["groundingSignals"] ?? { score: 0, maxScore: 1 }
  );
  const readability = categoryPct(
    cats["readabilityForCompression"] ?? { score: 0, maxScore: 1 }
  );
  const citability = clamp(
    answerability * 0.3 +
      entityClarity * 0.2 +
      grounding * 0.25 +
      readability * 0.25
  );

  return { crawlability, navigation, structured, citability };
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

/**
 * Blend LLM citability score into the deterministic citability dimension.
 * Deterministic weight: 60%, LLM weight: 40%.
 * Also boost structured dimension slightly with E-E-A-T total.
 */
export function blendLLMScores(
  deterministicScores: DimensionScores,
  llmCitabilityScore: number,
  eeatTotal: number
): DimensionScores {
  const blendedCitability = clamp(
    deterministicScores.citability * 0.6 + llmCitabilityScore * 0.4
  );

  const eeatBonus = clamp(eeatTotal) * 0.1;
  const blendedStructured = clamp(deterministicScores.structured + eeatBonus);

  return {
    ...deterministicScores,
    citability: blendedCitability,
    structured: blendedStructured,
  };
}
