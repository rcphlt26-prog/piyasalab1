"use client";

import useSWR from "swr";
import { newsData, type NewsItem } from "@/data/newsData";
import { fetchNews } from "@/lib/supabase/data";

type NewsSource = "google" | "supabase" | "demo";
type LiveNewsResult = { items: NewsItem[]; source: NewsSource };

async function fetchLiveNews(): Promise<LiveNewsResult> {
  try {
    const response = await fetch("/api/cron/fetch-news", { cache: "no-store" });
    const payload = (await response.json()) as { items?: NewsItem[] };
    if (response.ok && payload.items?.length) {
      return { items: payload.items, source: "google" };
    }
  } catch {
    // Canlı RSS akışı geçici olarak erişilemezse bir sonraki kaynağa düş.
  }

  const storedNews = await fetchNews();
  if (storedNews?.length) return { items: storedNews, source: "supabase" };

  return { items: newsData, source: "demo" };
}

export function useLiveNews() {
  const { data, error, isLoading } = useSWR<LiveNewsResult>("live-news", fetchLiveNews, {
    refreshInterval: 120_000,
    dedupingInterval: 30_000,
    focusThrottleInterval: 30_000,
    revalidateOnReconnect: true,
  });

  return {
    items: data?.items ?? newsData,
    source: data?.source ?? "demo",
    error,
    isLoading,
  };
}
