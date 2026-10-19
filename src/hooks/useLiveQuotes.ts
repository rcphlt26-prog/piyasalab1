"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { marketSymbols } from "@/data/marketSymbols";
import { getStaticMarketFallback } from "@/data/marketFallback";

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
const LOCAL_CACHE_KEY = "veriakis:last-successful-quotes:v3";
const staticFallback = getStaticMarketFallback();

function readLocalQuotes(): LiveQuote[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { quotes?: LiveQuote[] };
    return Array.isArray(parsed.quotes) && parsed.quotes.length > 0 ? parsed.quotes : null;
  } catch {
    return null;
  }
}

function persistLocalQuotes(quotes: LiveQuote[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({ quotes, updatedAt: new Date().toISOString() }));
  } catch {
    // no-op
  }
}

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

  const merged = batches.flat().map((quote) => {
    const previousPrice = previousQuotePrices.get(quote.code);
    const direction: LiveQuote["direction"] = previousPrice === undefined || previousPrice === quote.price
      ? undefined
      : quote.price > previousPrice ? "up" : "down";
    previousQuotePrices.set(quote.code, quote.price);
    return { ...quote, direction };
  });

  if (merged.length > 0) persistLocalQuotes(merged);
  return merged;
}

export function useLiveQuotes() {
  const { data, isLoading, isValidating } = useSWR(quoteCacheKey, fetchMarketQuotes, {
    refreshInterval: 30_000,
    dedupingInterval: 25_000,
    focusThrottleInterval: 30_000,
    revalidateOnReconnect: true,
  });

  const localQuotes = readLocalQuotes();
  const quotes = useMemo(() => {
    if (data && data.length > 0) return data;
    if (localQuotes && localQuotes.length > 0) return localQuotes;
    return staticFallback;
  }, [data, localQuotes]);

  const tickerTape = useMemo(() => quotes.slice(0, 15), [quotes]);
  const usingFallback = !data || data.length === 0;

  return {
    quotes,
    tickerTape,
    liveAvailable: !usingFallback,
    updatedAt: quotes[0]?.timestamp,
    isLoading,
    isValidating,
    isFallback: usingFallback,
    fallbackReason: usingFallback ? (localQuotes?.length ? "cache" : "static") : null as null | "cache" | "static",
  };
}

export function useLiveQuote(code: string) {
  const { quotes } = useLiveQuotes();
  return quotes.find((quote) => quote.code === code) ?? null;
}
