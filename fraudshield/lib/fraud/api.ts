import {
  type AlertRecord,
  type CaseRecord,
  type FraudDashboardSnapshot,
  type FraudMonitoringSnapshot,
  type FraudSession
} from "@/lib/fraud/types";
import { buildMockFraudSnapshot } from "@/lib/fraud/mock-data";

let mockCycle = 0;

const fraudApiBaseUrl = process.env.NEXT_PUBLIC_FRAUD_API_BASE_URL;
const allowMockFallback =
  process.env.NEXT_PUBLIC_FRAUD_API_ALLOW_MOCK === "true";

function getCandidateUrls(
  resource: "sessions" | "alerts" | "cases" | "metrics"
) {
  if (fraudApiBaseUrl) {
    return [
      `${fraudApiBaseUrl.replace(/\/$/, "")}/${resource}`,
      `${fraudApiBaseUrl.replace(/\/$/, "")}/api/fraud/${resource}`
    ];
  }

  return [`/api/fraud/${resource}`];
}

async function fetchFromCandidates<T>(
  resource: "sessions" | "alerts" | "cases" | "metrics"
) {
  for (const url of getCandidateUrls(resource)) {
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

export async function getSessions(): Promise<{
  data: FraudSession[];
  mode: FraudDashboardSnapshot["mode"];
}> {
  const liveData = await fetchFromCandidates<FraudSession[]>("sessions");

  if (liveData) {
    return { data: liveData, mode: "live" };
  }

  if (allowMockFallback) {
    return { data: getMockSnapshot().sessions, mode: "mock" };
  }

  return { data: [], mode: "live" };
}

export async function getAlerts(): Promise<{
  data: AlertRecord[];
  mode: FraudDashboardSnapshot["mode"];
}> {
  const liveData = await fetchFromCandidates<AlertRecord[]>("alerts");

  if (liveData) {
    return { data: liveData, mode: "live" };
  }

  if (allowMockFallback) {
    return { data: getMockSnapshot().alerts, mode: "mock" };
  }

  return { data: [], mode: "live" };
}

export async function getCases(): Promise<{
  data: CaseRecord[];
  mode: FraudDashboardSnapshot["mode"];
}> {
  const liveData = await fetchFromCandidates<CaseRecord[]>("cases");

  if (liveData) {
    return { data: liveData, mode: "live" };
  }

  if (allowMockFallback) {
    return { data: getMockSnapshot().cases, mode: "mock" };
  }

  return { data: [], mode: "live" };
}

export async function getSessionById(sessionId: string): Promise<{
  data: FraudSession | null;
  mode: FraudDashboardSnapshot["mode"];
}> {
  const { data, mode } = await getSessions();

  return {
    data: data.find((session) => session.sessionId === sessionId) ?? null,
    mode
  };
}

export async function getDashboardSnapshot(): Promise<FraudDashboardSnapshot> {
  const [sessionsResult, alertsResult, casesResult, monitoringResult] =
    await Promise.all([
    fetchFromCandidates<FraudSession[]>("sessions"),
    fetchFromCandidates<AlertRecord[]>("alerts"),
    fetchFromCandidates<CaseRecord[]>("cases"),
    fetchFromCandidates<FraudMonitoringSnapshot>("metrics")
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
    return getMockSnapshot();
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
