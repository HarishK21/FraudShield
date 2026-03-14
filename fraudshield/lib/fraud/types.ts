export type TelemetryEventType =
  | "page_view"
  | "nav_click"
  | "account_card_click"
  | "transfer_field_focus"
  | "transfer_amount_change"
  | "hesitation_detected"
  | "review_transfer"
  | "submit_transfer";

export type RiskStatus = "Normal" | "Watch" | "High Risk";

export type AlertSeverity = "Low" | "Medium" | "High";

export type AlertStatus = "Open" | "Acknowledged" | "Resolved";

export type CasePriority = "Medium" | "High" | "Critical";

export type CaseStatus = "Open" | "Investigating" | "Resolved";

export type AnalystDecision = "Pending" | "Safe" | "Review" | "Escalated";

export type RiskFactorKey =
  | "unusual-amount"
  | "erratic-mouse"
  | "rapid-navigation"
  | "hesitation"
  | "correction-count"
  | "short-review-submit-delay"
  | "long-review-submit-delay"
  | "sharp-direction-changes"
  | "rapid-repeated-clicks"
  | "behavior-drift";

export interface TelemetryEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  page: string;
  eventType: TelemetryEventType;
  elementId?: string;
  dwellTime?: number;
  timeBeforeFirstClick?: number;
  clickSequence?: string[];
  mouseTravelDistance?: number;
  sharpDirectionChanges?: number;
  hesitationCount?: number;
  avgTypingSpeed?: number;
  correctionCount?: number;
  focusChangeCount?: number;
  transferAmount?: number;
  unusualAmountFlag?: boolean;
  rapidNavFlag?: boolean;
  rapidRepeatedClicks?: number;
  reviewToSubmitDelayMs?: number;
}

export interface SessionSummaryInput {
  totalSessionDuration: number;
  clickCount: number;
  avgTypingSpeed: number;
  correctionCount: number;
  hesitationCount: number;
  unusualAmountFlag: boolean;
  erraticMouseFlag: boolean;
  rapidNavFlag: boolean;
  submitDelayMs: number;
  transferAmount: number;
  currentPage: string;
  lastEventTime: string;
  submitted: boolean;
  timeBeforeFirstClick: number;
  avgDwellTime: number;
  focusChangeCount: number;
  mouseTravelDistance: number;
  sharpDirectionChanges: number;
  rapidRepeatedClicks: number;
}

export interface BehaviorBaseline {
  typingSpeedRange: [number, number];
  hesitationRange: [number, number];
  clickPaceRange: [number, number];
  reviewDelayRange: [number, number];
}

export interface BehaviorDriftResult {
  active: boolean;
  score: number;
  deviations: string[];
}

export interface RiskFactor {
  key: RiskFactorKey;
  label: string;
  points: number;
  description: string;
}

export interface SessionSummary extends SessionSummaryInput {
  currentRiskScore: number;
  status: RiskStatus;
  riskFactors: RiskFactor[];
  topFlags: string[];
  behaviorDrift: BehaviorDriftResult;
}

export interface FraudSession {
  sessionId: string;
  accountId: string;
  accountHolder: string;
  deviceLabel: string;
  geoRegion: string;
  analystDecision: AnalystDecision;
  events: TelemetryEvent[];
  summary: SessionSummary;
}

export interface AlertRecord {
  id: string;
  sessionId: string;
  severity: AlertSeverity;
  reason: string;
  timestamp: string;
  status: AlertStatus;
}

export interface CaseRecord {
  id: string;
  sessionId: string;
  priority: CasePriority;
  assignedAnalyst: string;
  createdTime: string;
  status: CaseStatus;
  summary: string;
}

export interface OverviewMetricCard {
  label: string;
  value: string;
  change: string;
  tone: "neutral" | "warning" | "critical" | "success";
}

export interface RiskDistributionPoint {
  label: string;
  count: number;
}

export interface AlertsOverTimePoint {
  label: string;
  low: number;
  medium: number;
  high: number;
  total: number;
}

export interface OverviewMetrics {
  activeSessions: number;
  flaggedSessions: number;
  highRiskTransfers: number;
  averageRiskScore: number;
  riskDistribution: RiskDistributionPoint[];
  alertsOverTime: AlertsOverTimePoint[];
  recentFlaggedSessions: FraudSession[];
  recentAlerts: AlertRecord[];
}

export type DataSourceMode = "mock" | "live";

export interface FraudDashboardSnapshot {
  sessions: FraudSession[];
  alerts: AlertRecord[];
  cases: CaseRecord[];
  mode: DataSourceMode;
  updatedAt: string;
}
