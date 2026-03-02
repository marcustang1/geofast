import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://geofast.app",
    "X-Title": "GeoFast",
  },
});

const DEFAULT_MODEL = "minimax/minimax-m2.5";

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

function repairJson(text: string): Record<string, unknown> {
  let cleaned = text.trim();

  // Strip markdown code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/g, "").replace(/\s*```$/g, "");

  // Extract from first { to matching }
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in LLM response");
  cleaned = cleaned.slice(start);

  // Try to find the matching closing brace by counting
  let depth = 0;
  let end = -1;
  let inString = false;
  let escape = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    if (ch === "}") { depth--; if (depth === 0) { end = i; break; } }
  }

  if (end !== -1) {
    cleaned = cleaned.slice(0, end + 1);
  }

  // Fix trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  // Fix values like: cit42 → 42, score65 → 65
  cleaned = cleaned.replace(/:\s*[a-zA-Z]+(\d+)/g, ": $1");

  // Fix unquoted keys (simple case)
  cleaned = cleaned.replace(
    /([{,]\s*)([a-zA-Z_]\w*)\s*:/g,
    '$1"$2":'
  );

  return JSON.parse(cleaned);
}

function parseJsonSafe(text: string): Record<string, unknown> {
  // Attempt 1: direct parse
  try {
    return JSON.parse(text);
  } catch {
    // pass
  }

  // Attempt 2: repair and parse
  try {
    return repairJson(text);
  } catch {
    // pass
  }

  // Attempt 3: try extracting just the JSON portion more aggressively
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      // pass
    }
  }

  throw new Error(
    `Failed to parse LLM response as JSON: ${text.slice(0, 100)}...`
  );
}

export async function callLLM(
  systemPrompt: string,
  userContent: string,
  model = DEFAULT_MODEL
): Promise<{ json: Record<string, unknown>; usage: LLMUsage }> {
  const response = await openrouter.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.1,
  });

  const text = response.choices[0]?.message?.content ?? "";
  const rawUsage = response.usage;

  const usage: LLMUsage = {
    promptTokens: rawUsage?.prompt_tokens ?? 0,
    completionTokens: rawUsage?.completion_tokens ?? 0,
    totalTokens: rawUsage?.total_tokens ?? 0,
    model,
  };

  console.log(
    `[LLM] model=${model} prompt=${usage.promptTokens} completion=${usage.completionTokens} total=${usage.totalTokens}`
  );

  return { json: parseJsonSafe(text), usage };
}

export async function callLLMWithRetry(
  systemPrompt: string,
  userContent: string,
  model = DEFAULT_MODEL,
  maxRetries = 2
): Promise<{ json: Record<string, unknown>; usage: LLMUsage }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callLLM(systemPrompt, userContent, model);
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const msg = error instanceof Error ? error.message : "";
      const isRetryable =
        msg.includes("429") ||
        msg.includes("500") ||
        msg.includes("timeout") ||
        msg.includes("ECONNRESET") ||
        msg.includes("JSON");

      if (isLastAttempt || !isRetryable) throw error;

      const delay = 1000 * Math.pow(2, attempt);
      console.log(
        `[LLM] Retry ${attempt + 1}/${maxRetries} after ${delay}ms (${msg.slice(0, 60)})...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("LLM call failed after retries");
}
