"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { marketSymbols } from "@/data/marketSymbols";

export type LiveQuote = {
  code: string;
  label: string;
  price: number;
  changePct: number;
  source: string;
  timestamp: string;
  direction?: "up" | "down";
};

const chunk = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

export function useLiveQuotes() {
  const [quotes, setQuotes] = useState<LiveQuote[]>([]);
  const cacheRef = useRef<Map<string, LiveQuote>>(new Map());

  const applyUpdate = useCallback((incoming: LiveQuote[]) => {
    setQuotes((prev) => {
      const prevMap = new Map(prev.map((q) => [q.code, q]));
      const merged: LiveQuote[] = incoming.map((q) => {
        const prevItem = prevMap.get(q.code);
        const direction: LiveQuote["direction"] = !prevItem || q.price === prevItem.price ? undefined : q.price > prevItem.price ? "up" : "down";
        return { ...q, direction };
      });
      merged.forEach((item) => cacheRef.current.set(item.code, item));
      return merged;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    const fetchCycle = async () => {
      const codes = marketSymbols.map((s) => s.code);
      const groups = chunk(codes, 40);
      const fetched: LiveQuote[] = [];

      for (const group of groups) {
        try {
          const response = await fetch(`/api/quotes?symbols=${group.join(",")}`);
          const json = await response.json();
          if (json?.data) {
            fetched.push(...json.data);
          }
        } catch {
          // noop
        }
        await new Promise((resolve) => setTimeout(resolve, 450));
      }

      if (!isMounted) return;

      if (fetched.length > 0) {
        const byCode = new Map(fetched.map((x) => [x.code, x]));
        const ordered = codes
          .map((code) => byCode.get(code) ?? cacheRef.current.get(code))
          .filter(Boolean) as LiveQuote[];
        applyUpdate(ordered);
      }

      timer = setTimeout(fetchCycle, 30000);
    };

    fetchCycle();
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [applyUpdate]);

  const tickerTape = useMemo(() => quotes.slice(0, 15), [quotes]);

  return {
    quotes,
    tickerTape,
    liveAvailable: quotes.length > 0,
    updatedAt: quotes[0]?.timestamp,
  };
}

export function useLiveQuote(code: string) {
  const [quote, setQuote] = useState<LiveQuote | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const response = await fetch(`/api/quotes?symbols=${encodeURIComponent(code)}`, { cache: "no-store" });
        const payload = (await response.json()) as { data?: LiveQuote[] };
        if (mounted && payload.data?.[0]) setQuote(payload.data[0]);
      } catch {
        // Keep the last quote visible during a temporary network failure.
      }
      if (mounted) timer = setTimeout(load, 30000);
    };

    void load();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [code]);

  return quote;
}
