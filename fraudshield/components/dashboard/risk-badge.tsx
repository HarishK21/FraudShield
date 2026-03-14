import { AlertStatus, RiskStatus } from "@/lib/fraud/types";
import { Badge } from "@/components/ui/badge";

export function RiskBadge({
  value
}: {
  value: RiskStatus | AlertStatus | "Low" | "Medium" | "High";
}) {
  if (value === "High Risk" || value === "High") {
    return <Badge variant="critical">{value}</Badge>;
  }

  if (value === "Watch" || value === "Medium" || value === "Acknowledged") {
    return <Badge variant="warning">{value}</Badge>;
  }

  if (value === "Resolved" || value === "Normal" || value === "Low") {
    return <Badge variant="success">{value}</Badge>;
  }

  return <Badge variant="neutral">{value}</Badge>;
}
