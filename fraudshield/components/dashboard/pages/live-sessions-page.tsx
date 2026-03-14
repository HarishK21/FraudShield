"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { DataState } from "@/components/dashboard/data-state";
import {
  useDashboardPolling,
  useFraudDashboard
} from "@/components/dashboard/dashboard-data-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { SessionTable } from "@/components/dashboard/session-table";

export function LiveSessionsPage() {
  const { loadingState, sessions } = useFraudDashboard();

  useDashboardPolling(true);

  if (loadingState === "loading" && sessions.length === 0) {
    return (
      <DataState
        title="Loading live sessions"
        description="Collecting recent session summaries and their latest telemetry markers."
      />
    );
  }

  const orderedSessions = sessions
    .slice()
    .sort((left, right) =>
      right.summary.lastEventTime.localeCompare(left.summary.lastEventTime)
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Sessions"
        description="Review active and recently active banking sessions, inspect their current transfer context, and open any flagged session for a deeper analyst review."
        actions={<Badge variant="info">Polling every 5 seconds</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Active and Recent Sessions</CardTitle>
          <CardDescription>
            Click into any row to inspect its timeline, risk factors, and review actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-2 pt-0">
          <SessionTable sessions={orderedSessions} />
        </CardContent>
      </Card>
    </div>
  );
}
