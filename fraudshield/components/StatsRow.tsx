"use client";

import { motion, useReducedMotion } from "framer-motion";

export type StatItem = {
  change: string;
  label: string;
  tone: "critical" | "stable" | "warning";
  value: string;
};

type StatsRowProps = {
  animateIn?: boolean;
  items: readonly StatItem[];
  preview?: boolean;
};

const toneClasses: Record<StatItem["tone"], string> = {
  critical: "bg-[#ff7db4]/90",
  stable: "bg-[#7da0ff]/90",
  warning: "bg-[#ffb36a]/90"
};

const panelEase = [0.16, 0.84, 0.24, 1] as const;
const sparkBars = [
  [36, 54, 44, 72, 60, 78],
  [52, 48, 62, 58, 70, 66],
  [42, 74, 56, 68, 51, 63],
  [60, 64, 58, 73, 69, 75]
] as const;

export function StatsRow({
  animateIn = false,
  items,
  preview = false
}: StatsRowProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <motion.section
          key={item.label}
          initial={animateIn ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0.2 : 0.58,
            delay: animateIn ? 0.12 + index * 0.05 : 0,
            ease: panelEase
          }}
          className="relative overflow-hidden border border-white/8 bg-[linear-gradient(180deg,rgba(10,15,26,0.94),rgba(6,10,18,0.98))] px-4 py-4"
        >
          <div className="absolute inset-y-0 left-0 w-px bg-white/10" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.63rem] uppercase tracking-[0.28em] text-white/34">
                {item.label}
              </p>
              <p className="mt-3 font-mono text-[1.75rem] font-semibold tracking-[0.02em] text-white/92">
                {item.value}
              </p>
            </div>
            <span className={`mt-1 h-2.5 w-2.5 ${toneClasses[item.tone]}`} />
          </div>

          <div className="mt-4 flex items-end justify-between gap-4 border-t border-white/8 pt-3">
            <div className="flex h-8 items-end gap-1">
              {sparkBars[index].map((height) => (
                <span
                  key={`${item.label}-${height}`}
                  className="w-1.5 bg-white/16"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <span className="text-[0.68rem] uppercase tracking-[0.24em] text-white/32">
              24H Delta
            </span>
            <span className="font-mono text-[0.78rem] tracking-[0.14em] text-white/68">
              {item.change}
            </span>
          </div>
        </motion.section>
      ))}
    </div>
  );
}
