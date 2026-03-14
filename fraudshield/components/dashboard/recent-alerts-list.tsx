import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/dashboard/risk-badge";
import { formatDateTime } from "@/lib/fraud/selectors";
import { type AlertRecord } from "@/lib/fraud/types";

export function RecentAlertsList({ alerts }: { alerts: AlertRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
        <CardDescription>Latest rules triggered across monitored sessions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-100">{alert.reason}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {alert.sessionId} • {formatDateTime(alert.timestamp)}
                </p>
              </div>
              <RiskBadge value={alert.severity} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{alert.id}</span>
              <span>{alert.status}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
