import { scoreSession } from "@/lib/fraud/scoring";
import {
  type AlertRecord,
  type AlertSeverity,
  type CasePriority,
  type CaseRecord,
  type FraudDashboardSnapshot,
  type FraudSession,
  type SessionSummaryInput,
  type TelemetryEvent,
  type TelemetryEventType
} from "@/lib/fraud/types";

type EventSeed = {
  minuteOffset: number;
  page: string;
  eventType: TelemetryEventType;
  elementId?: string;
};

type SessionSeed = {
  sessionId: string;
  accountId: string;
  accountHolder: string;
  deviceLabel: string;
  geoRegion: string;
  analystDecision?: FraudSession["analystDecision"];
  startedMinutesAgo: number;
  summary: Omit<SessionSummaryInput, "lastEventTime">;
  eventSeeds: EventSeed[];
};

const sessionSeeds: SessionSeed[] = [
  {
    sessionId: "SES-91A3K",
    accountId: "CHK-2048",
    accountHolder: "Maya Patel",
    deviceLabel: "Chrome / macOS",
    geoRegion: "Toronto, CA",
    startedMinutesAgo: 4,
    summary: {
      totalSessionDuration: 258000,
      clickCount: 18,
      avgTypingSpeed: 212,
      correctionCount: 1,
      hesitationCount: 1,
      unusualAmountFlag: false,
      erraticMouseFlag: false,
      rapidNavFlag: false,
      submitDelayMs: 9800,
      transferAmount: 420,
      currentPage: "/transfers/review",
      submitted: false,
      timeBeforeFirstClick: 1800,
      avgDwellTime: 6100,
      focusChangeCount: 2,
      mouseTravelDistance: 1120,
      sharpDirectionChanges: 9,
      rapidRepeatedClicks: 0
    },
    eventSeeds: [
      { minuteOffset: 4, page: "/dashboard", eventType: "page_view" },
      { minuteOffset: 3.6, page: "/accounts", eventType: "nav_click", elementId: "accounts-link" },
      {
        minuteOffset: 3.3,
        page: "/accounts",
        eventType: "account_card_click",
        elementId: "checking-account"
      },
      {
        minuteOffset: 2.8,
        page: "/transfers/new",
        eventType: "transfer_field_focus",
        elementId: "recipient"
      },
      {
        minuteOffset: 2.4,
        page: "/transfers/new",
        eventType: "transfer_amount_change",
        elementId: "amount"
      },
      { minuteOffset: 1.1, page: "/transfers/review", eventType: "review_transfer" }
    ]
  },
  {
    sessionId: "SES-1L7MN",
    accountId: "SAV-1182",
    accountHolder: "Jordan Rivera",
    deviceLabel: "Safari / iPhone",
    geoRegion: "Chicago, US",
    startedMinutesAgo: 9,
    summary: {
      totalSessionDuration: 522000,
      clickCount: 27,
      avgTypingSpeed: 154,
      correctionCount: 4,
      hesitationCount: 5,
      unusualAmountFlag: false,
      erraticMouseFlag: false,
      rapidNavFlag: false,
      submitDelayMs: 26500,
      transferAmount: 1850,
      currentPage: "/transfers/review",
      submitted: false,
      timeBeforeFirstClick: 2600,
      avgDwellTime: 8700,
      focusChangeCount: 5,
      mouseTravelDistance: 1380,
      sharpDirectionChanges: 14,
      rapidRepeatedClicks: 2
    },
    eventSeeds: [
      { minuteOffset: 9, page: "/dashboard", eventType: "page_view" },
      { minuteOffset: 8.1, page: "/accounts", eventType: "nav_click", elementId: "accounts-link" },
      {
        minuteOffset: 7.8,
        page: "/transfers/new",
        eventType: "transfer_field_focus",
        elementId: "recipient"
      },
      {
        minuteOffset: 7.2,
        page: "/transfers/new",
        eventType: "transfer_amount_change",
        elementId: "amount"
      },
      {
        minuteOffset: 6.8,
        page: "/transfers/new",
        eventType: "hesitation_detected",
        elementId: "amount"
      },
      { minuteOffset: 2.5, page: "/transfers/review", eventType: "review_transfer" }
    ]
  },
  {
    sessionId: "SES-6Q2TR",
    accountId: "CHK-5029",
    accountHolder: "Lena Brooks",
    deviceLabel: "Edge / Windows",
    geoRegion: "Austin, US",
    analystDecision: "Escalated",
    startedMinutesAgo: 13,
    summary: {
      totalSessionDuration: 610000,
      clickCount: 33,
      avgTypingSpeed: 118,
      correctionCount: 5,
      hesitationCount: 6,
      unusualAmountFlag: true,
      erraticMouseFlag: true,
      rapidNavFlag: true,
      submitDelayMs: 1400,
      transferAmount: 12400,
      currentPage: "/transfers/confirmation",
      submitted: true,
      timeBeforeFirstClick: 900,
      avgDwellTime: 4200,
      focusChangeCount: 8,
      mouseTravelDistance: 3820,
      sharpDirectionChanges: 31,
      rapidRepeatedClicks: 4
    },
    eventSeeds: [
      { minuteOffset: 13, page: "/dashboard", eventType: "page_view" },
      { minuteOffset: 12.1, page: "/accounts", eventType: "nav_click", elementId: "accounts-link" },
      {
        minuteOffset: 11.5,
        page: "/transfers/new",
        eventType: "transfer_field_focus",
        elementId: "amount"
      },
      {
        minuteOffset: 11.1,
        page: "/transfers/new",
        eventType: "transfer_amount_change",
        elementId: "amount"
      },
      {
        minuteOffset: 10.8,
        page: "/transfers/new",
        eventType: "hesitation_detected",
        elementId: "amount"
      },
      { minuteOffset: 10.2, page: "/transfers/review", eventType: "review_transfer" },
      { minuteOffset: 10.17, page: "/transfers/confirmation", eventType: "submit_transfer" }
    ]
  },
  {
    sessionId: "SES-4V9PD",
    accountId: "CHK-8841",
    accountHolder: "Amir Hassan",
    deviceLabel: "Chrome / Android",
    geoRegion: "Vancouver, CA",
    startedMinutesAgo: 7,
    summary: {
      totalSessionDuration: 432000,
      clickCount: 31,
      avgTypingSpeed: 286,
      correctionCount: 2,
      hesitationCount: 1,
      unusualAmountFlag: false,
      erraticMouseFlag: false,
      rapidNavFlag: true,
      submitDelayMs: 3200,
      transferAmount: 5400,
      currentPage: "/transfers/review",
      submitted: false,
      timeBeforeFirstClick: 1200,
      avgDwellTime: 5100,
      focusChangeCount: 3,
      mouseTravelDistance: 1490,
      sharpDirectionChanges: 19,
      rapidRepeatedClicks: 1
    },
    eventSeeds: [
      { minuteOffset: 7, page: "/dashboard", eventType: "page_view" },
      { minuteOffset: 6.3, page: "/accounts", eventType: "nav_click", elementId: "payees-link" },
      { minuteOffset: 5.9, page: "/transfers/new", eventType: "nav_click", elementId: "new-transfer" },
      {
        minuteOffset: 5.4,
        page: "/transfers/new",
        eventType: "transfer_field_focus",
        elementId: "amount"
      },
      {
        minuteOffset: 4.9,
        page: "/transfers/new",
        eventType: "transfer_amount_change",
        elementId: "amount"
      },
      { minuteOffset: 2.2, page: "/transfers/review", eventType: "review_transfer" }
    ]
  },
  {
    sessionId: "SES-8W5YU",
    accountId: "BUS-3002",
    accountHolder: "Northline Foods",
    deviceLabel: "Firefox / Linux",
    geoRegion: "New York, US",
    analystDecision: "Review",
    startedMinutesAgo: 22,
    summary: {
      totalSessionDuration: 940000,
      clickCount: 41,
      avgTypingSpeed: 132,
      correctionCount: 6,
      hesitationCount: 7,
      unusualAmountFlag: true,
      erraticMouseFlag: false,
      rapidNavFlag: false,
      submitDelayMs: 28600,
      transferAmount: 26800,
      currentPage: "/transfers/review",
      submitted: false,
      timeBeforeFirstClick: 3400,
      avgDwellTime: 10100,
      focusChangeCount: 9,
      mouseTravelDistance: 2510,
      sharpDirectionChanges: 22,
      rapidRepeatedClicks: 3
    },
    eventSeeds: [
      { minuteOffset: 22, page: "/dashboard", eventType: "page_view" },
      { minuteOffset: 21, page: "/transfers/new", eventType: "nav_click", elementId: "send-money" },
      {
        minuteOffset: 20.6,
        page: "/transfers/new",
        eventType: "transfer_field_focus",
        elementId: "recipient"
      },
      {
        minuteOffset: 20.1,
        page: "/transfers/new",
        eventType: "transfer_amount_change",
        elementId: "amount"
      },
      {
        minuteOffset: 18.4,
        page: "/transfers/new",
        eventType: "hesitation_detected",
        elementId: "amount"
      },
      { minuteOffset: 6.2, page: "/transfers/review", eventType: "review_transfer" }
    ]
  },
  {
    sessionId: "SES-3H8CK",
    accountId: "CHK-6711",
    accountHolder: "Nina Kim",
    deviceLabel: "Chrome / Windows",
    geoRegion: "Seattle, US",
    startedMinutesAgo: 3,
    summary: {
      totalSessionDuration: 181000,
      clickCount: 14,
      avgTypingSpeed: 226,
      correctionCount: 0,
      hesitationCount: 0,
      unusualAmountFlag: false,
      erraticMouseFlag: false,
      rapidNavFlag: false,
      submitDelayMs: 7600,
      transferAmount: 95,
      currentPage: "/accounts",
      submitted: false,
      timeBeforeFirstClick: 1500,
      avgDwellTime: 4300,
      focusChangeCount: 1,
      mouseTravelDistance: 860,
      sharpDirectionChanges: 7,
      rapidRepeatedClicks: 0
    },
    eventSeeds: [
      { minuteOffset: 3, page: "/dashboard", eventType: "page_view" },
      { minuteOffset: 2.4, page: "/accounts", eventType: "nav_click", elementId: "accounts-link" },
      {
        minuteOffset: 1.8,
        page: "/accounts",
        eventType: "account_card_click",
        elementId: "savings-account"
      }
    ]
  },
  {
    sessionId: "SES-5X0DF",
    accountId: "CHK-9146",
    accountHolder: "Omar Castillo",
    deviceLabel: "Safari / macOS",
    geoRegion: "Denver, US",
    startedMinutesAgo: 11,
    summary: {
      totalSessionDuration: 574000,
      clickCount: 29,
      avgTypingSpeed: 169,
      correctionCount: 3,
      hesitationCount: 4,
      unusualAmountFlag: false,
      erraticMouseFlag: true,
      rapidNavFlag: false,
      submitDelayMs: 12300,
      transferAmount: 3150,
      currentPage: "/transfers/review",
      submitted: false,
      timeBeforeFirstClick: 2800,
      avgDwellTime: 7300,
      focusChangeCount: 4,
      mouseTravelDistance: 3140,
      sharpDirectionChanges: 28,
      rapidRepeatedClicks: 1
    },
    eventSeeds: [
      { minuteOffset: 11, page: "/dashboard", eventType: "page_view" },
      { minuteOffset: 10.5, page: "/transfers/new", eventType: "nav_click", elementId: "new-transfer" },
      {
        minuteOffset: 9.8,
        page: "/transfers/new",
        eventType: "transfer_field_focus",
        elementId: "recipient"
      },
      {
        minuteOffset: 9.1,
        page: "/transfers/new",
        eventType: "transfer_amount_change",
        elementId: "amount"
      },
      {
        minuteOffset: 8.9,
        page: "/transfers/new",
        eventType: "hesitation_detected",
        elementId: "amount"
      },
      { minuteOffset: 2.8, page: "/transfers/review", eventType: "review_transfer" }
    ]
  },
  {
    sessionId: "SES-7R4QJ",
    accountId: "BUS-4419",
    accountHolder: "Harbor Point Studio",
    deviceLabel: "Chrome / Windows",
    geoRegion: "Boston, US",
    analystDecision: "Pending",
    startedMinutesAgo: 17,
    summary: {
      totalSessionDuration: 688000,
      clickCount: 36,
      avgTypingSpeed: 308,
      correctionCount: 4,
      hesitationCount: 2,
      unusualAmountFlag: false,
      erraticMouseFlag: false,
      rapidNavFlag: true,
      submitDelayMs: 1900,
      transferAmount: 8200,
      currentPage: "/transfers/confirmation",
      submitted: true,
      timeBeforeFirstClick: 1100,
      avgDwellTime: 4600,
      focusChangeCount: 6,
      mouseTravelDistance: 1760,
      sharpDirectionChanges: 27,
      rapidRepeatedClicks: 4
    },
    eventSeeds: [
      { minuteOffset: 17, page: "/dashboard", eventType: "page_view" },
      { minuteOffset: 16.2, page: "/transfers/new", eventType: "nav_click", elementId: "send-money" },
      {
        minuteOffset: 15.5,
        page: "/transfers/new",
        eventType: "transfer_field_focus",
        elementId: "amount"
      },
      {
        minuteOffset: 15.1,
        page: "/transfers/new",
        eventType: "transfer_amount_change",
        elementId: "amount"
      },
      { minuteOffset: 14.4, page: "/transfers/review", eventType: "review_transfer" },
      { minuteOffset: 14.37, page: "/transfers/confirmation", eventType: "submit_transfer" }
    ]
  }
];

const analystPool = ["Avery Chen", "Jordan Lee", "Taylor Morgan", "Sam Ortiz"];

function toIsoFromMinutes(minutesAgo: number, cycle = 0) {
  const adjustment = cycle % 2 === 0 ? 0 : 15;
  return new Date(Date.now() - minutesAgo * 60_000 + adjustment * 1000).toISOString();
}

function buildTelemetryEvent(
  session: SessionSeed,
  eventSeed: EventSeed,
  index: number,
  cycle = 0
): TelemetryEvent {
  const eventTimestamp = toIsoFromMinutes(eventSeed.minuteOffset, cycle);

  return {
    id: `${session.sessionId}-evt-${index + 1}`,
    sessionId: session.sessionId,
    timestamp: eventTimestamp,
    page: eventSeed.page,
    eventType: eventSeed.eventType,
    elementId: eventSeed.elementId,
    dwellTime: session.summary.avgDwellTime,
    timeBeforeFirstClick:
      index === 0 ? session.summary.timeBeforeFirstClick : undefined,
    clickSequence:
      eventSeed.eventType === "nav_click"
        ? ["dashboard", "accounts", "transfers", "review"]
        : undefined,
    mouseTravelDistance: session.summary.mouseTravelDistance,
    sharpDirectionChanges: session.summary.sharpDirectionChanges,
    hesitationCount: session.summary.hesitationCount,
    avgTypingSpeed: session.summary.avgTypingSpeed,
    correctionCount: session.summary.correctionCount,
    focusChangeCount: session.summary.focusChangeCount,
    transferAmount: session.summary.transferAmount,
    unusualAmountFlag: session.summary.unusualAmountFlag,
    rapidNavFlag: session.summary.rapidNavFlag,
    rapidRepeatedClicks: session.summary.rapidRepeatedClicks,
    reviewToSubmitDelayMs: session.summary.submitDelayMs
  };
}

function buildSession(seed: SessionSeed, cycle = 0): FraudSession {
  const events = seed.eventSeeds
    .map((eventSeed, index) => buildTelemetryEvent(seed, eventSeed, index, cycle))
    .sort((left, right) => left.timestamp.localeCompare(right.timestamp));

  const summaryInput: SessionSummaryInput = {
    ...seed.summary,
    lastEventTime:
      events.at(-1)?.timestamp ?? toIsoFromMinutes(seed.startedMinutesAgo, cycle)
  };
  const scoredSummary = scoreSession(summaryInput);

  return {
    sessionId: seed.sessionId,
    accountId: seed.accountId,
    accountHolder: seed.accountHolder,
    deviceLabel: seed.deviceLabel,
    geoRegion: seed.geoRegion,
    analystDecision: seed.analystDecision ?? "Pending",
    events,
    summary: {
      ...summaryInput,
      ...scoredSummary
    }
  };
}

function getSeverityForScore(score: number): AlertSeverity {
  if (score >= 60) {
    return "High";
  }

  if (score >= 30) {
    return "Medium";
  }

  return "Low";
}

function priorityFromScore(score: number): CasePriority {
  if (score >= 80) {
    return "Critical";
  }

  if (score >= 60) {
    return "High";
  }

  return "Medium";
}

function buildAlerts(sessions: FraudSession[], cycle = 0) {
  const alerts: AlertRecord[] = [];

  sessions.forEach((session, sessionIndex) => {
    const topFactors = session.summary.riskFactors.slice(0, 2);

    topFactors.forEach((factor, factorIndex) => {
      alerts.push({
        id: `ALT-${sessionIndex + 1}${factorIndex + 1}${session.sessionId.slice(-2)}`,
        sessionId: session.sessionId,
        severity: getSeverityForScore(session.summary.currentRiskScore),
        reason: factor.label,
        timestamp: toIsoFromMinutes(
          sessionIndex * 38 + factorIndex * 17 + 12,
          cycle
        ),
        status:
          session.analystDecision === "Safe"
            ? "Resolved"
            : factorIndex === 0
              ? "Open"
              : "Acknowledged"
      });
    });
  });

  alerts.push({
    id: "ALT-9001",
    sessionId: "SES-4V9PD",
    severity: "Medium",
    reason: "Navigation drift",
    timestamp: toIsoFromMinutes(86, cycle),
    status: "Open"
  });
  alerts.push({
    id: "ALT-9002",
    sessionId: "SES-5X0DF",
    severity: "Medium",
    reason: "Abnormal interaction pattern",
    timestamp: toIsoFromMinutes(122, cycle),
    status: "Acknowledged"
  });
  alerts.push({
    id: "ALT-9003",
    sessionId: "SES-7R4QJ",
    severity: "High",
    reason: "Suspiciously fast submit after review",
    timestamp: toIsoFromMinutes(164, cycle),
    status: "Open"
  });

  return alerts.sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

function buildCases(sessions: FraudSession[], cycle = 0): CaseRecord[] {
  const caseSessions = sessions
    .filter(
      (session) =>
        session.summary.currentRiskScore >= 60 ||
        session.analystDecision === "Escalated"
    )
    .slice(0, 4);

  return caseSessions.map((session, index) => ({
    id: `CASE-${420 + index}`,
    sessionId: session.sessionId,
    priority: priorityFromScore(session.summary.currentRiskScore),
    assignedAnalyst: analystPool[index % analystPool.length],
    createdTime: toIsoFromMinutes(25 + index * 34, cycle),
    status: index === 0 ? "Investigating" : index === 1 ? "Open" : "Resolved",
    summary: `${session.summary.topFlags.join(", ")} detected on ${session.summary.currentPage}.`
  }));
}

export function buildMockFraudSnapshot(cycle = 0): FraudDashboardSnapshot {
  const sessions = sessionSeeds.map((seed) => buildSession(seed, cycle));
  const alerts = buildAlerts(sessions, cycle);
  const cases = buildCases(sessions, cycle);

  return {
    sessions,
    alerts,
    cases,
    mode: "mock",
    updatedAt: new Date().toISOString()
  };
}

export const mockFraudSnapshot = buildMockFraudSnapshot();
