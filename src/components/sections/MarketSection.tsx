"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Search, Star } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { useWatchlist } from "@/hooks/useWatchlist";
import { WatchStar } from "@/components/WatchStar";
import { PriceChart } from "@/components/PriceChart";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { Sparkline, generateSparkData } from "@/components/ui/Sparkline";
import { formatNumber } from "@/lib/utils";
import { marketSymbolByCode, type MarketCategory } from "@/data/marketSymbols";

type TabKey = "borsa" | "doviz" | "emtia" | "kripto";

const TABS: Array<{ key: TabKey; label: string; categories: MarketCategory[] }> = [
  { key: "borsa", label: "Endeks & Hisseler", categories: ["endeks", "hisse"] },
  { key: "doviz", label: "Döviz", categories: ["doviz"] },
  { key: "emtia", label: "Emtia", categories: ["emtia"] },
  { key: "kripto", label: "Kripto", categories: ["kripto"] },
];

const categoryOf = (code: string): MarketCategory | undefined => marketSymbolByCode.get(code)?.category;

export function MarketSection() {
  const { quotes, tickerTape, demoMode, updatedAt } = useLiveQuotes();
  const { isWatched, toggle, tickers, localOnly } = useWatchlist();
  const [activeTab, setActiveTab] = useState<TabKey>("borsa");
  const [cryptoSearch, setCryptoSearch] = useState("");

  const watchedQuotes = quotes.filter((q) => tickers.includes(q.code));

  const visibleQuotes = useMemo(() => {
    const activeCategories = TABS.find((t) => t.key === activeTab)?.categories ?? [];
    let list = quotes.filter((q) => {
      const cat = categoryOf(q.code);
      return cat ? activeCategories.includes(cat) : false;
    });
    if (activeTab === "kripto" && cryptoSearch.trim()) {
      const term = cryptoSearch.trim().toLowerCase();
      list = list.filter(
        (q) => q.code.toLowerCase().includes(term) || q.label.toLowerCase().includes(term),
      );
    }
    return list;
  }, [quotes, activeTab, cryptoSearch]);

  const marketChartData = useMemo(() => {
    const quote = visibleQuotes[0];
    if (!quote) return [];
    return generateSparkData(quote.code, 24).map((value, index) => ({
      time: `2026-09-${String(index + 1).padStart(2, "0")}` as `${number}-${number}-${number}`,
      value,
    }));
  }, [visibleQuotes]);

  return (
    <section className="section-card fade-in">
      {/* İzleme Listem */}
      <div className="app-surface-2 app-border mb-4 rounded-xl border p-3">
        <div className="mb-2 flex items-center gap-2">
          <Star className="text-gold h-4 w-4" fill="currentColor" />
          <h3 className="app-text text-sm font-semibold">İzleme Listem</h3>
          {localOnly ? <span className="app-muted text-[11px]">(yerel mod)</span> : null}
        </div>
        {watchedQuotes.length === 0 ? (
          <p className="app-muted text-xs">Henüz favori eklemediniz — kartlardaki yıldıza dokunun.</p>
        ) : (
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {watchedQuotes.map((q) => (
              <Link
                key={q.code}
                href={`/varlik/${q.code}`}
                className="app-surface app-border card-hover min-w-[150px] rounded-lg border px-2.5 py-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="app-text text-xs font-semibold">{q.label}</span>
                  <WatchStar watched onToggle={() => toggle(q.code)} size={13} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="app-text text-sm font-bold">{formatNumber(q.price)}</span>
                  <span className={`text-[11px] ${q.changePct >= 0 ? "text-bull" : "text-bear"}`}>
                    {q.changePct >= 0 ? "+" : ""}{formatNumber(q.changePct, 2)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <SectionTitle
        eyebrow="Canlı Veri"
        title="Canlı Borsa, Döviz, Emtia ve Kripto Akışı"
        description="Veriler Yahoo Finance üzerinden yaklaşık 30 saniyede bir güncellenir. Kaynak erişilemezse ekran demo veriyle boş kalmadan çalışmaya devam eder."
      />

      <div className="app-surface-2 app-border mb-3 rounded-xl border p-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {tickerTape.map((q) => (
            <div key={q.code} className="app-surface app-border min-w-[130px] rounded-lg border px-2 py-1 text-xs">
              <p className="app-text font-semibold">{q.label}</p>
              <p className={`font-bold ${q.changePct >= 0 ? "text-bull" : "text-bear"}`}>{formatNumber(q.price)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kategori sekmeleri */}
      <div className="mb-3 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === tab.key
                ? "border-transparent bg-[var(--color-primary)] text-white"
                : "app-surface app-border app-text card-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "kripto" && (
        <div className="app-surface-2 app-border mb-3 flex items-center gap-2 rounded-xl border px-3 py-2">
          <Search className="app-muted h-4 w-4" />
          <input
            value={cryptoSearch}
            onChange={(e) => setCryptoSearch(e.target.value)}
            placeholder="Kripto ara (BTC, Ethereum, SOL...)"
            className="app-text w-full bg-transparent text-sm outline-none placeholder:opacity-60"
          />
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {visibleQuotes.map((q) => {
          const spark = generateSparkData(q.code);
          return (
            <Link
              key={q.code}
              href={`/varlik/${q.code}`}
              className={`app-surface-2 app-border card-hover cursor-pointer rounded-xl border p-3 ${
                q.direction === "up" ? "flash-up" : q.direction === "down" ? "flash-down" : ""
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-1">
                <h3 className="app-text text-sm font-semibold">{q.label}</h3>
                <div className="flex items-center gap-1">
                  <span className={`text-xs ${q.changePct >= 0 ? "text-bull" : "text-bear"}`}>
                    {q.changePct >= 0 ? <ArrowUpRight className="inline h-3 w-3" /> : <ArrowDownRight className="inline h-3 w-3" />} %{formatNumber(Math.abs(q.changePct), 2)}
                  </span>
                  <WatchStar watched={isWatched(q.code)} onToggle={() => toggle(q.code)} size={14} />
                </div>
              </div>
              <div className="flex items-end justify-between gap-2">
                <p className="app-text text-lg font-bold">{formatNumber(q.price)}</p>
                <Sparkline data={spark} trend={q.changePct >= 0 ? "up" : "down"} />
              </div>
              <p className="app-muted text-[11px]">{q.source} · Detay için tıkla</p>
            </Link>
          );
        })}
        {visibleQuotes.length === 0 && (
          <p className="app-muted col-span-full py-6 text-center text-sm">Sonuç bulunamadı.</p>
        )}
      </div>

      <Card padded={false} className="mt-4 p-2">
        <div className="px-2 pt-2">
          <h3 className="app-text text-sm font-semibold">{visibleQuotes[0]?.label ?? "Piyasa"} Fiyat Grafiği</h3>
          <p className="app-muted text-xs">Seçili kategorideki ilk varlığın son hareketi</p>
        </div>
        {marketChartData.length > 0 ? <PriceChart data={marketChartData} height={380} /> : null}
      </Card>

      <p className="app-muted mt-3 text-xs">
        Veriler bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Son güncelleme: {updatedAt ? new Date(updatedAt).toLocaleString("tr-TR") : "-"} · {demoMode ? "Demo veri modu" : "Canlı kaynak"}
      </p>
    </section>
  );
}
