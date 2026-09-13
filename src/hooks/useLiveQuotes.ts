"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { demoQuotes, marketSymbols } from "@/data/marketSymbols";

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
  const [quotes, setQuotes] = useState<LiveQuote[]>(demoQuotes);
  const [demoMode, setDemoMode] = useState(true);
  const cacheRef = useRef<Map<string, LiveQuote>>(new Map(demoQuotes.map((q) => [q.code, q])));

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
      const groups = chunk(codes, 6);
      const fetched: LiveQuote[] = [];
      let anyLive = false;

      for (const group of groups) {
        try {
          const response = await fetch(`/api/quotes?symbols=${group.join(",")}`);
          const json = await response.json();
          if (json?.data) {
            fetched.push(...json.data);
            if (!json.demo) anyLive = true;
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
        setDemoMode(!anyLive);
      } else {
        setQuotes((prev) =>
          prev.map((q) => ({
            ...q,
            price: Number((q.price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(2)),
            timestamp: new Date().toISOString(),
            direction: Math.random() > 0.5 ? "up" : "down",
          })),
        );
        setDemoMode(true);
      }

      timer = setTimeout(fetchCycle, 3000);
    };

    fetchCycle();
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [applyUpdate]);

  const tickerTape = useMemo(() => quotes.slice(0, 12), [quotes]);

  return {
    quotes,
    tickerTape,
    demoMode,
    updatedAt: quotes[0]?.timestamp,
  };
}
