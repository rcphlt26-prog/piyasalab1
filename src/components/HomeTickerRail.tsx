"use client";

import Link from "next/link";
import { Newspaper, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { newsData, type NewsItem } from "@/data/newsData";
import { formatNumber } from "@/lib/utils";

export function HomeTickerRail() {
  const { quotes } = useLiveQuotes();
  const [news, setNews] = useState<NewsItem[]>(newsData.slice(0, 8));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch("/api/cron/fetch-news", { cache: "no-store" });
        const payload = (await response.json()) as { items?: NewsItem[] };
        if (!cancelled && response.ok && payload.items?.length) setNews(payload.items.slice(0, 8));
      } catch {
        // Keep local headlines visible when the news provider is unavailable.
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const stocks = quotes.filter((quote) => ["XU100", "THYAO", "ASELS", "GARAN", "AKBNK", "EREGL"].includes(quote.code));
  const repeatedStocks = stocks.length ? [...stocks, ...stocks] : [];
  const repeatedNews = [...news, ...news];

  return (
    <aside className="grid gap-4 lg:grid-cols-2" aria-label="Gündem ve öne çıkan hisseler">
      <div className="section-card overflow-hidden p-0">
        <div className="app-border flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-bull" />
            <h2 className="app-text text-sm font-semibold">Öne Çıkan Hisseler</h2>
          </div>
          <span className="app-muted text-[11px]">Canlı · 30 sn</span>
        </div>
        <div className="ticker-window h-24">
          <div className="ticker-track ticker-track-stocks flex h-full w-max items-center gap-3 px-4">
            {repeatedStocks.length ? repeatedStocks.map((quote, index) => (
              <Link key={`${quote.code}-${index}`} href={`/varlik/${quote.code}`} className="app-surface-2 app-border card-hover w-32 shrink-0 rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="app-text text-xs font-semibold">{quote.label}</span>
                  {quote.changePct >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-bull" /> : <TrendingDown className="h-3.5 w-3.5 text-bear" />}
                </div>
                <p className="app-text mt-2 text-sm font-bold">{formatNumber(quote.price)}</p>
                <p className={`text-[11px] font-semibold ${quote.changePct >= 0 ? "text-bull" : "text-bear"}`}>{quote.changePct >= 0 ? "+" : ""}{formatNumber(quote.changePct, 2)}%</p>
              </Link>
            )) : <p className="app-muted px-1 text-xs">Canlı hisseler yükleniyor...</p>}
          </div>
        </div>
      </div>

      <div className="section-card overflow-hidden p-0">
        <div className="app-border flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-[var(--color-primary-light)]" />
            <h2 className="app-text text-sm font-semibold">Gündemden Haberler</h2>
          </div>
          <span className="app-muted text-[11px]">Canlı akış</span>
        </div>
        <div className="ticker-window h-24">
          <div className="ticker-track ticker-track-news flex h-full w-max items-center gap-3 px-4">
            {repeatedNews.map((item, index) => (
              <a key={`${item.slug || item.title}-${index}`} href={item.url || "#"} target={item.url ? "_blank" : undefined} rel={item.url ? "noreferrer" : undefined} className="app-surface-2 app-border card-hover flex w-64 shrink-0 items-center gap-3 rounded-xl border p-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 text-xs font-bold text-primary">{item.category?.slice(0, 1) || "G"}</span>
                <span className="app-text line-clamp-2 text-xs font-semibold">{item.title}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
