// Phase 1: Hardcoded fix templates for common issues
// TODO: implement in Phase 1
export interface FixTemplate {
  description: string;
  steps: string[];
  codeExample?: string;
  referenceUrl?: string;
}

export function getFixTemplate(
  recommendationText: string
): FixTemplate | undefined {
  throw new Error(
    `Not implemented yet — Phase 1 task. Key: ${recommendationText}`
  );
}
