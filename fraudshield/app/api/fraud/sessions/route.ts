import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { scoreSession } from "@/lib/fraud/scoring";
import type { FraudSession, SessionSummaryInput } from "@/lib/fraud/types";

/**
 * GET /api/fraud/sessions
 *
 * Reads telemetry_sessions from the shared MongoDB (written by the banker app)
 * and transforms them into scored FraudSession objects for the dashboard.
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

    const rawEvents = await db
      .collection("telemetry_events")
      .find({})
      .sort({ timestamp: -1 })
      .limit(500)
      .toArray();

    // Group events by sessionId
    const eventsBySession = new Map<string, any[]>();
    for (const event of rawEvents) {
      const list = eventsBySession.get(event.sessionId) ?? [];
      list.push({
        id: event._id?.toString() ?? event.sessionId + "-" + list.length,
        sessionId: event.sessionId,
        timestamp: event.timestamp,
        page: event.page,
        eventType: event.eventType,
        elementId: event.elementId,
        transferAmount: event.metadata?.transferAmount,
        unusualAmountFlag: event.metadata?.unusualAmountFlag,
        hesitationCount: event.metadata?.count,
        dwellTime: event.metadata?.dwellMs,
        timeBeforeFirstClick: event.metadata?.timeBeforeFirstClickMs,
        mouseTravelDistance: event.metadata?.totalDistance,
        sharpDirectionChanges: event.metadata?.directionChanges,
        reviewToSubmitDelayMs: event.metadata?.submitDelayMs,
      });
      eventsBySession.set(event.sessionId, list);
    }

    const sessions: FraudSession[] = rawSessions.map((doc) => {
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
        timeBeforeFirstClick: meta.timeBeforeFirstClick ?? 0,
        avgDwellTime: meta.avgDwellTime ?? 0,
        focusChangeCount: meta.focusChanges ?? 0,
        mouseTravelDistance: meta.mouseTravelDistance ?? 0,
        sharpDirectionChanges: meta.sharpDirectionChanges ?? 0,
        rapidRepeatedClicks: meta.rapidRepeatedClicks ?? 0,
      };

      const scored = scoreSession(summaryInput);

      return {
        sessionId: doc.sessionId,
        accountId: doc.userId ?? "USR-UNKNOWN",
        accountHolder: "River Chen",
        deviceLabel: "Desktop / Chrome",
        geoRegion: "Toronto, ON",
        analystDecision: "Pending",
        events: eventsBySession.get(doc.sessionId) ?? [],
        summary: {
          ...summaryInput,
          ...scored,
        },
      };
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("[FraudShield API] Error loading sessions:", error);
    return NextResponse.json([], { status: 200 });
  }
}
