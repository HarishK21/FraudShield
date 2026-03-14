import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { scoreSession, getRiskStatus } from "@/lib/fraud/scoring";
import type { AlertRecord, SessionSummaryInput } from "@/lib/fraud/types";

/**
 * GET /api/fraud/alerts
 *
 * Derives alerts from telemetry sessions that have risk scores above threshold.
 */
export async function GET() {
  try {
    const db = await getDb();
    const rawSessions = await db
      .collection("telemetry_sessions")
      .find({})
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();

    const alerts: AlertRecord[] = [];

    for (const doc of rawSessions) {
      const meta = (doc.metadata ?? {}) as Record<string, any>;

      const summaryInput: SessionSummaryInput = {
        totalSessionDuration: meta.totalSessionDuration ?? 0,
        clickCount: meta.clickCount ?? 0,
        avgTypingSpeed: meta.avgTypingSpeed ?? 0,
        correctionCount: meta.correctionCount ?? 0,
        hesitationCount: meta.hesitationCount ?? 0,
        unusualAmountFlag: meta.unusualAmountFlag ?? false,
        erraticMouseFlag: meta.erraticMouseFlag ?? false,
        rapidNavFlag: meta.rapidNavFlag ?? false,
        submitDelayMs: meta.submitDelayMs ?? 0,
        transferAmount: meta.transferAmount ?? 0,
        currentPage: doc.page ?? "Transfer",
        lastEventTime: doc.updatedAt ?? new Date().toISOString(),
        submitted: true,
        timeBeforeFirstClick: 0,
        avgDwellTime: 0,
        focusChangeCount: meta.focusChanges ?? 0,
        mouseTravelDistance: 0,
        sharpDirectionChanges: 0,
        rapidRepeatedClicks: 0,
      };

      const scored = scoreSession(summaryInput);

      if (scored.currentRiskScore >= 30) {
        const severity = scored.currentRiskScore >= 60 ? "High" : "Medium";
        const topReason = scored.topFlags[0] ?? "Behavioral anomaly detected";

        alerts.push({
          id: `alert-${doc.sessionId}`,
          sessionId: doc.sessionId,
          severity,
          reason: topReason,
          timestamp: doc.updatedAt ?? new Date().toISOString(),
          status: "Open",
        });
      }
    }

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("[FraudShield API] Error loading alerts:", error);
    return NextResponse.json([], { status: 200 });
  }
}
