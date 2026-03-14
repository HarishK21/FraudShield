"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type AlertsOverTimePoint } from "@/lib/fraud/types";

export function AlertsOverTimeChart({
  data
}: {
  data: AlertsOverTimePoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts Over Time</CardTitle>
        <CardDescription>
          Triggered alerts by severity over the last six hours.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="alert-high" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb7185" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="alert-medium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.65} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="alert-low" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(2, 6, 23, 0.94)",
                border: "1px solid rgba(148, 163, 184, 0.16)",
                borderRadius: "16px",
                color: "#e2e8f0"
              }}
            />
            <Area
              type="monotone"
              dataKey="high"
              stackId="alerts"
              stroke="#fb7185"
              fill="url(#alert-high)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="medium"
              stackId="alerts"
              stroke="#fbbf24"
              fill="url(#alert-medium)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="low"
              stackId="alerts"
              stroke="#22d3ee"
              fill="url(#alert-low)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
