import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type FraudSession } from "@/lib/fraud/types";

export function RiskFactorList({ session }: { session: FraudSession }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Factors</CardTitle>
        <CardDescription>
          Weighted rules remain readable so the scoring model is easy to tune.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {session.summary.riskFactors.map((factor) => (
            <Badge key={factor.key} variant="warning" className="px-3 py-1.5">
              {factor.label}
            </Badge>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {session.summary.riskFactors.map((factor) => (
            <div
              key={factor.key}
              className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-100">{factor.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{factor.description}</p>
                </div>
                <Badge variant={factor.points >= 15 ? "critical" : "warning"}>
                  +{factor.points}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {session.summary.behaviorDrift.active ? (
          <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06] p-4">
            <p className="text-sm font-medium text-cyan-100">Behavior drift signal</p>
            <ul className="mt-2 space-y-1 text-sm text-cyan-50/80">
              {session.summary.behaviorDrift.deviations.map((deviation) => (
                <li key={deviation}>{deviation}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
