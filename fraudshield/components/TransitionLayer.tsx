"use client";

import { motion, useReducedMotion } from "framer-motion";

import { fraudShieldTheme, transitionEase } from "@/lib/fraudshield-theme";

type TransitionLayerProps = {
  active: boolean;
};

export function TransitionLayer({ active }: TransitionLayerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <motion.div
        initial={false}
        animate={active ? { opacity: 0.7, scale: 1.14 } : { opacity: 0, scale: 0.9 }}
        transition={{
          duration: reduceMotion ? 0.2 : fraudShieldTheme.motion.transition,
          ease: transitionEase
        }}
        className="absolute left-1/2 top-[46%] h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] md:h-[36rem] md:w-[36rem]"
        style={{
          background: `radial-gradient(circle, ${fraudShieldTheme.colors.glowViolet} 0%, ${fraudShieldTheme.colors.glowRose} 38%, transparent 72%)`
        }}
      />

      <motion.div
        initial={false}
        animate={active ? { opacity: 0.14, scaleX: 1.06 } : { opacity: 0, scaleX: 0.84 }}
        transition={{
          duration: reduceMotion ? 0.2 : 0.72,
          ease: transitionEase
        }}
        className="absolute left-1/2 top-1/2 h-px w-[48rem] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent"
      />

      <motion.div
        initial={false}
        animate={active ? { opacity: 0.18 } : { opacity: 0.1 }}
        transition={{
          duration: reduceMotion ? 0.2 : 0.78,
          ease: transitionEase
        }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(1,3,10,0.28)_68%,rgba(1,2,8,0.84)_100%)]"
      />
    </div>
  );
}
