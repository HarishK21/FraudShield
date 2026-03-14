import { NextResponse } from "next/server";
import { loadScoredFraudSessions } from "@/lib/fraud/session-pipeline";

/**
 * GET /api/fraud/sessions
 *
 * Reads telemetry sessions and returns model-scored sessions with
 * policy-driven thresholds and historical risk context.
 */
export async function GET() {
  try {
    const { sessions } = await loadScoredFraudSessions({
      sessionLimit: 250,
      eventLimit: 5000
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("[FraudShield API] Error loading sessions:", error);
    return NextResponse.json([], { status: 200 });
  }
}
