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
      const nextMap = new Map(prevMap);
      incoming.forEach((q) => {
        const prevItem = prevMap.get(q.code);
        const direction: LiveQuote["direction"] = !prevItem || q.price === prevItem.price ? undefined : q.price > prevItem.price ? "up" : "down";
        nextMap.set(q.code, { ...q, direction });
      });
      nextMap.forEach((item) => cacheRef.current.set(item.code, item));
      return marketSymbols.map((symbol) => nextMap.get(symbol.code)).filter(Boolean) as LiveQuote[];
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    const fetchCycle = async () => {
      const codes = marketSymbols.map((s) => s.code);
      const groups = chunk(codes, 40);
      const fetchGroup = async (group: string[]) => {
        try {
          const response = await fetch(`/api/quotes?symbols=${group.join(",")}`);
          const json = await response.json();
          if (isMounted && json?.data?.length) applyUpdate(json.data as LiveQuote[]);
        } catch {
          // noop
        }
      };

      await Promise.all(groups.map(fetchGroup));
      if (!isMounted) return;

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
