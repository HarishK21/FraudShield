import {
  type AlertRecord,
  type CaseRecord,
  type FraudDashboardSnapshot,
  type FraudSession
} from "@/lib/fraud/types";
import { buildMockFraudSnapshot } from "@/lib/fraud/mock-data";

let mockCycle = 0;

const fraudApiBaseUrl = process.env.NEXT_PUBLIC_FRAUD_API_BASE_URL;
const enableLocalApi =
  process.env.NEXT_PUBLIC_FRAUD_API_USE_LOCAL_ENDPOINTS === "true";

function getCandidateUrls(resource: "sessions" | "alerts" | "cases") {
  if (fraudApiBaseUrl) {
    return [
      `${fraudApiBaseUrl.replace(/\/$/, "")}/${resource}`,
      `${fraudApiBaseUrl.replace(/\/$/, "")}/api/fraud/${resource}`
    ];
  }

  if (enableLocalApi) {
    return [`/api/fraud/${resource}`];
  }

  return [];
}

async function fetchFromCandidates<T>(resource: "sessions" | "alerts" | "cases") {
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

  return { data: getMockSnapshot().sessions, mode: "mock" };
}

export async function getAlerts(): Promise<{
  data: AlertRecord[];
  mode: FraudDashboardSnapshot["mode"];
}> {
  const liveData = await fetchFromCandidates<AlertRecord[]>("alerts");

  if (liveData) {
    return { data: liveData, mode: "live" };
  }

  return { data: getMockSnapshot().alerts, mode: "mock" };
}

export async function getCases(): Promise<{
  data: CaseRecord[];
  mode: FraudDashboardSnapshot["mode"];
}> {
  const liveData = await fetchFromCandidates<CaseRecord[]>("cases");

  if (liveData) {
    return { data: liveData, mode: "live" };
  }

  return { data: getMockSnapshot().cases, mode: "mock" };
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
  // This adapter is where the banking site's telemetry API can replace mock mode.
  // If the remote endpoint is unavailable, the dashboard keeps working with demo data.
  if (getCandidateUrls("sessions").length === 0) {
    return getMockSnapshot();
  }

  const [sessionsResult, alertsResult, casesResult] = await Promise.all([
    fetchFromCandidates<FraudSession[]>("sessions"),
    fetchFromCandidates<AlertRecord[]>("alerts"),
    fetchFromCandidates<CaseRecord[]>("cases")
  ]);

  if (sessionsResult && alertsResult && casesResult) {
    return {
      sessions: sessionsResult,
      alerts: alertsResult,
      cases: casesResult,
      mode: "live",
      updatedAt: new Date().toISOString()
    };
  }

  return getMockSnapshot();
}
