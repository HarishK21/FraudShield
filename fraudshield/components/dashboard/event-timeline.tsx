import { Activity, CheckCircle2, MousePointerClick, ScanLine, Timer, WandSparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/fraud/selectors";
import { type TelemetryEvent } from "@/lib/fraud/types";

function getEventMeta(eventType: TelemetryEvent["eventType"]) {
  switch (eventType) {
    case "page_view":
      return { label: "Page View", icon: Activity };
    case "nav_click":
      return { label: "Navigation Click", icon: MousePointerClick };
    case "account_card_click":
      return { label: "Account Card Click", icon: MousePointerClick };
    case "transfer_field_focus":
      return { label: "Field Focus", icon: ScanLine };
    case "transfer_amount_change":
      return { label: "Amount Edit", icon: WandSparkles };
    case "hesitation_detected":
      return { label: "Hesitation Detected", icon: Timer };
    case "review_transfer":
      return { label: "Review Transfer", icon: Activity };
    case "submit_transfer":
      return { label: "Submit Transfer", icon: CheckCircle2 };
    default:
      return { label: eventType, icon: Activity };
  }
}

export function EventTimeline({ events }: { events: TelemetryEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Timeline</CardTitle>
        <CardDescription>
          Ordered view of high-level behavioral telemetry from the banking flow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => {
          const { icon: Icon, label } = getEventMeta(event.eventType);

          return (
            <div
              key={event.id}
              className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4"
            >
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-slate-900/70">
                <Icon className="h-4 w-4 text-cyan-200" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-100">{label}</p>
                  <Badge variant="neutral">{event.page}</Badge>
                  {event.elementId ? <Badge variant="neutral">{event.elementId}</Badge> : null}
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {formatDateTime(event.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
