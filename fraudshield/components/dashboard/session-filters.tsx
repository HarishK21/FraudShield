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
  const selectedLimit = filters.limit && filters.limit > 0 ? filters.limit : 250;
  const hasCustomLimit = selectedLimit !== 250;
  const activeFilterCount = [
    filters.userId,
    filters.scenarioId,
    hasCustomLimit ? String(selectedLimit) : undefined
  ].filter(Boolean).length;

  const userOptions = withCurrentOption(filterOptions.userIds, filters.userId);
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
        value={String(selectedLimit)}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          setFilters({
            limit:
              Number.isFinite(parsed) && parsed > 0 && parsed !== 250
                ? parsed
                : undefined
          });
        }}
        className="h-9 min-w-[160px] rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
      >
        <option value="50" style={optionStyle}>
          Last 50 entries
        </option>
        <option value="100" style={optionStyle}>
          Last 100 entries
        </option>
        <option value="250" style={optionStyle}>
          Last 250 entries
        </option>
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
