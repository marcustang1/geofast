import { z } from "zod";

function truncatedArray(maxItems: number) {
  return z
    .array(z.string())
    .transform((arr) => arr.slice(0, maxItems));
}

const explorationStepSchema = z.object({
  url: z.string(),
  title: z.string(),
  reasoning: z.string(),
  findings: z.string(),
  pageScore: z.number().min(1).max(10),
});

export const aiPerspectiveSchema = z.object({
  brandOverview: z.object({
    name: z.string(),
    businessType: z.string(),
    targetUsers: z.string(),
  }),
  citationScore: z.number().min(0).max(10),
  citationReasoning: z.string(),
  strengths: truncatedArray(4),
  weaknesses: truncatedArray(4),
  aiUnderstanding: z.object({
    clearlyUnderstood: truncatedArray(5),
    confused: truncatedArray(5),
    missing: truncatedArray(5),
  }),
  recommendations: truncatedArray(4),
  explorationSteps: z.array(explorationStepSchema).optional().default([]),
});

export type AIPerspectiveOutput = z.infer<typeof aiPerspectiveSchema>;

const eeatDimensionSchema = z.object({
  score: z.number().min(0).max(25),
  evidence: z.string(),
  gaps: z.string(),
});

const llmIssueSchema = z.object({
  type: z.enum(["error", "warning", "info"]),
  severity: z.enum(["critical", "warning"]).optional().default("warning"),
  title: z.string(),
  category: z.string(),
  dimension: z.string().optional().default("Citability"),
  description: z.string(),
  steps: z.array(z.string()).optional().default([]),
});

export const citabilitySchema = z.object({
  citabilityScore: z.number().min(0).max(100),
  eeat: z.object({
    experience: eeatDimensionSchema,
    expertise: eeatDimensionSchema,
    authority: eeatDimensionSchema,
    trust: eeatDimensionSchema,
  }),
  issues: z
    .array(llmIssueSchema)
    .optional()
    .default([])
    .transform((arr) => arr.slice(0, 5)),
});

export type CitabilityOutput = z.infer<typeof citabilitySchema>;
