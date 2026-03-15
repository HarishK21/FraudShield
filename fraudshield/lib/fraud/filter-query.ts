import { type SessionFilterCriteria } from "@/lib/fraud/types";

const DEFAULT_LIMIT = 250;
const MAX_LIMIT = 1000;

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

function parsePositiveInt(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.min(parsed, MAX_LIMIT);
}

export function parseSessionFilterCriteria(request: Request): SessionFilterCriteria {
  const { searchParams } = new URL(request.url);

  return {
    userId: firstParam(searchParams, "userId", "user_id"),
    testRunId: firstParam(searchParams, "testRunId", "test_run_id", "runId"),
    agentId: firstParam(searchParams, "agentId", "agent_id"),
    scenarioId: firstParam(searchParams, "scenarioId", "scenario_id"),
    limit: parsePositiveInt(
      firstParam(searchParams, "limit", "sessionLimit", "entries")
    )
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

  if (filters?.limit && filters.limit !== DEFAULT_LIMIT) {
    params.set("limit", String(filters.limit));
  }

  return params;
}
