import {
  type AlertRecord,
  type CaseRecord,
  type FraudDashboardSnapshot,
  type FraudMonitoringSnapshot,
  type FraudSession,
  type SessionFilterCriteria
} from "@/lib/fraud/types";
import { buildMockFraudSnapshot } from "@/lib/fraud/mock-data";
import { toFilterSearchParams } from "@/lib/fraud/filter-query";

let mockCycle = 0;

const fraudApiBaseUrl = process.env.NEXT_PUBLIC_FRAUD_API_BASE_URL;
const allowMockFallback =
  process.env.NEXT_PUBLIC_FRAUD_API_ALLOW_MOCK === "true";

function getCandidateUrls(
  resource: "sessions" | "alerts" | "cases" | "metrics",
  filters?: SessionFilterCriteria
) {
  const query = toFilterSearchParams(filters).toString();
  const withQuery = (baseUrl: string) =>
    query ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${query}` : baseUrl;

  if (fraudApiBaseUrl) {
    return [
      withQuery(`${fraudApiBaseUrl.replace(/\/$/, "")}/${resource}`),
      withQuery(`${fraudApiBaseUrl.replace(/\/$/, "")}/api/fraud/${resource}`)
    ];
  }

  return [withQuery(`/api/fraud/${resource}`)];
}

async function fetchFromCandidates<T>(
  resource: "sessions" | "alerts" | "cases" | "metrics",
  filters?: SessionFilterCriteria
) {
  for (const url of getCandidateUrls(resource, filters)) {
    try {
      const response = await fetch(url, {
        cache: "no-store"
      });

      if (response.ok) {
        return (await response.json()) as T;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function getMockSnapshot() {
  mockCycle += 1;
  return buildMockFraudSnapshot(mockCycle);
}

function sessionMatchesFilters(session: FraudSession, filters?: SessionFilterCriteria) {
  if (!filters) {
    return true;
  }

  if (filters.userId && session.userId !== filters.userId) {
    return false;
  }

  if (filters.testRunId && session.testRunId !== filters.testRunId) {
    return false;
  }

  if (filters.agentId && session.agentId !== filters.agentId) {
    return false;
  }

  if (filters.scenarioId && session.scenarioId !== filters.scenarioId) {
    return false;
  }

  return true;
}

function applyFiltersToSnapshot(
  snapshot: FraudDashboardSnapshot,
  filters?: SessionFilterCriteria
) {
  if (!filters) {
    return snapshot;
  }

  const sessions = snapshot.sessions
    .filter((session) => sessionMatchesFilters(session, filters))
    .sort((left, right) =>
      right.summary.lastEventTime.localeCompare(left.summary.lastEventTime)
    );
  const limitedSessions =
    filters.limit && filters.limit > 0 ? sessions.slice(0, filters.limit) : sessions;
  const allowedSessionIds = new Set(
    limitedSessions.map((session) => session.sessionId)
  );

  return {
    ...snapshot,
    sessions: limitedSessions,
    alerts: snapshot.alerts.filter((alert) => allowedSessionIds.has(alert.sessionId)),
    cases: snapshot.cases.filter((caseRecord) =>
      allowedSessionIds.has(caseRecord.sessionId)
    )
  };
}

export async function getSessions(
  filters?: SessionFilterCriteria
): Promise<{
  data: FraudSession[];
  mode: FraudDashboardSnapshot["mode"];
}> {
  const liveData = await fetchFromCandidates<FraudSession[]>("sessions", filters);

  if (liveData) {
    return { data: liveData, mode: "live" };
  }

  if (allowMockFallback) {
    const snapshot = applyFiltersToSnapshot(getMockSnapshot(), filters);
    return { data: snapshot.sessions, mode: "mock" };
  }

  return { data: [], mode: "live" };
}

export async function getAlerts(
  filters?: SessionFilterCriteria
): Promise<{
  data: AlertRecord[];
  mode: FraudDashboardSnapshot["mode"];
}> {
  const liveData = await fetchFromCandidates<AlertRecord[]>("alerts", filters);

  if (liveData) {
    return { data: liveData, mode: "live" };
  }

  if (allowMockFallback) {
    const snapshot = applyFiltersToSnapshot(getMockSnapshot(), filters);
    return { data: snapshot.alerts, mode: "mock" };
  }

  return { data: [], mode: "live" };
}

export async function getCases(
  filters?: SessionFilterCriteria
): Promise<{
  data: CaseRecord[];
  mode: FraudDashboardSnapshot["mode"];
}> {
  const liveData = await fetchFromCandidates<CaseRecord[]>("cases", filters);

  if (liveData) {
    return { data: liveData, mode: "live" };
  }

  if (allowMockFallback) {
    const snapshot = applyFiltersToSnapshot(getMockSnapshot(), filters);
    return { data: snapshot.cases, mode: "mock" };
  }

  return { data: [], mode: "live" };
}

export async function getSessionById(
  sessionId: string,
  filters?: SessionFilterCriteria
): Promise<{
  data: FraudSession | null;
  mode: FraudDashboardSnapshot["mode"];
}> {
  const { data, mode } = await getSessions(filters);

  return {
    data: data.find((session) => session.sessionId === sessionId) ?? null,
    mode
  };
}

export async function getDashboardSnapshot(
  filters?: SessionFilterCriteria
): Promise<FraudDashboardSnapshot> {
  const [sessionsResult, alertsResult, casesResult, monitoringResult] =
    await Promise.all([
    fetchFromCandidates<FraudSession[]>("sessions", filters),
    fetchFromCandidates<AlertRecord[]>("alerts", filters),
    fetchFromCandidates<CaseRecord[]>("cases", filters),
    fetchFromCandidates<FraudMonitoringSnapshot>("metrics", filters)
  ]);

  if (sessionsResult && alertsResult && casesResult) {
    return {
      sessions: sessionsResult,
      alerts: alertsResult,
      cases: casesResult,
      monitoring: monitoringResult ?? null,
      mode: "live",
      updatedAt: new Date().toISOString()
    };
  }

  if (allowMockFallback) {
    return applyFiltersToSnapshot(getMockSnapshot(), filters);
  }

  return {
    sessions: sessionsResult ?? [],
    alerts: alertsResult ?? [],
    cases: casesResult ?? [],
    monitoring: monitoringResult ?? null,
    mode: "live",
    updatedAt: new Date().toISOString()
  };
}
