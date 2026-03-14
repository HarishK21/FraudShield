"use client";

import { motion, useReducedMotion } from "framer-motion";

export type IncidentRow = {
  device: string;
  event: string;
  severity: "Critical" | "High" | "Medium";
  status: "Contained" | "Investigating" | "Queued" | "Escalated";
  time: string;
  user: string;
};

type IncidentsTableProps = {
  animateIn?: boolean;
  preview?: boolean;
  rows: readonly IncidentRow[];
};

const severityClasses: Record<IncidentRow["severity"], string> = {
  Critical: "text-[#ff8ab5]",
  High: "text-[#ffb47a]",
  Medium: "text-[#9cafff]"
};

const statusClasses: Record<IncidentRow["status"], string> = {
  Contained: "text-[#8fd9ff]",
  Investigating: "text-[#c9b3ff]",
  Queued: "text-white/56",
  Escalated: "text-[#ff90bc]"
};

const tableEase = [0.16, 0.84, 0.24, 1] as const;

export function IncidentsTable({
  animateIn = false,
  preview = false,
  rows
}: IncidentsTableProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={animateIn ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.62,
        delay: animateIn ? 0.24 : 0,
        ease: tableEase
      }}
      className="overflow-hidden border border-white/8 bg-[linear-gradient(180deg,rgba(9,14,24,0.98),rgba(5,8,16,1))]"
    >
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-4 md:px-5">
        <div>
          <p className="text-[0.64rem] uppercase tracking-[0.32em] text-white/36">
            Incident Queue
          </p>
          <h2 className="mt-2 text-sm font-medium uppercase tracking-[0.22em] text-white/86">
            Active Event Review
          </h2>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <div className="border border-white/10 bg-white/[0.02] px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-white/42">
            Critical 03
          </div>
          <div className="border border-white/10 bg-white/[0.02] px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-white/42">
            Review 11
          </div>
          <div className="border border-white/10 bg-white/[0.02] px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-white/42">
            Contained 07
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-white/[0.02]">
            <tr className="border-b border-white/8">
              {["Event", "Severity", "User", "Device", "Time", "Status"].map((column) => (
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
            {rows.map((row) => (
              <tr
                key={`${row.event}-${row.user}-${row.time}`}
                className="border-b border-white/6 transition-colors hover:bg-white/[0.02] last:border-b-0"
              >
                <td className="px-4 py-4 md:px-5">
                  <div className="text-[0.92rem] font-medium text-white/84">{row.event}</div>
                </td>
                <td className={`px-4 py-4 text-sm font-medium md:px-5 ${severityClasses[row.severity]}`}>
                  <span className="border border-current/20 px-2 py-1 text-[0.66rem] uppercase tracking-[0.16em]">
                    {row.severity}
                  </span>
                </td>
                <td className="px-4 py-4 font-mono text-[0.82rem] tracking-[0.08em] text-white/68 md:px-5">
                  {row.user}
                </td>
                <td className="px-4 py-4 font-mono text-[0.82rem] tracking-[0.08em] text-white/48 md:px-5">
                  {row.device}
                </td>
                <td className="px-4 py-4 font-mono text-[0.82rem] tracking-[0.08em] text-white/52 md:px-5">
                  {row.time}
                </td>
                <td className={`px-4 py-4 text-[0.76rem] uppercase tracking-[0.18em] md:px-5 ${statusClasses[row.status]}`}>
                  <span className="border border-current/20 px-2 py-1">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
