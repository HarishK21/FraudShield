"use client";

import { motion, useReducedMotion } from "framer-motion";

import { ambientEase, fraudShieldTheme, transitionEase } from "@/lib/fraudshield-theme";

type AnimatedBackgroundProps = {
  isEntering: boolean;
};

const particles = [
  { delay: 0.2, duration: 16, left: 16, size: 2, top: 18 },
  { delay: 1.1, duration: 18, left: 24, size: 3, top: 72 },
  { delay: 0.5, duration: 14, left: 31, size: 2, top: 38 },
  { delay: 1.7, duration: 17, left: 42, size: 2, top: 24 },
  { delay: 0.8, duration: 19, left: 48, size: 3, top: 62 },
  { delay: 1.3, duration: 15, left: 54, size: 2, top: 46 },
  { delay: 0.4, duration: 18, left: 62, size: 2, top: 20 },
  { delay: 1.9, duration: 16, left: 68, size: 3, top: 74 },
  { delay: 0.7, duration: 14, left: 73, size: 2, top: 34 },
  { delay: 1.5, duration: 17, left: 81, size: 2, top: 58 }
] as const;

const streaks = [
  { delay: 0.1, duration: 17, opacity: 0.22, top: "24%" },
  { delay: 1.8, duration: 19, opacity: 0.16, top: "66%" }
] as const;

export function AnimatedBackground({
  isEntering
}: AnimatedBackgroundProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${fraudShieldTheme.colors.bgBase} 0%, #040914 44%, #050812 100%)`
        }}
      />

      <motion.div
        initial={false}
        animate={
          reduceMotion
            ? { opacity: isEntering ? 0.82 : 0.68, scale: isEntering ? 1.08 : 1 }
            : isEntering
              ? { opacity: 0.84, scale: 1.14 }
              : { opacity: [0.62, 0.76, 0.62], scale: [1, 1.05, 1] }
        }
        transition={
          reduceMotion || isEntering
            ? {
                duration: reduceMotion ? 0.2 : fraudShieldTheme.motion.transition,
                ease: transitionEase
              }
            : {
                duration: fraudShieldTheme.motion.backgroundPulse,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY
              }
        }
        className="absolute left-1/2 top-[46%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] md:h-[42rem] md:w-[42rem]"
        style={{
          background: `radial-gradient(circle, ${fraudShieldTheme.colors.glowViolet} 0%, ${fraudShieldTheme.colors.glowRose} 34%, rgba(125,220,255,0.06) 56%, transparent 74%)`
        }}
      />

      <motion.div
        initial={false}
        animate={
          reduceMotion
            ? { opacity: isEntering ? 0.22 : 0.18 }
            : { opacity: isEntering ? 0.24 : [0.14, 0.2, 0.14] }
        }
        transition={
          reduceMotion || isEntering
            ? {
                duration: reduceMotion ? 0.2 : fraudShieldTheme.motion.transition,
                ease: transitionEase
              }
            : {
                duration: fraudShieldTheme.motion.backgroundPulse + 2,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY
              }
        }
        className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8 bg-white/[0.02] backdrop-blur-[2px] md:h-[28rem] md:w-[28rem]"
      />

      <motion.div
        initial={false}
        animate={
          reduceMotion
            ? { backgroundPosition: "0px 0px" }
            : { backgroundPosition: ["0px 0px", "0px 140px"] }
        }
        transition={{
          duration: fraudShieldTheme.motion.scanline * 1.6,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY
        }}
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.026) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.026) 1px, transparent 1px)",
          backgroundSize: "120px 120px"
        }}
      />

      {streaks.map((streak) => (
        <motion.div
          key={streak.top}
          initial={false}
          animate={
            reduceMotion
              ? { opacity: streak.opacity }
              : { opacity: [0, streak.opacity, 0], x: ["-10%", "12%", "26%"] }
          }
          transition={{
            duration: streak.duration,
            delay: streak.delay,
            ease: ambientEase,
            repeat: Number.POSITIVE_INFINITY
          }}
          className="absolute left-[-18%] h-px w-[60%] blur-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(155,167,255,0.42) 38%, rgba(255,136,200,0.24) 72%, transparent 100%)",
            top: streak.top
          }}
        />
      ))}

      <motion.div
        initial={false}
        animate={
          reduceMotion
            ? { opacity: isEntering ? 0.16 : 0.1 }
            : { opacity: isEntering ? 0.2 : 0.1, y: ["-18%", "112%"] }
        }
        transition={{
          duration: fraudShieldTheme.motion.scanline,
          ease: "linear",
          repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY
        }}
        className="absolute inset-x-0 h-24 bg-[linear-gradient(180deg,transparent_0%,rgba(141,134,255,0.08)_45%,transparent_100%)] blur-2xl"
      />

      {particles.map((particle) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 0.28 }
              : {
                  opacity: [0.16, 0.42, 0.16],
                  x: [0, 10, -4, 0],
                  y: [0, -14, 8, 0]
                }
          }
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY
          }}
          className="absolute rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.88) 0%, rgba(141,134,255,0.46) 34%, rgba(141,134,255,0) 72%)",
            height: particle.size,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(1,3,10,0.52)_72%,rgba(1,2,8,0.94)_100%)]" />
    </div>
  );
}
