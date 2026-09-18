"use client";

import { useEffect, useState } from "react";
import type { LineData, Time } from "lightweight-charts";

export type HistoricalPrice = LineData<Time>;

type HistoryResponse = {
  data?: HistoricalPrice[];
  source?: string;
  error?: string;
};

export function useHistoricalPrices(code: string, range = "MAX") {
  const [data, setData] = useState<HistoricalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!code) {
      return () => {
        mounted = false;
      };
    }

    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/quotes/history?symbol=${encodeURIComponent(code)}&range=${range}`, { cache: "no-store" });
        const payload = (await response.json()) as HistoryResponse;
        if (mounted) {
          setData(payload.data ?? []);
          setSource(payload.source ?? null);
        }
      } catch {
        if (mounted) setData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [code, range]);

  return { data: code ? data : [], loading: code ? loading : false, source: code ? source : null };
}