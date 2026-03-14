import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { scoreSession } from "@/lib/fraud/scoring";
import type { CaseRecord, SessionSummaryInput } from "@/lib/fraud/types";

const analystPool = ["J. Park", "M. Singh", "A. Novak", "R. Lopez", "K. Patel"];

/**
 * GET /api/fraud/cases
 *
 * Derives investigation cases from high-risk telemetry sessions.
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

    const cases: CaseRecord[] = [];

    for (const [index, doc] of rawSessions.entries()) {
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

      if (scored.currentRiskScore >= 45) {
        const priority = scored.currentRiskScore >= 60 ? "Critical" : "High";

        cases.push({
          id: `case-${doc.sessionId}`,
          sessionId: doc.sessionId,
          priority,
          assignedAnalyst: analystPool[index % analystPool.length],
          createdTime: doc.updatedAt ?? new Date().toISOString(),
          status: "Open",
          summary: `Session flagged with risk score ${scored.currentRiskScore}. Top signals: ${scored.topFlags.join(", ")}.`,
        });
      }
    }

    return NextResponse.json(cases);
  } catch (error) {
    console.error("[FraudShield API] Error loading cases:", error);
    return NextResponse.json([], { status: 200 });
  }
}
