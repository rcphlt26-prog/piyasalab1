"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
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

type TimeFrame = "1A" | "3A" | "6A" | "1Y" | "TÜMÜ";

export function PriceChart({ data = [], candles, height = 380 }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("TÜMÜ");

  const filterDataByTimeFrame = <T extends { time: Time }>(items: T[]): T[] => {
    if (!items || items.length === 0 || timeFrame === "TÜMÜ") return items;

    const now = Date.now() / 1000;
    let cutoffTime = now;

    switch (timeFrame) {
      case "1A":
        cutoffTime = now - 30 * 24 * 60 * 60;
        break;
      case "3A":
        cutoffTime = now - 90 * 24 * 60 * 60;
        break;
      case "6A":
        cutoffTime = now - 180 * 24 * 60 * 60;
        break;
      case "1Y":
        cutoffTime = now - 365 * 24 * 60 * 60;
        break;
      default:
        return items;
    }

    return items.filter((item) => {
      let itemTime = 0;
      if (typeof item.time === "number") {
        itemTime = item.time;
      } else if (typeof item.time === "string") {
        itemTime = new Date(item.time).getTime() / 1000;
      }
      return itemTime >= cutoffTime;
    });
  };

  const filteredData = useMemo(() => filterDataByTimeFrame(data), [data, timeFrame]);
  const filteredCandles = useMemo(() => filterDataByTimeFrame(candles || []), [candles, timeFrame]);

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

    // Doğrudan chart instance metodları kullanılarak tip güvenliği sağlandı
    if (filteredCandles && filteredCandles.length > 0) {
      // @ts-ignore
      const series = chart.addCandlestickSeries({
        upColor: "#10b981",
        downColor: "#f43f5e",
        borderUpColor: "#10b981",
        borderDownColor: "#f43f5e",
        wickUpColor: "#10b981",
        wickDownColor: "#f43f5e",
      });
      series.setData(filteredCandles);
    } else if (filteredData.length > 0) {
      // @ts-ignore
      const series = chart.addLineSeries({
        color: "#38bdf8",
        lineWidth: 2.5,
        crosshairMarkerBackgroundColor: "#0ea5e9",
        crosshairMarkerBorderColor: "#ffffff",
        crosshairMarkerRadius: 5,
        priceLineColor: "#38bdf8",
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
          {(["1A", "3A", "6A", "1Y", "TÜMÜ"] as TimeFrame[]).map((tf) => (
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