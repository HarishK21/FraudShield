"use client";

import { motion, useReducedMotion } from "framer-motion";

export type ActivityItem = {
  detail: string;
  label: string;
  tone: "critical" | "neutral" | "watch";
};

export type ActivitySection = {
  items: readonly ActivityItem[];
  title: string;
};

type ActivityPanelProps = {
  animateIn?: boolean;
  preview?: boolean;
  sections: readonly ActivitySection[];
};

const toneDot: Record<ActivityItem["tone"], string> = {
  critical: "bg-[#ff7cac]",
  neutral: "bg-[#7f8cff]",
  watch: "bg-[#7fdcff]"
};

const panelEase = [0.16, 0.84, 0.24, 1] as const;

export function ActivityPanel({
  animateIn = false,
  preview = false,
  sections
}: ActivityPanelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={animateIn ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.62,
        delay: animateIn ? 0.3 : 0,
        ease: panelEase
      }}
      className="overflow-hidden border border-white/8 bg-[linear-gradient(180deg,rgba(8,13,22,0.98),rgba(5,8,16,1))]"
    >
      <div className="border-b border-white/8 px-4 py-4 md:px-5">
        <p className="text-[0.64rem] uppercase tracking-[0.32em] text-white/36">
          Operational Feed
        </p>
        <h2 className="mt-2 text-sm font-medium uppercase tracking-[0.22em] text-white/86">
          Recent Activity
        </h2>
      </div>

      <div className="divide-y divide-white/8">
        {sections.map((section) => (
          <div key={section.title} className="px-4 py-4 md:px-5">
            <h3 className="text-[0.68rem] uppercase tracking-[0.28em] text-white/44">
              {section.title}
            </h3>
            <div className="mt-4 space-y-3">
              {section.items.map((item) => (
                <div
                  key={`${section.title}-${item.label}`}
                  className="grid grid-cols-[auto_1fr] gap-3 border border-white/6 bg-white/[0.015] px-3 py-3"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 ${toneDot[item.tone]}`} />
                  <div className="min-w-0">
                    <p className="text-[0.88rem] text-white/80">{item.label}</p>
                    <p className="mt-1 font-mono text-[0.72rem] tracking-[0.08em] text-white/42">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
