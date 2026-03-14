import {
  type BehaviorBaseline,
  type BehaviorDriftResult,
  type RiskFactor,
  type RiskStatus,
  type SessionSummaryInput
} from "@/lib/fraud/types";

export const DEFAULT_BEHAVIOR_BASELINE: BehaviorBaseline = {
  typingSpeedRange: [145, 265],
  hesitationRange: [0, 3],
  clickPaceRange: [4, 16],
  reviewDelayRange: [4000, 18000]
};

export const RISK_WEIGHTS = {
  unusualAmountFlag: 30,
  erraticMouseFlag: 20,
  rapidNavFlag: 15,
  hesitation: 10,
  correctionCount: 10,
  shortReviewSubmitDelay: 15,
  longReviewSubmitDelay: 8,
  sharpDirectionChanges: 10,
  rapidRepeatedClicks: 8,
  behaviorDrift: 12
} as const;

function createFactor(
  factor: Omit<RiskFactor, "points">,
  points: number
): RiskFactor {
  return { ...factor, points };
}

export function getRiskStatus(score: number): RiskStatus {
  if (score >= 60) {
    return "High Risk";
  }

  if (score >= 30) {
    return "Watch";
  }

  return "Normal";
}

export function calculateBehaviorDrift(
  summary: SessionSummaryInput,
  baseline: BehaviorBaseline = DEFAULT_BEHAVIOR_BASELINE
): BehaviorDriftResult {
  const deviations: string[] = [];
  const clickPace =
    summary.totalSessionDuration > 0
      ? (summary.clickCount / summary.totalSessionDuration) * 60000
      : 0;

  const [typingMin, typingMax] = baseline.typingSpeedRange;
  const [hesitationMin, hesitationMax] = baseline.hesitationRange;
  const [paceMin, paceMax] = baseline.clickPaceRange;
  const [delayMin, delayMax] = baseline.reviewDelayRange;

  if (summary.avgTypingSpeed < typingMin || summary.avgTypingSpeed > typingMax) {
    deviations.push("typing cadence outside baseline");
  }

  if (
    summary.hesitationCount < hesitationMin ||
    summary.hesitationCount > hesitationMax
  ) {
    deviations.push("hesitation pattern drifted");
  }

  if (clickPace < paceMin || clickPace > paceMax) {
    deviations.push("click pace outside expected range");
  }

  if (summary.submitDelayMs < delayMin || summary.submitDelayMs > delayMax) {
    deviations.push("review delay differs from baseline");
  }

  const active = deviations.length >= 2;

  return {
    active,
    score: active ? RISK_WEIGHTS.behaviorDrift : 0,
    deviations
  };
}

export function scoreSession(summary: SessionSummaryInput) {
  let score = 0;
  const riskFactors: RiskFactor[] = [];
  const behaviorDrift = calculateBehaviorDrift(summary);

  if (summary.unusualAmountFlag) {
    score += RISK_WEIGHTS.unusualAmountFlag;
    riskFactors.push(
      createFactor(
        {
          key: "unusual-amount",
          label: "Unusual Amount",
          description: "Transfer amount falls outside the normal range."
        },
        RISK_WEIGHTS.unusualAmountFlag
      )
    );
  }

  if (summary.erraticMouseFlag) {
    score += RISK_WEIGHTS.erraticMouseFlag;
    riskFactors.push(
      createFactor(
        {
          key: "erratic-mouse",
          label: "Erratic Mouse Movement",
          description: "Mouse path suggests uncertainty or assisted activity."
        },
        RISK_WEIGHTS.erraticMouseFlag
      )
    );
  }

  if (summary.rapidNavFlag) {
    score += RISK_WEIGHTS.rapidNavFlag;
    riskFactors.push(
      createFactor(
        {
          key: "rapid-navigation",
          label: "Rapid Navigation",
          description: "The session moved across transfer steps unusually fast."
        },
        RISK_WEIGHTS.rapidNavFlag
      )
    );
  }

  if (summary.hesitationCount >= 4) {
    score += RISK_WEIGHTS.hesitation;
    riskFactors.push(
      createFactor(
        {
          key: "hesitation",
          label: "High Hesitation",
          description: "Repeated hesitation spikes appeared before submission."
        },
        RISK_WEIGHTS.hesitation
      )
    );
  }

  if (summary.correctionCount >= 3) {
    score += RISK_WEIGHTS.correctionCount;
    riskFactors.push(
      createFactor(
        {
          key: "correction-count",
          label: "High Correction Count",
          description: "Repeated transfer edits can indicate uncertainty or drift."
        },
        RISK_WEIGHTS.correctionCount
      )
    );
  }

  if (summary.submitDelayMs <= 2500) {
    score += RISK_WEIGHTS.shortReviewSubmitDelay;
    riskFactors.push(
      createFactor(
        {
          key: "short-review-submit-delay",
          label: "Suspiciously Fast Submit",
          description: "Review-to-submit time was unusually short."
        },
        RISK_WEIGHTS.shortReviewSubmitDelay
      )
    );
  } else if (summary.submitDelayMs >= 22000) {
    score += RISK_WEIGHTS.longReviewSubmitDelay;
    riskFactors.push(
      createFactor(
        {
          key: "long-review-submit-delay",
          label: "Abnormal Review Delay",
          description: "The session lingered abnormally long before submission."
        },
        RISK_WEIGHTS.longReviewSubmitDelay
      )
    );
  }

  if (summary.sharpDirectionChanges >= 24) {
    score += RISK_WEIGHTS.sharpDirectionChanges;
    riskFactors.push(
      createFactor(
        {
          key: "sharp-direction-changes",
          label: "Sharp Direction Changes",
          description: "Mouse movement showed elevated abrupt changes."
        },
        RISK_WEIGHTS.sharpDirectionChanges
      )
    );
  }

  if (summary.rapidRepeatedClicks >= 3) {
    score += RISK_WEIGHTS.rapidRepeatedClicks;
    riskFactors.push(
      createFactor(
        {
          key: "rapid-repeated-clicks",
          label: "Rapid Repeated Clicks",
          description: "Repeated clicks happened in a compressed time window."
        },
        RISK_WEIGHTS.rapidRepeatedClicks
      )
    );
  }

  if (behaviorDrift.active) {
    score += behaviorDrift.score;
    riskFactors.push(
      createFactor(
        {
          key: "behavior-drift",
          label: "Behavior Drift",
          description: behaviorDrift.deviations.join(", ")
        },
        behaviorDrift.score
      )
    );
  }

  const cappedScore = Math.min(score, 100);

  return {
    currentRiskScore: cappedScore,
    status: getRiskStatus(cappedScore),
    riskFactors,
    topFlags: riskFactors
      .slice()
      .sort((left, right) => right.points - left.points)
      .slice(0, 3)
      .map((factor) => factor.label),
    behaviorDrift
  };
}
