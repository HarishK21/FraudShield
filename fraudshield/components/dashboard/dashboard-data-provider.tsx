"use client";

import {
  useCallback,
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

import { getDashboardSnapshot } from "@/lib/fraud/api";
import {
  type AlertRecord,
  type AlertStatus,
  type AnalystDecision,
  type AnalystOutcome,
  type CasePriority,
  type CaseRecord,
  type CaseStatus,
  type FraudDashboardSnapshot,
  type FraudSession,
  type SessionFilterCriteria
} from "@/lib/fraud/types";

type LoadingState = "loading" | "ready" | "error";

type DashboardContextValue = FraudDashboardSnapshot & {
  error: string | null;
  isRefreshing: boolean;
  loadingState: LoadingState;
  filters: SessionFilterCriteria;
  filterOptions: {
    userIds: string[];
    testRunIds: string[];
    agentIds: string[];
    scenarioIds: string[];
  };
  setFilters: (next: Partial<SessionFilterCriteria>) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;
  markSessionSafe: (sessionId: string) => void;
  flagSessionForReview: (sessionId: string) => void;
  escalateSessionCase: (sessionId: string) => void;
  updateCaseStatus: (caseId: string, status: CaseStatus) => void;
  getSession: (sessionId: string) => FraudSession | null;
};

const emptySnapshot: FraudDashboardSnapshot = {
  sessions: [],
  alerts: [],
  cases: [],
  monitoring: null,
  mode: "live",
  updatedAt: new Date(0).toISOString()
};

const DashboardContext = createContext<DashboardContextValue | null>(null);
const defaultAnalyst =
  (process.env.NEXT_PUBLIC_DEFAULT_ANALYST ?? "").trim() || "Unassigned";

function normalizeFilterValue(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
}

function uniqueSorted(values: Array<string | undefined>) {
  return [...new Set(values.filter(Boolean) as string[])].sort((left, right) =>
    left.localeCompare(right)
  );
}

function getCasePriority(score: number): CasePriority {
  if (score >= 75) {
    return "Critical";
  }

  if (score >= 55) {
    return "High";
  }

  return "Medium";
}

function applyLocalState(
  snapshot: FraudDashboardSnapshot,
  sessionDecisionOverrides: Record<string, AnalystDecision>,
  alertStatusOverrides: Record<string, AlertStatus>,
  caseStatusOverrides: Record<string, CaseStatus>,
  localCases: CaseRecord[]
): FraudDashboardSnapshot {
  const sessions = snapshot.sessions.map((session) => ({
    ...session,
    analystDecision:
      sessionDecisionOverrides[session.sessionId] ?? session.analystDecision
  }));

  const alerts = snapshot.alerts.map((alert) => ({
    ...alert,
    status: alertStatusOverrides[alert.id] ?? alert.status
  }));

  const remoteCases = snapshot.cases.map((caseRecord) => ({
    ...caseRecord,
    status: caseStatusOverrides[caseRecord.id] ?? caseRecord.status
  }));
  const sessionIds = new Set(sessions.map((session) => session.sessionId));

  const mergedLocalCases = localCases
    .filter((caseRecord) => sessionIds.has(caseRecord.sessionId))
    .map((caseRecord) => ({
      ...caseRecord,
      status: caseStatusOverrides[caseRecord.id] ?? caseRecord.status
    }));

  const cases = [...remoteCases, ...mergedLocalCases].sort((left, right) =>
    right.createdTime.localeCompare(left.createdTime)
  );

  return {
    ...snapshot,
    sessions,
    alerts,
    cases
  };
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<FraudDashboardSnapshot>(emptySnapshot);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFiltersState] = useState<SessionFilterCriteria>({});
  const [sessionDecisionOverrides, setSessionDecisionOverrides] = useState<
    Record<string, AnalystDecision>
  >({});
  const [alertStatusOverrides, setAlertStatusOverrides] = useState<
    Record<string, AlertStatus>
  >({});
  const [caseStatusOverrides, setCaseStatusOverrides] = useState<
    Record<string, CaseStatus>
  >({});
  const [localCases, setLocalCases] = useState<CaseRecord[]>([]);
  const refreshInFlightRef = useRef(false);
  const pendingRefreshRef = useRef(false);
  const filtersRef = useRef<SessionFilterCriteria>(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const dashboardData = applyLocalState(
    snapshot,
    sessionDecisionOverrides,
    alertStatusOverrides,
    caseStatusOverrides,
    localCases
  );
  const filterOptions = useMemo(
    () => ({
      userIds: uniqueSorted(snapshot.sessions.map((session) => session.userId)),
      testRunIds: uniqueSorted(
        snapshot.sessions.map((session) => session.testRunId)
      ),
      agentIds: uniqueSorted(snapshot.sessions.map((session) => session.agentId)),
      scenarioIds: uniqueSorted(
        snapshot.sessions.map((session) => session.scenarioId)
      )
    }),
    [snapshot.sessions]
  );

  const persistFeedback = useCallback(
    async (payload: {
      sessionId: string;
      analystDecision?: AnalystDecision;
      outcome?: AnalystOutcome;
      caseStatus?: CaseStatus;
      notes?: string;
    }) => {
      try {
        await fetch("/api/fraud/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.info("[FraudShield] Unable to persist feedback", payload, error);
        }
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    if (refreshInFlightRef.current) {
      pendingRefreshRef.current = true;
      return;
    }

    refreshInFlightRef.current = true;
    setIsRefreshing(true);

    try {
      const nextSnapshot = await getDashboardSnapshot(filtersRef.current);

      startTransition(() => {
        setSnapshot(nextSnapshot);
        setLoadingState("ready");
        setError(null);
      });
    } catch {
      setLoadingState("error");
      setError("Unable to load telemetry feed right now.");
    } finally {
      refreshInFlightRef.current = false;
      setIsRefreshing(false);
      if (pendingRefreshRef.current) {
        pendingRefreshRef.current = false;
        void refresh();
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [filters, refresh]);

  const setFilters = useCallback((next: Partial<SessionFilterCriteria>) => {
    setFiltersState((current) => {
      const hasUserId = Object.prototype.hasOwnProperty.call(next, "userId");
      const hasRunId = Object.prototype.hasOwnProperty.call(next, "testRunId");
      const hasAgentId = Object.prototype.hasOwnProperty.call(next, "agentId");
      const hasScenarioId = Object.prototype.hasOwnProperty.call(next, "scenarioId");
      const candidate: SessionFilterCriteria = {
        userId: hasUserId ? normalizeFilterValue(next.userId) : current.userId,
        testRunId: hasRunId
          ? normalizeFilterValue(next.testRunId)
          : current.testRunId,
        agentId: hasAgentId ? normalizeFilterValue(next.agentId) : current.agentId,
        scenarioId: hasScenarioId
          ? normalizeFilterValue(next.scenarioId)
          : current.scenarioId
      };

      if (
        candidate.userId === current.userId &&
        candidate.testRunId === current.testRunId &&
        candidate.agentId === current.agentId &&
        candidate.scenarioId === current.scenarioId
      ) {
        return current;
      }

      return candidate;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const markSessionSafe = (sessionId: string) => {
    setSessionDecisionOverrides((current) => ({
      ...current,
      [sessionId]: "Safe"
    }));

    setAlertStatusOverrides((current) => {
      const next = { ...current };

      dashboardData.alerts
        .filter((alert) => alert.sessionId === sessionId)
        .forEach((alert) => {
          next[alert.id] = "Resolved";
        });

      return next;
    });

    setCaseStatusOverrides((current) => {
      const next = { ...current };

      dashboardData.cases
        .filter((caseRecord) => caseRecord.sessionId === sessionId)
        .forEach((caseRecord) => {
          next[caseRecord.id] = "Resolved";
        });

      return next;
    });

    void persistFeedback({
      sessionId,
      analystDecision: "Safe",
      outcome: "legit",
      caseStatus: "Resolved"
    });
  };

  const flagSessionForReview = (sessionId: string) => {
    setSessionDecisionOverrides((current) => ({
      ...current,
      [sessionId]: "Review"
    }));

    setAlertStatusOverrides((current) => {
      const next = { ...current };

      dashboardData.alerts
        .filter((alert) => alert.sessionId === sessionId)
        .forEach((alert) => {
          next[alert.id] = "Acknowledged";
        });

      return next;
    });

    void persistFeedback({
      sessionId,
      analystDecision: "Review",
      outcome: "unresolved"
    });
  };

  const escalateSessionCase = (sessionId: string) => {
    const session = dashboardData.sessions.find(
      (currentSession) => currentSession.sessionId === sessionId
    );

    if (!session) {
      return;
    }

    setSessionDecisionOverrides((current) => ({
      ...current,
      [sessionId]: "Escalated"
    }));

    const existingCase = dashboardData.cases.find(
      (caseRecord) => caseRecord.sessionId === sessionId
    );

    if (existingCase) {
      setCaseStatusOverrides((current) => ({
        ...current,
        [existingCase.id]: "Investigating"
      }));
    } else {
      const newCase: CaseRecord = {
        id: `CASE-${Date.now().toString().slice(-4)}`,
        sessionId,
        priority: getCasePriority(session.summary.currentRiskScore),
        assignedAnalyst: defaultAnalyst,
        createdTime: new Date().toISOString(),
        status: "Open",
        summary: `Escalated from session review for ${session.summary.topFlags.join(", ")}.`
      };

      setLocalCases((current) => [newCase, ...current]);
    }

    setAlertStatusOverrides((current) => {
      const next = { ...current };

      dashboardData.alerts
        .filter((alert) => alert.sessionId === sessionId)
        .forEach((alert) => {
          next[alert.id] = "Acknowledged";
        });

      return next;
    });

    void persistFeedback({
      sessionId,
      analystDecision: "Escalated",
      outcome: "unresolved",
      caseStatus: existingCase ? "Investigating" : "Open"
    });
  };

  const updateCaseStatus = (caseId: string, status: CaseStatus) => {
    setCaseStatusOverrides((current) => ({
      ...current,
      [caseId]: status
    }));

    const caseRecord = dashboardData.cases.find((candidate) => candidate.id === caseId);
    if (!caseRecord) {
      return;
    }

    const session =
      dashboardData.sessions.find(
        (candidate) => candidate.sessionId === caseRecord.sessionId
      ) ?? null;
    const analystDecision =
      sessionDecisionOverrides[caseRecord.sessionId] ??
      session?.analystDecision ??
      "Pending";
    const outcome: AnalystOutcome =
      status === "Resolved"
        ? analystDecision === "Safe"
          ? "legit"
          : analystDecision === "Escalated"
            ? "fraud"
            : "unresolved"
        : "unresolved";

    void persistFeedback({
      sessionId: caseRecord.sessionId,
      analystDecision,
      outcome,
      caseStatus: status
    });
  };

  const getSession = (sessionId: string) =>
    dashboardData.sessions.find((session) => session.sessionId === sessionId) ?? null;

  return (
    <DashboardContext.Provider
      value={{
        ...dashboardData,
        error,
        isRefreshing,
        loadingState,
        filters,
        filterOptions,
        setFilters,
        clearFilters,
        refresh,
        markSessionSafe,
        flagSessionForReview,
        escalateSessionCase,
        updateCaseStatus,
        getSession
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useFraudDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useFraudDashboard must be used within DashboardDataProvider");
  }

  return context;
}

export function useDashboardPolling(enabled: boolean, intervalMs = 5000) {
  const { refresh } = useFraudDashboard();
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshRef.current();
      }
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs]);
}
