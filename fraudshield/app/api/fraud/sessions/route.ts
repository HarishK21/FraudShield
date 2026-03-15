import { NextResponse } from "next/server";
import { loadScoredFraudSessions } from "@/lib/fraud/session-pipeline";
import { parseSessionFilterCriteria } from "@/lib/fraud/filter-query";

/**
 * GET /api/fraud/sessions
 *
 * Reads telemetry sessions and returns model-scored sessions with
 * policy-driven thresholds and historical risk context.
 */
export async function GET(request: Request) {
  try {
    const filters = parseSessionFilterCriteria(request);
    const { sessions } = await loadScoredFraudSessions({
      sessionLimit: 250,
      eventLimit: 5000,
      filters
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("[FraudShield API] Error loading sessions:", error);
    return NextResponse.json([], { status: 200 });
  }
}
