"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  createChart,
  LineSeries,
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

const DEFAULT_DATA: PricePoint[] = [
  { time: "2026-01-02", value: 100 },
  { time: "2026-01-05", value: 102.4 },
  { time: "2026-01-06", value: 101.1 },
  { time: "2026-01-07", value: 104.8 },
  { time: "2026-01-08", value: 106.2 },
  { time: "2026-01-09", value: 105.4 },
];

export function PriceChart({ data = DEFAULT_DATA, candles, height = 360 }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { color: "#0b1220" },
        textColor: "#94a3b8",
        fontFamily: "inherit",
      },
      grid: {
        vertLines: { color: "#172235" },
        horzLines: { color: "#172235" },
      },
      crosshair: {
        vertLine: { color: "#38bdf8", labelBackgroundColor: "#0ea5e9" },
        horzLine: { color: "#38bdf8", labelBackgroundColor: "#0ea5e9" },
      },
      rightPriceScale: { borderColor: "#263449" },
      timeScale: {
        borderColor: "#263449",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    if (candles && candles.length > 0) {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#10b981",
        downColor: "#f43f5e",
        borderUpColor: "#10b981",
        borderDownColor: "#f43f5e",
        wickUpColor: "#10b981",
        wickDownColor: "#f43f5e",
      });
      series.setData(candles);
    } else {
      const series = chart.addSeries(LineSeries, {
        color: "#38bdf8",
        lineWidth: 2,
        crosshairMarkerBackgroundColor: "#38bdf8",
        crosshairMarkerBorderColor: "#e0f2fe",
        priceLineColor: "#38bdf8",
        lastValueVisible: true,
      });
      series.setData(data);
    }

    chart.timeScale().fitContent();

    const resizeChart = () => {
      chart.applyOptions({ width: container.clientWidth, height });
    };

    window.addEventListener("resize", resizeChart);
    return () => {
      window.removeEventListener("resize", resizeChart);
      chart.remove();
    };
  }, [candles, data, height]);

  return <div ref={containerRef} className="w-full overflow-hidden rounded-xl" style={{ minHeight: height }} />;
}
