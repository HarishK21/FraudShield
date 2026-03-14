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
  const { alerts, loadingState, sessions } = useFraudDashboard();

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Analyst Dashboard"
        description="Monitor incoming behavioral telemetry from the banking site, spot risky transfer sessions, and move cleanly from alert triage into case escalation."
        actions={<Badge variant="info">Auto-refresh every 5 seconds</Badge>}
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
