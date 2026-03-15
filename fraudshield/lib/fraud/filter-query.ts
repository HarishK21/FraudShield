import { type SessionFilterCriteria } from "@/lib/fraud/types";

function sanitize(value: string | null) {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
}

function firstParam(searchParams: URLSearchParams, ...keys: string[]) {
  for (const key of keys) {
    const value = sanitize(searchParams.get(key));
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function parseSessionFilterCriteria(request: Request): SessionFilterCriteria {
  const { searchParams } = new URL(request.url);

  return {
    userId: firstParam(searchParams, "userId", "user_id"),
    testRunId: firstParam(searchParams, "testRunId", "test_run_id", "runId"),
    agentId: firstParam(searchParams, "agentId", "agent_id"),
    scenarioId: firstParam(searchParams, "scenarioId", "scenario_id")
  };
}

export function toFilterSearchParams(
  filters: SessionFilterCriteria | null | undefined
) {
  const params = new URLSearchParams();

  if (filters?.userId) {
    params.set("userId", filters.userId);
  }

  if (filters?.testRunId) {
    params.set("testRunId", filters.testRunId);
  }

  if (filters?.agentId) {
    params.set("agentId", filters.agentId);
  }

  if (filters?.scenarioId) {
    params.set("scenarioId", filters.scenarioId);
  }

  return params;
}
