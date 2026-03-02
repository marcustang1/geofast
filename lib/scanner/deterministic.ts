import { analyzeUrl, loadConfig } from "aiseo-audit";

export interface FactorResult {
  name: string;
  score: number;
  maxScore: number;
  value: string;
  status: "good" | "needs_improvement" | "critical" | "neutral";
}

export interface CategoryResult {
  name: string;
  key: string;
  score: number;
  maxScore: number;
  factors: FactorResult[];
}

export interface Recommendation {
  category: string;
  factor: string;
  currentValue: string;
  priority: "high" | "medium" | "low";
  recommendation: string;
}

export interface RawData {
  title?: string;
  metaDescription?: string;
  wordCount?: number;
  crawlerAccess?: {
    allowed: string[];
    blocked: string[];
    unknown: string[];
  };
  llmsTxt?: {
    llmsTxtExists: boolean;
    llmsFullTxtExists: boolean;
  };
  entities?: {
    people: string[];
    organizations: string[];
    places: string[];
    topics: string[];
  };
  freshness?: {
    publishDate?: string;
    modifiedDate?: string;
    ageInMonths?: number;
    hasModifiedDate?: boolean;
  };
  [key: string]: unknown;
}

export interface AuditResult {
  url: string;
  signalsBase: string;
  analyzedAt: string;
  overallScore: number;
  grade: string;
  totalPoints: number;
  maxPoints: number;
  categories: Record<string, CategoryResult>;
  recommendations: Recommendation[];
  rawData: RawData;
  meta: { version: string; analysisDurationMs: number };
}

export async function runDeterministicAudit(
  url: string
): Promise<AuditResult> {
  const config = await loadConfig();
  const result = await analyzeUrl(
    { url, timeout: 30000 },
    config
  );
  return result as unknown as AuditResult;
}
