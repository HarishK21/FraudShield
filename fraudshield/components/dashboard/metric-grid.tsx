import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDuration } from "@/lib/fraud/selectors";
import { type FraudSession } from "@/lib/fraud/types";

const metricLabels = [
  { key: "timeBeforeFirstClick", label: "Time Before First Click", format: formatDuration },
  { key: "avgDwellTime", label: "Average Dwell Time", format: formatDuration },
  { key: "avgTypingSpeed", label: "Avg Typing Speed", format: (value: number) => `${value} cpm` },
  { key: "correctionCount", label: "Correction Count", format: (value: number) => String(value) },
  { key: "focusChangeCount", label: "Focus Changes", format: (value: number) => String(value) },
  { key: "mouseTravelDistance", label: "Mouse Travel", format: (value: number) => `${value}px` },
  {
    key: "sharpDirectionChanges",
    label: "Sharp Direction Changes",
    format: (value: number) => String(value)
  },
  { key: "submitDelayMs", label: "Review-to-Submit Delay", format: formatDuration }
] as const;

export function MetricGrid({ session }: { session: FraudSession }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Behavior Metrics</CardTitle>
        <CardDescription>
          High-level interaction metadata only. No sensitive text payloads are stored.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricLabels.map((metric) => (
            <div
              key={metric.key}
              className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {metric.label}
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-50">
                {metric.format(session.summary[metric.key])}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Transfer Review Panel
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-400">Transfer amount</p>
              <p className="mt-1 text-lg font-semibold text-slate-50">
                {formatCurrency(session.summary.transferAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Submitted</p>
              <p className="mt-1 text-lg font-semibold text-slate-50">
                {session.summary.submitted ? "Submitted" : "In review"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Current page</p>
              <p className="mt-1 text-lg font-semibold text-slate-50">
                {session.summary.currentPage}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
