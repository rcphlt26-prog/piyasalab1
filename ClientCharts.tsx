"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type GenericPoint = Record<string, string | number>;

export function OverlayLineChart({ data, keys, logScale = false }: { data: GenericPoint[]; keys: string[]; logScale?: boolean }) {
  const colors = ["#10b981", "#38bdf8", "#f43f5e", "#f59e0b", "#a78bfa", "#34d399", "#fb7185"];
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ left: 10, right: 12, top: 10, bottom: 6 }}>
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
        <XAxis dataKey="year" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" scale={logScale ? "log" : "linear"} domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }}
          labelStyle={{ color: "#e2e8f0" }}
        />
        {keys.map((key, index) => (
          <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({ data, xKey, yKey }: { data: GenericPoint[]; xKey: string; yKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
        <XAxis dataKey={xKey} stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
        <Bar dataKey={yKey} fill="#10b981" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function InsiderFlowChart({ data }: { data: { tur: string; tutar: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
        <XAxis dataKey="tur" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
        <Bar dataKey="tutar" radius={[8, 8, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.tur} fill={d.tur === "Alım" ? "#10b981" : d.tur === "Satım" ? "#f43f5e" : "#38bdf8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ScoreRadar({ data }: { data: { metric: string; score: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={270}>
      <RadarChart data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="metric" stroke="#cbd5e1" />
        <PolarRadiusAxis stroke="#64748b" angle={30} domain={[0, 10]} />
        <Radar dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function AllocationChart({ data }: { data: { ad: string; oran: number }[] }) {
  const colors = ["#10b981", "#38bdf8", "#f59e0b", "#f43f5e"];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="oran" nameKey="ad" outerRadius={90} innerRadius={45}>
          {data.map((item, idx) => (
            <Cell key={item.ad} fill={colors[idx % colors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
