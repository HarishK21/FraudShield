import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "border-white/10 bg-white/5 text-slate-200",
        success: "border-emerald-400/20 bg-emerald-400/15 text-emerald-100",
        warning: "border-amber-400/20 bg-amber-400/15 text-amber-100",
        critical: "border-rose-400/20 bg-rose-400/15 text-rose-100",
        info: "border-cyan-400/20 bg-cyan-400/15 text-cyan-100"
      }
    },
    defaultVariants: {
      variant: "neutral"
    }
  }
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string;
}

export function Badge({
  className,
  variant,
  ...props
}: BadgeProps & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
