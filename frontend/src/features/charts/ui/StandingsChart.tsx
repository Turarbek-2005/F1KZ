"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DriverStanding, TeamStanding } from "@/entities/f1api/f1api.interfaces";

const TEAM_COLORS: Record<string, string> = {
  mercedes: "#00d2bd",
  ferrari: "#dc0000",
  red_bull: "#005aff",
  mclaren: "#ff8700",
  aston_martin: "#006f62",
  alpine: "#0090ff",
  williams: "#1e41ff",
  haas: "#aaaaaa",
  rb: "#6692ff",
  audi: "#ff4141",
  cadillac: "#c2baa4",
};

function teamColor(teamId?: string) {
  if (!teamId) return "#666";
  return TEAM_COLORS[teamId.toLowerCase().replace(" ", "_")] ?? "#888";
}

interface DriverChartProps {
  standings: DriverStanding[];
}

export function DriverStandingsChart({ standings }: DriverChartProps) {
  const data = standings
    .filter((d) => d.position != null)
    .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
    .slice(0, 20)
    .map((d) => ({
      name: d.driver?.shortName ?? d.driverId,
      points: d.points ?? 0,
      teamId: d.teamId ?? "",
    }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
      >
        <XAxis
          type="number"
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={38}
          tick={{ fill: "#e5e7eb", fontSize: 11, fontWeight: 700 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
          contentStyle={{
            background: "#1a1a2e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "#fff",
            fontSize: 12,
          }}
          formatter={(v: unknown) => [`${v} pts`, "Points"] as [string, string]}
        />
        <Bar dataKey="points" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((entry, i) => (
            <Cell key={i} fill={teamColor(entry.teamId)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TeamChartProps {
  standings: TeamStanding[];
}

export function TeamStandingsChart({ standings }: TeamChartProps) {
  const data = standings
    .filter((t) => t.position != null)
    .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
    .map((t) => ({
      name: t.team?.teamName ?? t.teamId,
      points: t.points ?? 0,
      teamId: t.teamId,
    }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
      >
        <XAxis
          type="number"
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={80}
          tick={{ fill: "#e5e7eb", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
          contentStyle={{
            background: "#1a1a2e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "#fff",
            fontSize: 12,
          }}
          formatter={(v: unknown) => [`${v} pts`, "Points"] as [string, string]}
        />
        <Bar dataKey="points" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {data.map((entry, i) => (
            <Cell key={i} fill={teamColor(entry.teamId)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
