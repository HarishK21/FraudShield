"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";

import { getDashboardSnapshot } from "@/lib/fraud/api";
import {
  type AlertRecord,
  type AlertStatus,
  type AnalystDecision,
  type CasePriority,
  type CaseRecord,
  type CaseStatus,
  type FraudDashboardSnapshot,
  type FraudSession
} from "@/lib/fraud/types";

type LoadingState = "loading" | "ready" | "error";

type DashboardContextValue = FraudDashboardSnapshot & {
  error: string | null;
  isRefreshing: boolean;
  loadingState: LoadingState;
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
  mode: "mock",
  updatedAt: new Date(0).toISOString()
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

function getCasePriority(score: number): CasePriority {
  if (score >= 80) {
    return "Critical";
  }

  if (score >= 60) {
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

  const mergedLocalCases = localCases.map((caseRecord) => ({
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

  const dashboardData = applyLocalState(
    snapshot,
    sessionDecisionOverrides,
    alertStatusOverrides,
    caseStatusOverrides,
    localCases
  );

  const refresh = async () => {
    if (refreshInFlightRef.current) {
      return;
    }

    refreshInFlightRef.current = true;
    setIsRefreshing(true);

    try {
      const nextSnapshot = await getDashboardSnapshot();

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
    }
  };

  useEffect(() => {
    void refresh();
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
        assignedAnalyst: "Jordan Lee",
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
  };

  const updateCaseStatus = (caseId: string, status: CaseStatus) => {
    setCaseStatusOverrides((current) => ({
      ...current,
      [caseId]: status
    }));
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
