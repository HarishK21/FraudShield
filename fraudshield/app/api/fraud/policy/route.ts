import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  DEFAULT_FRAUD_POLICY,
  mergeFraudPolicy
} from "@/lib/fraud/policy";
import { type FraudRiskPolicy } from "@/lib/fraud/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection("fraud_risk_policies");
    const activePolicyDoc =
      (await collection.findOne({ isActive: true }, { sort: { updatedAt: -1 } })) ??
      (await collection.findOne({}, { sort: { updatedAt: -1 } }));

    const policyOverride =
      asRecord(activePolicyDoc?.policy) ?? (activePolicyDoc as Record<string, unknown> | null);
    const policy = mergeFraudPolicy(
      DEFAULT_FRAUD_POLICY,
      policyOverride as Partial<FraudRiskPolicy> | null
    );

    return NextResponse.json({
      policy,
      source: activePolicyDoc ? "database" : "default",
      updatedAt: activePolicyDoc?.updatedAt ?? null
    });
  } catch (error) {
    console.error("[FraudShield API] Error loading policy:", error);
    return NextResponse.json(
      { policy: DEFAULT_FRAUD_POLICY, source: "default", updatedAt: null },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const policyRecord = asRecord(body?.policy ?? body);

  if (!policyRecord) {
    return NextResponse.json(
      { ok: false, error: "Request body must contain a policy object." },
      { status: 400 }
    );
  }

  const policy = mergeFraudPolicy(
    DEFAULT_FRAUD_POLICY,
    policyRecord as Partial<FraudRiskPolicy>
  );
  const updatedAt = new Date().toISOString();

  try {
    const db = await getDb();
    const collection = db.collection("fraud_risk_policies");
    await collection.updateMany({ isActive: true }, { $set: { isActive: false } });
    await collection.insertOne({
      policy,
      isActive: true,
      updatedAt,
      createdAt: updatedAt,
      updatedBy: typeof body?.updatedBy === "string" ? body.updatedBy : "system"
    });

    return NextResponse.json({
      ok: true,
      policy,
      updatedAt
    });
  } catch (error) {
    console.error("[FraudShield API] Error saving policy:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to persist fraud policy." },
      { status: 500 }
    );
  }
}

