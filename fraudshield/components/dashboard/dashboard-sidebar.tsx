"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  LayoutDashboard,
  Radio,
  ShieldAlert
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    match: (pathname: string) => pathname === "/dashboard"
  },
  {
    href: "/dashboard/sessions",
    label: "Live Sessions",
    icon: Radio,
    match: (pathname: string) => pathname.startsWith("/dashboard/sessions")
  },
  {
    href: "/dashboard/alerts",
    label: "Alerts",
    icon: ShieldAlert,
    match: (pathname: string) => pathname.startsWith("/dashboard/alerts")
  },
  {
    href: "/dashboard/cases",
    label: "Cases",
    icon: FolderKanban,
    match: (pathname: string) => pathname.startsWith("/dashboard/cases")
  }
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/8 bg-slate-950/80 px-5 py-6 backdrop-blur-2xl lg:flex lg:flex-col">
      <Link
        href="/"
        className="block rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.08] p-4 transition-colors hover:bg-cyan-400/[0.12]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-slate-900/90">
            <ShieldAlert className="h-5 w-5 text-cyan-200" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">
              FraudShield
            </p>
            <p className="text-sm font-semibold text-slate-100">
              Analyst Console
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Behavioral telemetry only. No raw passwords, keystrokes, or sensitive text
          values are stored.
        </p>
      </Link>

      <nav className="mt-8 flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = item.match(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors",
                isActive
                  ? "border-cyan-400/20 bg-cyan-400/10 text-slate-50"
                  : "border-transparent text-slate-400 hover:border-white/6 hover:bg-white/[0.035] hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Telemetry guardrails
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-400">
          <li>High-level interaction metadata only</li>
          <li>Risk scoring stays readable and tunable</li>
          <li>Dashboard falls back to mock feed if API is offline</li>
        </ul>
      </div>
    </aside>
  );
}
