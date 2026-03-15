"use client";

import { Button } from "@/components/ui/button";
import { useFraudDashboard } from "@/components/dashboard/dashboard-data-provider";

function withCurrentOption(options: string[], currentValue?: string) {
  if (!currentValue || options.includes(currentValue)) {
    return options;
  }

  return [currentValue, ...options];
}

export function SessionFilters() {
  const { clearFilters, filterOptions, filters, setFilters } = useFraudDashboard();
  const activeFilterCount = [
    filters.userId,
    filters.testRunId,
    filters.agentId,
    filters.scenarioId
  ].filter(Boolean).length;

  const runOptions = withCurrentOption(filterOptions.testRunIds, filters.testRunId);
  const userOptions = withCurrentOption(filterOptions.userIds, filters.userId);
  const agentOptions = withCurrentOption(filterOptions.agentIds, filters.agentId);
  const scenarioOptions = withCurrentOption(
    filterOptions.scenarioIds,
    filters.scenarioId
  );
  const optionStyle = {
    color: "#0f172a",
    backgroundColor: "#ffffff"
  } as const;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filters.testRunId ?? ""}
        onChange={(event) =>
          setFilters({
            testRunId: event.target.value || undefined
          })
        }
        className="h-9 min-w-[140px] rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
      >
        <option value="" style={optionStyle}>
          All runs
        </option>
        {runOptions.map((value) => (
          <option key={value} value={value} style={optionStyle}>
            {value}
          </option>
        ))}
      </select>

      <select
        value={filters.userId ?? ""}
        onChange={(event) =>
          setFilters({
            userId: event.target.value || undefined
          })
        }
        className="h-9 min-w-[140px] rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
      >
        <option value="" style={optionStyle}>
          All users
        </option>
        {userOptions.map((value) => (
          <option key={value} value={value} style={optionStyle}>
            {value}
          </option>
        ))}
      </select>

      <select
        value={filters.agentId ?? ""}
        onChange={(event) =>
          setFilters({
            agentId: event.target.value || undefined
          })
        }
        className="h-9 min-w-[140px] rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
      >
        <option value="" style={optionStyle}>
          All agents
        </option>
        {agentOptions.map((value) => (
          <option key={value} value={value} style={optionStyle}>
            {value}
          </option>
        ))}
      </select>

      <select
        value={filters.scenarioId ?? ""}
        onChange={(event) =>
          setFilters({
            scenarioId: event.target.value || undefined
          })
        }
        className="h-9 min-w-[140px] rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
      >
        <option value="" style={optionStyle}>
          All scenarios
        </option>
        {scenarioOptions.map((value) => (
          <option key={value} value={value} style={optionStyle}>
            {value}
          </option>
        ))}
      </select>

      <Button
        size="sm"
        variant="secondary"
        onClick={clearFilters}
        disabled={activeFilterCount === 0}
      >
        Clear filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
      </Button>
    </div>
  );
}
