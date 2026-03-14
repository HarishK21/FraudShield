import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  type AnalystDecision,
  type AnalystOutcome,
  type CaseStatus
} from "@/lib/fraud/types";

const DECISIONS: AnalystDecision[] = ["Pending", "Safe", "Review", "Escalated"];
const OUTCOMES: AnalystOutcome[] = ["fraud", "legit", "unresolved"];
const CASE_STATUSES: CaseStatus[] = ["Open", "Investigating", "Resolved"];

function deriveOutcome(decision: AnalystDecision | null): AnalystOutcome {
  if (decision === "Safe") {
    return "legit";
  }

  if (decision === "Escalated") {
    return "fraud";
  }

  return "unresolved";
}

function sanitizeString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const sessionId = sanitizeString(body?.sessionId);

  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "sessionId is required." },
      { status: 400 }
    );
  }

  const analystDecision = DECISIONS.includes(body?.analystDecision as AnalystDecision)
    ? (body.analystDecision as AnalystDecision)
    : null;
  const outcome = OUTCOMES.includes(body?.outcome as AnalystOutcome)
    ? (body.outcome as AnalystOutcome)
    : deriveOutcome(analystDecision);
  const caseStatus = CASE_STATUSES.includes(body?.caseStatus as CaseStatus)
    ? (body.caseStatus as CaseStatus)
    : undefined;
  const notes = sanitizeString(body?.notes);
  const updatedAt = new Date().toISOString();

  try {
    const db = await getDb();
    await db.collection("fraud_feedback").updateOne(
      { sessionId },
      {
        $set: {
          sessionId,
          analystDecision: analystDecision ?? "Pending",
          outcome,
          caseStatus,
          notes,
          updatedAt
        },
        $setOnInsert: {
          createdAt: updatedAt
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      ok: true,
      feedback: {
        sessionId,
        analystDecision: analystDecision ?? "Pending",
        outcome,
        caseStatus,
        notes,
        updatedAt
      }
    });
  } catch (error) {
    console.error("[FraudShield API] Error saving feedback:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to persist analyst feedback." },
      { status: 500 }
    );
  }
}

