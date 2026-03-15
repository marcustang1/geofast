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
  source: "rule" | "ai";
  title: string;
  category: string;
  dimension: string;
  description: string;
  steps: string[];
  code: string | null;
  referenceUrl: string | null;
  /** @deprecated Use affectedPages instead */
  affectedPage: string | null;
  affectedPages: string[];
  estimatedImpact: number;
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

export interface ExplorationStep {
  url: string;
  title: string;
  reasoning: string;
  findings: string;
  pageScore: number;
}

export interface LLMPerspective {
  brandOverview: BrandOverview;
  citationScore: number;
  citationReasoning: string;
  strengths: string[];
  weaknesses: string[];
  aiUnderstanding: AIUnderstanding;
  recommendations: string[];
  explorationSteps?: ExplorationStep[];
}

export interface LLMCitability {
  citabilityScore: number;
  eeat: EEAT;
  issues: Omit<Issue, "code" | "referenceUrl" | "affectedPage" | "affectedPages" | "estimatedImpact" | "source">[];
}

export interface PageResult {
  url: string;
  title: string;
  pageType: string;
  overallScore: number;
  scores: DimensionScores;
  issueIds: string[];
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
  pages: PageResult[];
  scannedPages: number;
}

export interface StoredReport {
  id: string;
  url: string;
  domain: string;
  overallScore: number;
  scanResult: ScanResult;
  createdAt: string;
}
