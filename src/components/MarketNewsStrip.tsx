"use client";

import Link from "next/link";
import { Newspaper } from "lucide-react";
import { useMemo } from "react";
import { useLiveNews } from "@/hooks/useLiveNews";

type MarketTab = "borsa" | "doviz" | "emtia" | "kripto";

const fallbackNews = {
  borsa: [
    { slug: "kap-borsa-ozet", title: "BIST şirketlerinde bilanço ve KAP ajandası yakından izleniyor", source: "VeriAkış Akış", date: "Güncel" },
    { slug: "bist-sektor-ozet", title: "Bankacılık ve holding hisselerinde gün içi denge arayışı", source: "VeriAkış Akış", date: "Güncel" },
  ],
  doviz: [
    { slug: "doviz-ozet", title: "USD/TRY ve EUR/TRY tarafında son kapanış seviyeleri korunuyor", source: "VeriAkış Akış", date: "Güncel" },
    { slug: "tcmb-beklenti", title: "Kur cephesinde para politikası beklentileri fiyatlamaya yön veriyor", source: "VeriAkış Akış", date: "Güncel" },
  ],
  emtia: [
    { slug: "emtia-ozet", title: "Altın ve gümüşte ons-kur dengesine bağlı dalga boyu sürüyor", source: "VeriAkış Akış", date: "Güncel" },
    { slug: "enerji-emtia", title: "Enerji emtialarında arz tarafı gündemi fiyatlamaları etkiliyor", source: "VeriAkış Akış", date: "Güncel" },
  ],
  kripto: [
    { slug: "kripto-ozet", title: "Majör kripto varlıklarda volatilite kontrollü seyrediyor", source: "VeriAkış Akış", date: "Güncel" },
    { slug: "kripto-likidite", title: "Piyasa derinliği ve likidite göstergeleri yakından takipte", source: "VeriAkış Akış", date: "Güncel" },
  ],
};

export function MarketNewsStrip({ tab }: { tab: MarketTab }) {
  const { items: news, source } = useLiveNews();

  const filtered = useMemo(() => (source === "demo" ? [] : news).filter((item) => {
    const symbols = item.relatedSymbols ?? [];
    if (tab === "borsa") return item.category === "BIST" || symbols.includes("XU100");
    if (tab === "doviz") return item.category === "Döviz";
    if (tab === "emtia") return item.category === "Emtia";
    return symbols.some((symbol) => symbol.endsWith("USD")) || /kripto|bitcoin|ethereum/i.test(item.title);
  }).slice(0, 4), [news, source, tab]);

  const label = tab === "borsa" ? "BIST / hisse haberleri" : tab === "doviz" ? "Döviz haberleri" : tab === "emtia" ? "Emtia haberleri" : "Kripto haberleri";
  const renderList = filtered.length ? filtered : fallbackNews[tab];

  return (
    <section className="app-surface-2 app-border rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-primary" />
        <h3 className="app-text text-sm font-semibold">{label}</h3>
        <span className="app-muted ml-auto text-[11px]">{source === "demo" ? "Akış güncelleniyor" : "Canlı güncelleme"}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {renderList.map((item) => (
          <Link key={item.slug} href={`/haber/${item.slug}`} className="app-border rounded-lg border p-3 transition hover:border-primary">
            <p className="app-text line-clamp-2 text-xs font-semibold">{item.title}</p>
            <p className="app-muted mt-1 text-[10px]">{item.source} · {item.date}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
