"use client";

import { useState } from "react";

import { AlertsTable } from "@/components/dashboard/alerts-table";
import { DataState } from "@/components/dashboard/data-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { useFraudDashboard } from "@/components/dashboard/dashboard-data-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { type AlertSeverity } from "@/lib/fraud/types";

const severityFilters: Array<AlertSeverity | "All"> = [
  "All",
  "Low",
  "Medium",
  "High"
];

export function AlertsPage() {
  const { alerts, loadingState } = useFraudDashboard();
  const [filter, setFilter] = useState<AlertSeverity | "All">("All");

  if (loadingState === "loading" && alerts.length === 0) {
    return (
      <DataState
        title="Loading alerts"
        description="Reviewing triggered alert records from the risk scoring engine."
      />
    );
  }

  const filteredAlerts =
    filter === "All"
      ? alerts
      : alerts.filter((alert) => alert.severity === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Filter triggered alerts by severity, understand why a session was flagged, and move from signal review into session inspection."
        actions={<Badge variant="neutral">{filteredAlerts.length} visible alerts</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Triggered Alerts</CardTitle>
          <CardDescription>
            Rules include unusual transfer amount, hesitation spikes, navigation drift,
            repeated corrections, erratic mouse activity, and abnormal review timing.
          </CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            {severityFilters.map((severity) => (
              <Button
                key={severity}
                size="sm"
                variant={filter === severity ? "default" : "secondary"}
                onClick={() => setFilter(severity)}
              >
                {severity}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-2 pt-0">
          <AlertsTable alerts={filteredAlerts} />
        </CardContent>
      </Card>
    </div>
  );
}
