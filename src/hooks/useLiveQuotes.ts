"use client";

import { useMemo } from "react";
import useSWR from "swr";
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

const quoteGroups = chunk(marketSymbols.map((symbol) => symbol.code), 40);
const quoteCacheKey = `live-quotes:${quoteGroups.map((group) => group.join(",")).join("|")}`;
const previousQuotePrices = new Map<string, number>();
const emptyQuotes: LiveQuote[] = [];

async function fetchMarketQuotes(): Promise<LiveQuote[]> {
  const batches = await Promise.all(quoteGroups.map(async (group) => {
    try {
      const response = await fetch(`/api/quotes?symbols=${group.join(",")}`);
      if (!response.ok) return [];
      const payload = (await response.json()) as { data?: LiveQuote[] };
      return payload.data ?? [];
    } catch {
      return [];
    }
  }));
  return batches.flat().map((quote) => {
    const previousPrice = previousQuotePrices.get(quote.code);
    const direction: LiveQuote["direction"] = previousPrice === undefined || previousPrice === quote.price
      ? undefined
      : quote.price > previousPrice ? "up" : "down";
    previousQuotePrices.set(quote.code, quote.price);
    return { ...quote, direction };
  });
}

export function useLiveQuotes() {
  const { data, isLoading } = useSWR(quoteCacheKey, fetchMarketQuotes, {
    refreshInterval: 30_000,
    dedupingInterval: 25_000,
    focusThrottleInterval: 30_000,
    revalidateOnReconnect: true,
  });
  const quotes = data ?? emptyQuotes;
  const tickerTape = useMemo(() => quotes.slice(0, 15), [quotes]);

  return {
    quotes,
    tickerTape,
    liveAvailable: quotes.length > 0,
    updatedAt: quotes[0]?.timestamp,
    isLoading,
  };
}

export function useLiveQuote(code: string) {
  const { quotes } = useLiveQuotes();
  return quotes.find((quote) => quote.code === code) ?? null;
}
