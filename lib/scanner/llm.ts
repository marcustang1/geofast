// Phase 2: OpenRouter LLM integration
// TODO: implement in Phase 2
export async function callLLM(
  ...args: [systemPrompt: string, userContent: string, model?: string]
): Promise<{ json: Record<string, unknown>; usage: unknown }> {
  void args;
  throw new Error("Not implemented yet — Phase 2 task.");
}
