"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

import { AnimatedBackground } from "@/components/AnimatedBackground";
import { TransitionLayer } from "@/components/TransitionLayer";
import { fraudShieldTheme, transitionEase } from "@/lib/fraudshield-theme";

export function LandingHero() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [isEntering, setIsEntering] = useState(false);
  const routeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    router.prefetch("/dashboard");

    return () => {
      if (routeTimerRef.current !== null) {
        window.clearTimeout(routeTimerRef.current);
      }
    };
  }, [router]);

  const handleActivate = () => {
    if (isEntering) {
      return;
    }

    setIsEntering(true);

    routeTimerRef.current = window.setTimeout(() => {
      startTransition(() => {
        router.push("/dashboard", { scroll: false });
      });
    }, reduceMotion ? 220 : fraudShieldTheme.motion.routeDelayMs);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg-base)] text-white">
      <AnimatedBackground isEntering={isEntering} />

      <motion.section
        initial={false}
        animate={
          isEntering
            ? { opacity: 0, y: -16, scale: 0.985, filter: "blur(8px)" }
            : { opacity: 1, scale: 1, filter: "blur(0px)" }
        }
        transition={{
          duration: reduceMotion ? 0.2 : 0.72,
          ease: transitionEase
        }}
        className="relative z-20 flex min-h-screen items-center justify-center px-6"
      >
        <div className="relative mx-auto flex w-full max-w-[42rem] flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={isEntering ? { opacity: 0, y: -4 } : { opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0.18 : 0.42,
              delay: reduceMotion ? 0 : fraudShieldTheme.motion.stagger,
              ease: transitionEase
            }}
            className="mb-6 inline-flex items-center border border-white/10 bg-white/[0.03] px-4 py-2 text-[0.64rem] uppercase tracking-[0.28em] text-white/52 backdrop-blur-xl"
          >
            {fraudShieldTheme.copy.status}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={
              isEntering
                ? { opacity: 0, y: -6, filter: "blur(10px)" }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            transition={{
              duration: reduceMotion ? 0.2 : fraudShieldTheme.motion.title,
              ease: transitionEase
            }}
            className="font-display text-[clamp(3.2rem,10vw,7.25rem)] font-semibold tracking-[0.16em] text-white/94 [text-shadow:0_0_30px_rgba(109,114,255,0.15)]"
          >
            {fraudShieldTheme.copy.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={
              isEntering
                ? { opacity: 0, y: -2, filter: "blur(8px)" }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            transition={{
              duration: reduceMotion ? 0.2 : fraudShieldTheme.motion.subtitle,
              delay: reduceMotion ? 0 : fraudShieldTheme.motion.stagger * 1.75,
              ease: transitionEase
            }}
            className="mt-5 max-w-[34rem] text-balance text-sm leading-7 text-white/56 md:text-base"
          >
            {fraudShieldTheme.copy.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={isEntering ? { opacity: 0, y: 0 } : { opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0.18 : fraudShieldTheme.motion.button,
              delay: reduceMotion ? 0 : fraudShieldTheme.motion.stagger * 2.6,
              ease: transitionEase
            }}
            className="mt-10"
          >
            <motion.button
              type="button"
              onClick={handleActivate}
              whileHover={reduceMotion ? undefined : { scale: 1.015, y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.988 }}
              transition={{ duration: 0.22, ease: transitionEase }}
              className="inline-flex items-center justify-center border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-6 py-3 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-white/84 shadow-[0_0_30px_rgba(109,114,255,0.08)] backdrop-blur-xl hover:border-white/18 hover:bg-[linear-gradient(180deg,rgba(141,134,255,0.14),rgba(255,255,255,0.03))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-violet)]/50"
            >
              {fraudShieldTheme.copy.button}
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      <TransitionLayer active={isEntering} />
    </main>
  );
}
