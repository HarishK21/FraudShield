"use client";

import { Activity, AlertTriangle, BarChart3, ShieldAlert } from "lucide-react";

import { AlertsOverTimeChart } from "@/components/dashboard/alerts-over-time-chart";
import { DataState } from "@/components/dashboard/data-state";
import {
  useDashboardPolling,
  useFraudDashboard
} from "@/components/dashboard/dashboard-data-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecentAlertsList } from "@/components/dashboard/recent-alerts-list";
import { RiskDistributionChart } from "@/components/dashboard/risk-distribution-chart";
import { SessionFilters } from "@/components/dashboard/session-filters";
import { SessionTable } from "@/components/dashboard/session-table";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  getOverviewMetricCards,
  getOverviewMetrics
} from "@/lib/fraud/selectors";

const summaryIcons = [Activity, ShieldAlert, AlertTriangle, BarChart3] as const;

export function OverviewPage() {
  const { alerts, loadingState, monitoring, sessions } = useFraudDashboard();

  useDashboardPolling(true);

  if (loadingState === "loading" && sessions.length === 0) {
    return (
      <DataState
        title="Loading fraud telemetry"
        description="Pulling the latest behavioral session summaries and alert signals."
      />
    );
  }

  const metrics = getOverviewMetrics(sessions, alerts);
  const metricCards = getOverviewMetricCards(metrics);
  const alertPrecision = monitoring
    ? `${Math.round(monitoring.evaluation.alertTier.precision * 100)}%`
    : "--";
  const criticalRecall = monitoring
    ? `${Math.round(monitoring.evaluation.criticalTier.recall * 100)}%`
    : "--";
  const driftFlags = monitoring
    ? monitoring.drift.filter((metric) => metric.flagged).length
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Analyst Dashboard"
        description="Monitor incoming behavioral telemetry from the banking site, spot risky transfer sessions, and move cleanly from alert triage into case escalation."
        actions={
          <>
            <Badge variant="info">Auto-refresh every 5 seconds</Badge>
            <SessionFilters />
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((item, index) => {
          const Icon = summaryIcons[index];

          return (
            <SummaryCard
              key={item.label}
              title={item.label}
              value={item.value}
              subtitle={item.change}
              tone={item.tone}
              icon={Icon}
            />
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RiskDistributionChart data={metrics.riskDistribution} />
        <AlertsOverTimeChart data={metrics.alertsOverTime} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Monitoring</CardTitle>
          <CardDescription>
            Precision and recall are computed from labeled analyst outcomes. Drift
            highlights sharp feature shifts between recent and baseline windows.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <p className="text-sm text-slate-400">Alert precision</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">{alertPrecision}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <p className="text-sm text-slate-400">Critical recall</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">{criticalRecall}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <p className="text-sm text-slate-400">Drift flags</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">{driftFlags}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Flagged Sessions</CardTitle>
            <CardDescription>
              Sessions currently on watch or high-risk status.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-2 pt-0">
            <SessionTable sessions={metrics.recentFlaggedSessions} compact />
          </CardContent>
        </Card>
        <RecentAlertsList alerts={metrics.recentAlerts} />
      </div>
    </div>
  );
}
