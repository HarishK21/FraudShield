import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "warning" | "critical" | "success";

const toneStyles: Record<Tone, string> = {
  neutral: "text-cyan-200 bg-cyan-400/10 border-cyan-400/20",
  warning: "text-amber-100 bg-amber-400/10 border-amber-400/20",
  critical: "text-rose-100 bg-rose-400/10 border-rose-400/20",
  success: "text-emerald-100 bg-emerald-400/10 border-emerald-400/20"
};

export function SummaryCard({
  title,
  value,
  subtitle,
  tone,
  icon: Icon
}: {
  title: string;
  value: string;
  subtitle: string;
  tone: Tone;
  icon: LucideIcon;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>

          <Badge
            variant="neutral"
            className={cn("rounded-2xl px-3 py-2", toneStyles[tone])}
          >
            <Icon className="h-4 w-4" />
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
