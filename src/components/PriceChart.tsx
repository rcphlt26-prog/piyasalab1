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

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "#94a3b8",
        fontFamily: "inherit",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.03)" },
        horzLines: { color: "rgba(255, 255, 255, 0.03)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(56, 189, 248, 0.4)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#0284c7",
        },
        horzLine: {
          color: "rgba(56, 189, 248, 0.4)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#0284c7",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        scaleMargins: { top: 0.2, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    if (filteredCandles && filteredCandles.length > 0) {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#10b981",
        downColor: "#f43f5e",
        borderUpColor: "#10b981",
        borderDownColor: "#f43f5e",
        wickUpColor: "#10b981",
        wickDownColor: "#f43f5e",
      });
      series.setData(filteredCandles);
    } else if (filteredData.length > 0) {
      const series = chart.addSeries(AreaSeries, {
        lineColor: "#22d3ee",
        topColor: "rgba(34, 211, 238, 0.28)",
        bottomColor: "rgba(34, 211, 238, 0.02)",
        lineWidth: 2,
        crosshairMarkerBackgroundColor: "#0891b2",
        crosshairMarkerBorderColor: "#ecfeff",
        crosshairMarkerRadius: 5,
        priceLineColor: "#22d3ee",
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
        <span className="text-xs font-medium text-gray-400">Grafik Zaman Dilimi</span>
        <div className="flex items-center gap-1 bg-gray-900/60 p-1 rounded-lg border border-gray-800">
          {(["1A", "3A", "6A", "1Y", "5Y", "MAX"] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                timeFrame === tf
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
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
