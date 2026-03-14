import { NextResponse } from "next/server";
import {
  getAlertSeverity,
  loadScoredFraudSessions,
  shouldCreateAlert
} from "@/lib/fraud/session-pipeline";
import type { AlertRecord } from "@/lib/fraud/types";

/**
 * GET /api/fraud/alerts
 *
 * Derives alerts from model-scored sessions with shared policy thresholds.
 */
export async function GET() {
  try {
    const { policy, sessions } = await loadScoredFraudSessions({
      sessionLimit: 250,
      eventLimit: 5000
    });

    const alerts: AlertRecord[] = [];

    for (const session of sessions) {
      const score = session.summary.currentRiskScore;
      if (shouldCreateAlert(score, policy)) {
        alerts.push({
          id: `alert-${session.sessionId}`,
          sessionId: session.sessionId,
          severity: getAlertSeverity(score, policy),
          reason: session.summary.topFlags[0] ?? "Behavioral anomaly detected",
          timestamp: session.summary.lastEventTime,
          status: "Open",
        } satisfies AlertRecord);
      }
    }

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("[FraudShield API] Error loading alerts:", error);
    return NextResponse.json([], { status: 200 });
  }
}
