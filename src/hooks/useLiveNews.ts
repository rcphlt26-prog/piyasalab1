"use client";

import useSWR from "swr";
import { newsData, type NewsItem } from "@/data/newsData";
import { fetchNews } from "@/lib/supabase/data";

type NewsSource = "google" | "supabase" | "demo";
type LiveNewsResult = { items: NewsItem[]; source: NewsSource };

async function fetchLiveNews(): Promise<LiveNewsResult> {
  try {
    const response = await fetch("/api/cron/fetch-news");
    const payload = (await response.json()) as { items?: NewsItem[] };
    if (response.ok && payload.items?.length) return { items: payload.items, source: "google" };
  } catch {
    // Fall back to the stored news feed when the RSS provider is unavailable.
  }

  const storedNews = await fetchNews();
  if (storedNews?.length) return { items: storedNews, source: "supabase" };
  return { items: newsData, source: "demo" };
}

export function useLiveNews() {
  const { data, error, isLoading } = useSWR<LiveNewsResult>("live-news", fetchLiveNews, {
    refreshInterval: 300_000,
    dedupingInterval: 60_000,
    focusThrottleInterval: 60_000,
    revalidateOnReconnect: true,
  });

  return {
    items: data?.items ?? newsData,
    source: data?.source ?? "demo",
    error,
    isLoading,
  };
}