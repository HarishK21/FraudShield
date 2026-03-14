"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ArrowLeft, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFraudDashboard } from "@/components/dashboard/dashboard-data-provider";
import { formatDateTime } from "@/lib/fraud/selectors";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/sessions", label: "Sessions" },
  { href: "/dashboard/alerts", label: "Alerts" },
  { href: "/dashboard/cases", label: "Cases" }
];

export function DashboardTopBar() {
  const pathname = usePathname();
  const { isRefreshing, mode, refresh, updatedAt } = useFraudDashboard();

  return (
    <header className="border-b border-white/8 bg-slate-950/70 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to landing
              </Link>
            </Button>
            <Badge variant={mode === "live" ? "success" : "info"}>
              {mode === "live" ? "Live API mode" : "Mock telemetry mode"}
            </Badge>
            <Badge variant="neutral">
              <Activity className="mr-1 h-3.5 w-3.5" />
              Updated {formatDateTime(updatedAt)}
            </Badge>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void refresh();
            }}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh feed
          </Button>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {mobileNavItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "border-cyan-400/20 bg-cyan-400/10 text-slate-50"
                    : "border-white/8 bg-white/[0.03] text-slate-400"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
