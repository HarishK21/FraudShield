"use client";

import { motion, useReducedMotion } from "framer-motion";

type HeaderProps = {
  animateIn?: boolean;
  preview?: boolean;
};

const headerEase = [0.16, 0.84, 0.24, 1] as const;

export function Header({ animateIn = false, preview = false }: HeaderProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      initial={animateIn ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.56,
        delay: animateIn ? 0.08 : 0,
        ease: headerEase
      }}
      className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] px-5 py-4 backdrop-blur-xl md:px-8"
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
            <span className="h-2 w-2 bg-[#78ffbf]" />
            Enforced
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
  );
}
