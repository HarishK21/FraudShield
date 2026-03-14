"use client";

import { motion, useReducedMotion } from "framer-motion";

import { transitionEase } from "@/lib/fraudshield-theme";

type DashboardShellProps = {
  animateIn?: boolean;
  preview?: boolean;
};

const stats = [
  { label: "Threat Score", meta: "Global risk posture", tone: "critical", value: "87" },
  { label: "Active Sessions", meta: "Monitored in real time", tone: "stable", value: "14,218" },
  { label: "Risk Alerts", meta: "Priority queue open", tone: "warning", value: "23" },
  { label: "Protected Accounts", meta: "Policy coverage", tone: "stable", value: "96.4K" }
];

const activity = [
  {
    account: "USR-90821",
    event: "Synthetic identity cluster detected",
    severity: "Critical",
    time: "18:31 UTC"
  },
  {
    account: "USR-77102",
    event: "High-risk login velocity anomaly",
    severity: "High",
    time: "18:18 UTC"
  },
  {
    account: "USR-62483",
    event: "Session hijack confidence spike",
    severity: "High",
    time: "17:56 UTC"
  },
  {
    account: "USR-58211",
    event: "Impossible travel payment attempt",
    severity: "Medium",
    time: "17:40 UTC"
  }
];

const secondaryPanels = [
  { label: "Detection Stream", value: "412 / hr" },
  { label: "Decision Latency", value: "162 ms" },
  { label: "Containment Rate", value: "97.2%" }
] as const;

const systemSignals = [
  "Adaptive challenge rate holding below threshold",
  "Rules engine replication synchronized across regions",
  "Behavioral model confidence stable after containment",
  "Payment velocity anomalies isolated to two watch groups"
] as const;

function StatCard({
  animateIn,
  delay,
  item
}: {
  animateIn: boolean;
  delay: number;
  item: (typeof stats)[number];
}) {
  const reduceMotion = useReducedMotion();
  const toneClass =
    item.tone === "critical"
      ? "bg-[#ff88c8]"
      : item.tone === "warning"
        ? "bg-[#ffbf7d]"
        : "bg-[#82b2ff]";

  return (
    <motion.section
      initial={animateIn ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.54,
        delay,
        ease: transitionEase
      }}
      className="border border-white/8 bg-[linear-gradient(180deg,rgba(11,18,30,0.94),rgba(7,12,20,0.98))] px-4 py-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.26em] text-white/34">
            {item.label}
          </p>
          <p className="mt-3 font-mono text-[1.8rem] font-semibold text-white/92">
            {item.value}
          </p>
        </div>
        <span className={`mt-1 h-2.5 w-2.5 ${toneClass}`} />
      </div>
      <div className="mt-4 border-t border-white/8 pt-3 text-[0.72rem] uppercase tracking-[0.18em] text-white/34">
        {item.meta}
      </div>
    </motion.section>
  );
}

export function DashboardShell({
  animateIn = false,
  preview = false
}: DashboardShellProps) {
  const shouldAnimate = animateIn && !preview;
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-hidden={preview}
      className={`relative min-h-screen overflow-hidden bg-[var(--bg-base)] ${
        preview ? "pointer-events-none" : ""
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(109,114,255,0.08),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(255,136,200,0.05),transparent_16%),linear-gradient(180deg,#02050d_0%,#050a12_44%,#060913_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] [background-size:120px_120px] opacity-[0.08]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(1,3,10,0.34)_70%,rgba(1,2,8,0.92)_100%)]" />

      <div className="relative z-10 flex min-h-screen">
        <motion.aside
          initial={shouldAnimate ? { opacity: 0, x: -16 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: reduceMotion ? 0.2 : 0.56,
            ease: transitionEase
          }}
          className="hidden w-[88px] shrink-0 border-r border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.008))] md:flex md:flex-col md:justify-between"
        >
          <div>
            <div className="flex h-[78px] items-center justify-center border-b border-white/8">
              <div className="grid h-10 w-10 place-items-center border border-white/10 bg-white/[0.03]">
                <span className="h-3 w-3 border border-[var(--accent-violet)]/80" />
              </div>
            </div>

            <div className="flex flex-col gap-2 px-3 py-4">
              {["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z", "M4 18l5-5 3 3 8-8", "M12 3l8 15H4L12 3zm0 5v4m0 4h.01", "M5 7h14M8 12h8M10 17h4"].map((path, index) => (
                <div
                  key={path}
                  className={`flex h-11 items-center justify-center border ${
                    index === 0
                      ? "border-white/10 bg-[linear-gradient(180deg,rgba(141,134,255,0.14),rgba(141,134,255,0.04))] text-white/88"
                      : "border-transparent text-white/36"
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path d={path} />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/8 px-3 py-4">
            <div className="flex h-11 items-center justify-center border border-white/8 bg-white/[0.02] text-white/56">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v18M3 12h18" />
              </svg>
            </div>
          </div>
        </motion.aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <motion.header
            initial={shouldAnimate ? { opacity: 0, y: 14 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0.2 : 0.58,
              delay: shouldAnimate ? 0.08 : 0,
              ease: transitionEase
            }}
            className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.024),rgba(255,255,255,0.008))] px-5 py-4 backdrop-blur-xl md:px-8"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[0.62rem] uppercase tracking-[0.32em] text-white/34">
                  Enterprise Fraud Monitoring
                </p>
                <h1 className="mt-2 font-display text-[clamp(1.25rem,2vw,1.85rem)] font-semibold tracking-[0.14em] text-white/92">
                  FraudShield Dashboard
                </h1>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="flex items-center gap-2 border border-white/10 bg-white/[0.025] px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-white/58">
                  <span className="h-2 w-2 bg-[var(--success-green)]" />
                  Monitoring
                </div>
                <div className="border border-white/10 bg-white/[0.02] px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-white/42">
                  Analysts 12
                </div>
                <div className="border border-white/10 bg-white/[0.02] px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-white/42">
                  SLA 04m
                </div>
              </div>
            </div>
          </motion.header>

          <div className="flex-1 px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((item, index) => (
                <StatCard
                  key={item.label}
                  animateIn={shouldAnimate}
                  delay={shouldAnimate ? 0.12 + index * 0.05 : 0}
                  item={item}
                />
              ))}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.92fr)]">
              <motion.section
                initial={shouldAnimate ? { opacity: 0, y: 18 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduceMotion ? 0.2 : 0.62,
                  delay: shouldAnimate ? 0.28 : 0,
                  ease: transitionEase
                }}
                className="overflow-hidden border border-white/8 bg-[linear-gradient(180deg,rgba(11,18,30,0.98),rgba(7,12,20,1))]"
              >
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-4 md:px-5">
                  <div>
                    <p className="text-[0.64rem] uppercase tracking-[0.32em] text-white/36">
                      Recent Activity
                    </p>
                    <h2 className="mt-2 text-sm font-medium uppercase tracking-[0.22em] text-white/86">
                      Priority Review Queue
                    </h2>
                  </div>
                  <div className="hidden border border-white/10 bg-white/[0.02] px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-white/42 md:block">
                    Open Cases 11
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-white/[0.02]">
                      <tr className="border-b border-white/8">
                        {["Event", "Severity", "Account", "Time"].map((column) => (
                          <th
                            key={column}
                            className="px-4 py-3 text-[0.6rem] font-medium uppercase tracking-[0.24em] text-white/32 md:px-5"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activity.map((item) => (
                        <tr
                          key={`${item.event}-${item.account}`}
                          className="border-b border-white/6 hover:bg-white/[0.02]"
                        >
                          <td className="px-4 py-4 text-[0.92rem] text-white/84 md:px-5">
                            {item.event}
                          </td>
                          <td className="px-4 py-4 md:px-5">
                            <span
                              className={`border px-2 py-1 text-[0.66rem] uppercase tracking-[0.16em] ${
                                item.severity === "Critical"
                                  ? "border-[#ff88c8]/24 text-[#ff88c8]"
                                  : item.severity === "High"
                                    ? "border-[#ffbf7d]/24 text-[#ffbf7d]"
                                    : "border-[#8bb3ff]/24 text-[#8bb3ff]"
                              }`}
                            >
                              {item.severity}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-mono text-[0.82rem] tracking-[0.08em] text-white/62 md:px-5">
                            {item.account}
                          </td>
                          <td className="px-4 py-4 font-mono text-[0.82rem] tracking-[0.08em] text-white/46 md:px-5">
                            {item.time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.section>

              <div className="grid gap-4">
                <motion.section
                  initial={shouldAnimate ? { opacity: 0, y: 18 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0.2 : 0.62,
                    delay: shouldAnimate ? 0.34 : 0,
                    ease: transitionEase
                  }}
                  className="border border-white/8 bg-[linear-gradient(180deg,rgba(11,18,30,0.98),rgba(7,12,20,1))] px-4 py-4 md:px-5"
                >
                  <p className="text-[0.64rem] uppercase tracking-[0.32em] text-white/36">
                    Live Signals
                  </p>
                  <div className="mt-4 space-y-3">
                    {secondaryPanels.map((panel) => (
                      <div
                        key={panel.label}
                        className="flex items-center justify-between border border-white/6 bg-white/[0.015] px-3 py-3"
                      >
                        <span className="text-[0.72rem] uppercase tracking-[0.18em] text-white/40">
                          {panel.label}
                        </span>
                        <span className="font-mono text-[0.84rem] tracking-[0.08em] text-white/78">
                          {panel.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.section>

                <motion.section
                  initial={shouldAnimate ? { opacity: 0, y: 18 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0.2 : 0.62,
                    delay: shouldAnimate ? 0.4 : 0,
                    ease: transitionEase
                  }}
                  className="border border-white/8 bg-[linear-gradient(180deg,rgba(11,18,30,0.98),rgba(7,12,20,1))] px-4 py-4 md:px-5"
                >
                  <p className="text-[0.64rem] uppercase tracking-[0.32em] text-white/36">
                    System Notes
                  </p>
                  <div className="mt-4 space-y-3">
                    {systemSignals.map((signal) => (
                      <div
                        key={signal}
                        className="border-l border-[var(--accent-violet)]/26 pl-3 text-[0.84rem] text-white/64"
                      >
                        {signal}
                      </div>
                    ))}
                  </div>
                </motion.section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
