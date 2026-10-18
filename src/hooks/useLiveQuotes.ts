"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { marketSymbols, marketSymbolByCode } from "@/data/marketSymbols";
import { FALLBACK_CODE_MAP, MARKET_FALLBACK } from "@/data/fallbackData";

export type LiveQuote = {
  code: string;
  label: string;
  price: number;
  changePct: number;
  source: string;
  timestamp: string;
  direction?: "up" | "down";
  /** true → canlı veri yerine son kapanış (fallback) değeri */
  isFallback?: boolean;
  low52?: number;
  high52?: number;
};

const chunk = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

const quoteGroups = chunk(marketSymbols.map((symbol) => symbol.code), 40);
const quoteCacheKey = `live-quotes:${quoteGroups.map((group) => group.join(",")).join("|")}`;
const previousQuotePrices = new Map<string, number>();
// Stale-while-revalidate: son başarılı canlı yanıt, API geçici olarak başarısız olursa yeniden kullanılır
let lastGoodQuotes: LiveQuote[] = [];

function buildFallbackQuotes(): LiveQuote[] {
  const timestamp = new Date().toISOString();
  return Object.entries(FALLBACK_CODE_MAP).map(([code, key]) => {
    const item = MARKET_FALLBACK[key];
    return {
      code,
      label: marketSymbolByCode.get(code)?.label ?? item.label,
      price: item.price,
      changePct: item.changePercent,
      source: "fallback",
      timestamp,
      isFallback: true,
      low52: item.low52,
      high52: item.high52,
    };
  });
}

/** Canlı listede eksik kalan sembolleri son kapanış verisiyle tamamlar. */
function withFallback(quotes: LiveQuote[]): LiveQuote[] {
  const present = new Set(quotes.map((quote) => quote.code));
  const missing = buildFallbackQuotes().filter((quote) => !present.has(quote.code));
  return missing.length ? [...quotes, ...missing] : quotes;
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
  const live = batches.flat().filter((quote) => Number.isFinite(quote?.price) && quote.price > 0);

  // Başarısız / boş yanıt (rate-limit, hafta sonu, ağ hatası): önce son canlı veri, yoksa son kapanış
  if (live.length === 0) return lastGoodQuotes.length ? lastGoodQuotes : buildFallbackQuotes();

  const quotes = live.map((quote) => {
    const previousPrice = previousQuotePrices.get(quote.code);
    const direction: LiveQuote["direction"] = previousPrice === undefined || previousPrice === quote.price
      ? undefined
      : quote.price > previousPrice ? "up" : "down";
    previousQuotePrices.set(quote.code, quote.price);
    return { ...quote, direction, isFallback: false };
  });
  lastGoodQuotes = quotes;
  return quotes;
}

export function useLiveQuotes() {
  const { data, isLoading } = useSWR(quoteCacheKey, fetchMarketQuotes, {
    refreshInterval: 30_000,
    dedupingInterval: 25_000,
    focusThrottleInterval: 30_000,
    revalidateOnReconnect: true,
    keepPreviousData: true,
  });
  const quotes = useMemo(
    () => (data ? withFallback(data) : isLoading ? [] : buildFallbackQuotes()),
    [data, isLoading],
  );
  const tickerTape = useMemo(() => quotes.slice(0, 15), [quotes]);
  const liveQuote = quotes.find((quote) => !quote.isFallback);

  return {
    quotes,
    tickerTape,
    liveAvailable: Boolean(liveQuote),
    isFallback: quotes.length > 0 && !liveQuote,
    updatedAt: liveQuote?.timestamp,
    isLoading,
  };
}

export function useLiveQuote(code: string) {
  const { quotes } = useLiveQuotes();
  return quotes.find((quote) => quote.code === code) ?? null;
}
