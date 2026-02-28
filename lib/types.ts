export interface DimensionScores {
  crawlability: number;
  navigation: number;
  structured: number;
  citability: number;
}

export interface DomainSignals {
  robotsTxt: boolean;
  llmsTxt: boolean;
  sitemapXml: boolean;
  sitemapPages?: number;
}

export interface Issue {
  id: string;
  type: "error" | "warning" | "info";
  severity: "critical" | "warning" | "info";
  title: string;
  category: string;
  dimension: string;
  description: string;
  steps: string[];
  code: string | null;
  referenceUrl: string | null;
  affectedPage: string | null;
}

export interface PassedCheck {
  name: string;
  category: string;
}

export interface BrandOverview {
  name: string;
  businessType: string;
  targetUsers: string;
}

export interface AIUnderstanding {
  clearlyUnderstood: string[];
  confused: string[];
  missing: string[];
}

export interface EEATDimension {
  score: number;
  evidence: string;
  gaps: string;
}

export interface EEAT {
  experience: EEATDimension;
  expertise: EEATDimension;
  authority: EEATDimension;
  trust: EEATDimension;
}

export interface LLMPerspective {
  brandOverview: BrandOverview;
  citationScore: number;
  citationReasoning: string;
  strengths: string[];
  weaknesses: string[];
  aiUnderstanding: AIUnderstanding;
  recommendations: string[];
}

export interface LLMCitability {
  citabilityScore: number;
  eeat: EEAT;
  issues: Omit<Issue, "code" | "referenceUrl" | "affectedPage">[];
}

export interface ScanResult {
  url: string;
  domain: string;
  scannedAt: string;
  overallScore: number;
  scores: DimensionScores;
  domainSignals: DomainSignals;
  issues: Issue[];
  passed: PassedCheck[];
  llmPerspective: LLMPerspective | null;
  llmCitability: LLMCitability | null;
}

export interface StoredReport {
  id: string;
  url: string;
  domain: string;
  overallScore: number;
  scanResult: ScanResult;
  createdAt: string;
}
