"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  AreaSeries,
  CandlestickSeries,
  createChart,
  type CandlestickData,
  type LineData,
  type Time,
} from "lightweight-charts";

export type PricePoint = LineData<Time>;
export type CandlePoint = CandlestickData<Time>;

type PriceChartProps = {
  data?: PricePoint[];
  candles?: CandlePoint[];
  height?: number;
};

type TimeFrame = "1A" | "3A" | "6A" | "1Y" | "5Y" | "MAX";

function toUnixTime(time: Time) {
  if (typeof time === "number") return time;
  if (typeof time === "string") return new Date(time).getTime() / 1000;
  return new Date(`${time.year}-${String(time.month).padStart(2, "0")}-${String(time.day).padStart(2, "0")}`).getTime() / 1000;
}

function filterDataByTimeFrame<T extends { time: Time }>(items: T[], timeFrame: TimeFrame): T[] {
  if (!items.length || timeFrame === "MAX") return items;

  const latestTime = Math.max(...items.map((item) => toUnixTime(item.time)));
  const daysByFrame: Partial<Record<TimeFrame, number>> = { "1A": 30, "3A": 90, "6A": 180, "1Y": 365, "5Y": 365 * 5 };
  const days = daysByFrame[timeFrame];
  if (!days) return items;

  const cutoffTime = latestTime - days * 24 * 60 * 60;
  return items.filter((item) => toUnixTime(item.time) >= cutoffTime);
}

export function PriceChart({ data = [], candles, height = 380 }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("MAX");

  const filteredData = useMemo(() => filterDataByTimeFrame(data, timeFrame), [data, timeFrame]);
  const filteredCandles = useMemo(() => filterDataByTimeFrame(candles || [], timeFrame), [candles, timeFrame]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const styles = getComputedStyle(container);
    const textColor = styles.getPropertyValue("--text-secondary").trim() || "#94a3b8";
    const borderColor = styles.getPropertyValue("--border").trim() || "rgba(148, 163, 184, 0.18)";
    const primary = styles.getPropertyValue("--color-primary-light").trim() || "#22d3ee";
    const surface = styles.getPropertyValue("--surface-2").trim() || "#0f172a";

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor,
        fontFamily: "inherit",
      },
      grid: {
        vertLines: { color: borderColor },
        horzLines: { color: borderColor },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: primary,
          width: 1,
          style: 3,
          labelBackgroundColor: primary,
        },
        horzLine: {
          color: primary,
          width: 1,
          style: 3,
          labelBackgroundColor: primary,
        },
      },
      rightPriceScale: {
        borderColor,
        scaleMargins: { top: 0.2, bottom: 0.1 },
      },
      timeScale: {
        borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    if (filteredCandles && filteredCandles.length > 0) {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#f43f5e",
        borderUpColor: "#22c55e",
        borderDownColor: "#f43f5e",
        wickUpColor: "#22c55e",
        wickDownColor: "#f43f5e",
      });
      series.setData(filteredCandles);
    } else if (filteredData.length > 0) {
      const series = chart.addSeries(AreaSeries, {
        lineColor: primary,
        topColor: `${primary}55`,
        bottomColor: `${surface}00`,
        lineWidth: 2,
        crosshairMarkerBackgroundColor: primary,
        crosshairMarkerBorderColor: textColor,
        crosshairMarkerRadius: 5,
        priceLineColor: primary,
        lastValueVisible: true,
      });
      series.setData(filteredData);
    }

    if ((filteredCandles?.length ?? 0) > 0 || filteredData.length > 0) {
      chart.timeScale().fitContent();
    }

    const resizeChart = () => {
      chart.applyOptions({ width: container.clientWidth, height });
    };

    window.addEventListener("resize", resizeChart);
    return () => {
      window.removeEventListener("resize", resizeChart);
      chart.remove();
    };
  }, [filteredCandles, filteredData, height]);

  return (
    <div className="w-full flex flex-col p-2">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="app-muted text-xs font-medium">Grafik Zaman Dilimi</span>
        <div className="app-surface-2 app-border flex items-center gap-1 rounded-lg border p-1">
          {(["1A", "3A", "6A", "1Y", "5Y", "MAX"] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                timeFrame === tf
                  ? "bg-[var(--color-primary)] text-white shadow-md shadow-cyan-500/20"
                  : "app-text-secondary hover:app-surface-3"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="w-full overflow-hidden rounded-xl bg-[#0b1220]/60 p-2 border border-gray-800/60 shadow-inner" style={{ minHeight: height }} />
    </div>
  );
}
