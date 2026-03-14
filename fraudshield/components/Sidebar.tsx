"use client";

import { motion, useReducedMotion } from "framer-motion";

type SidebarProps = {
  animateIn?: boolean;
  preview?: boolean;
};

type NavItem = {
  active?: boolean;
  label: string;
  path: string;
};

const navItems: NavItem[] = [
  { active: true, label: "Overview", path: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" },
  { label: "Signals", path: "M4 18l5-5 3 3 8-8" },
  { label: "Incidents", path: "M12 3l8 15H4L12 3zm0 5v4m0 4h.01" },
  { label: "Sessions", path: "M5 7h14M8 12h8M10 17h4" },
  { label: "Settings", path: "M4 7h10M4 17h16M14 7v10" }
];

const sidebarEase = [0.16, 0.84, 0.24, 1] as const;

function SidebarIcon({ path }: { path: string }) {
  return (
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
  );
}

export function Sidebar({ animateIn = false, preview = false }: SidebarProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.aside
      initial={animateIn ? { opacity: 0, x: -18 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.58,
        ease: sidebarEase
      }}
      className="hidden w-[88px] shrink-0 border-r border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.008))] md:flex md:flex-col md:justify-between"
    >
      <div>
        <div className="flex h-[76px] items-center justify-center border-b border-white/8">
          <div className="grid h-11 w-11 place-items-center border border-white/10 bg-[linear-gradient(180deg,rgba(123,110,255,0.16),rgba(123,110,255,0.04))] text-white/88">
            <div className="h-3 w-3 border border-[#9d90ff]/80" />
          </div>
        </div>

        <nav className="px-3 py-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <div
                  className={`group flex h-11 items-center justify-center border transition-colors ${
                    item.active
                      ? "border-white/10 bg-[linear-gradient(180deg,rgba(126,112,255,0.12),rgba(126,112,255,0.03))] text-white"
                      : "border-transparent text-white/38 hover:border-white/8 hover:bg-white/[0.02] hover:text-white/68"
                  }`}
                  title={item.label}
                >
                  <SidebarIcon path={item.path} />
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/8 px-3 py-4">
        <div className="flex h-11 items-center justify-center border border-white/8 bg-white/[0.02] text-white/60">
          <SidebarIcon path="M12 3v18M3 12h18" />
        </div>
      </div>
    </motion.aside>
  );
}
