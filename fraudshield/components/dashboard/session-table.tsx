import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { RiskBadge } from "@/components/dashboard/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  formatCurrency,
  formatDateTime,
  formatRelativeTime
} from "@/lib/fraud/selectors";
import { type FraudSession } from "@/lib/fraud/types";

export function SessionTable({
  sessions,
  compact = false
}: {
  sessions: FraudSession[];
  compact?: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Session</TableHead>
          <TableHead>Current Page</TableHead>
          <TableHead>Transfer</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead className={compact ? "hidden md:table-cell" : ""}>Top Flags</TableHead>
          <TableHead className={compact ? "hidden lg:table-cell" : ""}>Last Event</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Open</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.sessionId}>
            <TableCell>
              <div>
                <Link
                  href={`/dashboard/sessions/${session.sessionId}`}
                  className="font-medium text-slate-50 hover:text-cyan-200"
                >
                  {session.sessionId}
                </Link>
                <p className="mt-1 text-xs text-slate-500">{session.accountHolder}</p>
              </div>
            </TableCell>
            <TableCell>{session.summary.currentPage}</TableCell>
            <TableCell>{formatCurrency(session.summary.transferAmount)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100">
                  {session.summary.currentRiskScore}
                </span>
                <RiskBadge value={session.summary.status} />
              </div>
            </TableCell>
            <TableCell className={compact ? "hidden md:table-cell" : ""}>
              <div className="flex flex-wrap gap-2">
                {session.summary.topFlags.slice(0, 2).map((flag) => (
                  <Badge key={flag} variant="neutral">
                    {flag}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className={compact ? "hidden lg:table-cell" : ""}>
              <div>
                <p>{formatRelativeTime(session.summary.lastEventTime)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDateTime(session.summary.lastEventTime)}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <RiskBadge value={session.summary.status} />
                <p className="mt-1 text-xs text-slate-500">
                  Analyst: {session.analystDecision}
                </p>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Link
                href={`/dashboard/sessions/${session.sessionId}`}
                className="inline-flex items-center gap-1 text-sm text-cyan-200 hover:text-cyan-100"
              >
                Inspect
                <ArrowRight className="h-4 w-4" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
