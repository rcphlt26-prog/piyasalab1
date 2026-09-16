"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

type Props = {
  data: number[];
  width?: number;
  height?: number;
  trend?: "up" | "down";
};

export function Sparkline({ data, width = 60, height = 30, trend }: Props) {
  const first = data[0] ?? 0;
  const last = data[data.length - 1] ?? 0;
  const direction: "up" | "down" = trend ?? (last >= first ? "up" : "down");
  const color = direction === "up" ? "#10b981" : "#f43f5e";
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.6} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Deterministik 7 (veya n) noktalı fiyat serisi üretir — ticker'a göre sabit. */
export function generateSparkData(seedText: string, length = 20): number[] {
  const seed = seedText.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  let current = 100;
  return Array.from({ length }, (_, i) => {
    const wave = Math.sin((i + (seed % 11)) / 2.1) * 2.4;
    const drift = ((seed % 7) - 3) * 0.35;
    current = current * (1 + (wave + drift) / 100);
    return Number(current.toFixed(2));
  });
}
