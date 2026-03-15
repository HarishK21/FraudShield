import { NextResponse } from "next/server";
import { loadScoredFraudSessions } from "@/lib/fraud/session-pipeline";
import { parseSessionFilterCriteria } from "@/lib/fraud/filter-query";
import {
  type FeatureDriftMetric,
  type FraudMonitoringSnapshot,
  type TierEvaluationMetric
} from "@/lib/fraud/types";

type LabeledSession = {
  score: number;
  outcome: "fraud" | "legit";
};

type FeatureProjection = {
  key: string;
  value: number;
};

function mean(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, current) => sum + current, 0) / values.length;
}

function toTierMetric(
  labeled: LabeledSession[],
  threshold: number
): TierEvaluationMetric {
  const predictedPositive = labeled.filter((item) => item.score >= threshold).length;
  const truePositive = labeled.filter(
    (item) => item.score >= threshold && item.outcome === "fraud"
  ).length;
  const falsePositive = labeled.filter(
    (item) => item.score >= threshold && item.outcome === "legit"
  ).length;
  const falseNegative = labeled.filter(
    (item) => item.score < threshold && item.outcome === "fraud"
  ).length;

  const precision =
    predictedPositive > 0 ? truePositive / predictedPositive : 0;
  const recall =
    truePositive + falseNegative > 0
      ? truePositive / (truePositive + falseNegative)
      : 0;

  return {
    threshold,
    predictedPositive,
    truePositive,
    falsePositive,
    falseNegative,
    precision,
    recall
  };
}

function toFeatureDrift(
  feature: string,
  baselineValues: number[],
  recentValues: number[]
): FeatureDriftMetric {
  const baselineMean = mean(baselineValues);
  const recentMean = mean(recentValues);
  const absoluteShift = recentMean - baselineMean;
  const relativeShift =
    Math.abs(baselineMean) > 1e-6
      ? absoluteShift / Math.abs(baselineMean)
      : 0;

  return {
    feature,
    baselineMean,
    recentMean,
    absoluteShift,
    relativeShift,
    flagged: Math.abs(relativeShift) >= 0.35 && Math.abs(absoluteShift) > 0.5
  };
}

function projectFeatures(summary: {
  currentRiskScore: number;
  transferAmount: number;
  clickCount: number;
  submitDelayMs: number;
  avgTypingSpeed: number;
  focusChangeCount: number;
}): FeatureProjection[] {
  return [
    { key: "risk_score", value: summary.currentRiskScore },
    { key: "transfer_amount", value: summary.transferAmount },
    { key: "click_count", value: summary.clickCount },
    { key: "submit_delay_ms", value: summary.submitDelayMs },
    { key: "typing_speed", value: summary.avgTypingSpeed },
    { key: "focus_change_count", value: summary.focusChangeCount }
  ];
}

export async function GET(request: Request) {
  try {
    const filters = parseSessionFilterCriteria(request);
    const { feedbackBySession, policy, sessions } = await loadScoredFraudSessions({
      sessionLimit: 1000,
      eventLimit: 10000,
      filters
    });

    const labeled: LabeledSession[] = sessions
      .map((session) => {
        const outcome = feedbackBySession.get(session.sessionId)?.outcome;
        if (outcome !== "fraud" && outcome !== "legit") {
          return null;
        }

        return {
          score: session.summary.currentRiskScore,
          outcome
        };
      })
      .filter(Boolean) as LabeledSession[];

    const now = Date.now();
    const recentWindowStart = now - 24 * 60 * 60 * 1000;
    const baselineWindowStart = now - 8 * 24 * 60 * 60 * 1000;

    const recentSessions = sessions.filter(
      (session) => new Date(session.summary.lastEventTime).getTime() >= recentWindowStart
    );
    const baselineSessions = sessions.filter((session) => {
      const ts = new Date(session.summary.lastEventTime).getTime();
      return ts < recentWindowStart && ts >= baselineWindowStart;
    });
    const baselineSource = baselineSessions.length ? baselineSessions : sessions;
    const recentSource = recentSessions.length ? recentSessions : sessions;

    const driftFeatureKeys = [
      "risk_score",
      "transfer_amount",
      "click_count",
      "submit_delay_ms",
      "typing_speed",
      "focus_change_count"
    ];
    const baselineFeatureValues = new Map<string, number[]>();
    const recentFeatureValues = new Map<string, number[]>();

    baselineSource.forEach((session) => {
      projectFeatures(session.summary).forEach((item) => {
        const existing = baselineFeatureValues.get(item.key) ?? [];
        baselineFeatureValues.set(item.key, [...existing, item.value]);
      });
    });
    recentSource.forEach((session) => {
      projectFeatures(session.summary).forEach((item) => {
        const existing = recentFeatureValues.get(item.key) ?? [];
        recentFeatureValues.set(item.key, [...existing, item.value]);
      });
    });

    const drift = driftFeatureKeys.map((key) =>
      toFeatureDrift(
        key,
        baselineFeatureValues.get(key) ?? [],
        recentFeatureValues.get(key) ?? []
      )
    );

    const snapshot: FraudMonitoringSnapshot = {
      generatedAt: new Date().toISOString(),
      labeledSessions: labeled.length,
      evaluation: {
        alertTier: toTierMetric(labeled, policy.thresholds.alert),
        criticalTier: toTierMetric(labeled, policy.thresholds.criticalAlert)
      },
      drift
    };

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("[FraudShield API] Error generating metrics:", error);
    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        labeledSessions: 0,
        evaluation: {
          alertTier: {
            threshold: 0,
            predictedPositive: 0,
            truePositive: 0,
            falsePositive: 0,
            falseNegative: 0,
            precision: 0,
            recall: 0
          },
          criticalTier: {
            threshold: 0,
            predictedPositive: 0,
            truePositive: 0,
            falsePositive: 0,
            falseNegative: 0,
            precision: 0,
            recall: 0
          }
        },
        drift: []
      } satisfies FraudMonitoringSnapshot,
      { status: 200 }
    );
  }
}
