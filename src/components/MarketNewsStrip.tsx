"use client";

import Link from "next/link";
import { Newspaper } from "lucide-react";
import { useMemo } from "react";
import { useLiveNews } from "@/hooks/useLiveNews";

type MarketTab = "borsa" | "doviz" | "emtia" | "kripto";

export function MarketNewsStrip({ tab }: { tab: MarketTab }) {
  const { items: news, source, isLoading } = useLiveNews();

  const filtered = useMemo(() => (source === "demo" ? [] : news).filter((item) => {
    const symbols = item.relatedSymbols ?? [];
    if (tab === "borsa") return item.category === "BIST" || symbols.includes("XU100");
    if (tab === "doviz") return item.category === "Döviz";
    if (tab === "emtia") return item.category === "Emtia";
    return symbols.some((symbol) => symbol.endsWith("USD")) || /kripto|bitcoin|ethereum/i.test(item.title);
  }).slice(0, 4), [news, source, tab]);

  const label = tab === "borsa" ? "BIST / hisse haberleri" : tab === "doviz" ? "Döviz haberleri" : tab === "emtia" ? "Emtia haberleri" : "Kripto haberleri";

  return (
    <section className="app-surface-2 app-border rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-primary" />
        <h3 className="app-text text-sm font-semibold">{label}</h3>
        <span className="app-muted ml-auto text-[11px]">{source === "demo" ? "Canlı haber kaynağı bekleniyor" : "Canlı güncelleme"}</span>
      </div>
      {filtered.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map((item) => (
            <Link key={item.slug} href={`/haber/${item.slug}`} className="app-border rounded-lg border p-3 transition hover:border-primary">
              <p className="app-text line-clamp-2 text-xs font-semibold">{item.title}</p>
              <p className="app-muted mt-1 text-[10px]">{item.source} · {item.date}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="app-muted text-xs">{isLoading ? "Canlı haberler yükleniyor..." : "Bu kategori için canlı haber bulunamadı. Birazdan tekrar dene."}</p>
      )}
    </section>
  );
}
