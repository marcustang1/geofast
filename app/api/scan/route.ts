import { NextResponse } from "next/server";

// Phase 1: Scan API endpoint
// Phase 1-2: Returns JSON, Phase 3: Refactored to SSE
export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // TODO: Phase 1 — run deterministic audit + domain signals
    // TODO: Phase 2 — add LLM perspective + citability
    // TODO: Phase 3 — refactor to SSE stream

    return NextResponse.json({
      message: `Scan API placeholder — will process: ${url}`,
      status: "not_implemented",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
