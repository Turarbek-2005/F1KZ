"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { DriverResultEntry } from "@/entities/f1api/f1api.interfaces";

interface Props {
  results: DriverResultEntry[];
  color?: string;
}

export function DriverPointsChart({ results, color = "#ef4444" }: Props) {
  let cumulative = 0;
  const data = results.map((r) => {
    cumulative += r.result?.pointsObtained ?? 0;
    return {
      round: `R${r.race?.round ?? ""}`,
      race: r.race?.name ?? "",
      pts: r.result?.pointsObtained ?? 0,
      total: cumulative,
    };
  });

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="round"
          tick={{ fill: "#9ca3af", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a2e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "#fff",
            fontSize: 12,
          }}
          formatter={(v: unknown, name: unknown) =>
            [`${v} pts`, name === "total" ? "Cumulative" : "This race"] as [string, string]
          }
          labelFormatter={(label, payload) =>
            payload?.[0]?.payload?.race ?? label
          }
        />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
        <Line
          type="monotone"
          dataKey="total"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
