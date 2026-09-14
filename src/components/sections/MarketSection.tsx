"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Star } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { useWatchlist } from "@/hooks/useWatchlist";
import { WatchStar } from "@/components/WatchStar";
import { TradingViewAdvancedChart, TradingViewMiniOverview, TradingViewTape } from "@/components/TradingViewWidgets";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { Sparkline, generateSparkData } from "@/components/ui/Sparkline";
import { formatNumber } from "@/lib/utils";
import { stockByTicker } from "@/data/marketSymbols";

export function MarketSection() {
  const { quotes, tickerTape, demoMode, updatedAt } = useLiveQuotes();
  const { isWatched, toggle, tickers, localOnly } = useWatchlist();

  const watchedQuotes = quotes.filter((q) => tickers.includes(q.code));

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
            {watchedQuotes.map((q) => {
              const isStock = stockByTicker.has(q.code);
              const inner = (
                <>
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
                </>
              );
              const cls = "app-surface app-border min-w-[150px] rounded-lg border px-2.5 py-1.5";
              return isStock ? (
                <Link key={q.code} href={`/varlik/${q.code}`} className={`${cls} card-hover`}>{inner}</Link>
              ) : (
                <div key={q.code} className={cls}>{inner}</div>
              );
            })}
          </div>
        )}
      </div>

      <SectionTitle
        eyebrow="Canlı Veri"
        title="Saniyelik Canlı Borsa ve Döviz Akışı"
        description="Veriler yaklaşık 3 saniyede bir güncellenir. Kaynak erişilemezse ekran demo veriyle boş kalmadan çalışmaya devam eder."
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

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {quotes.map((q) => {
          const isStock = stockByTicker.has(q.code);
          const spark = generateSparkData(q.code);
          const inner = (
            <>
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
              <p className="app-muted text-[11px]">{q.source}{isStock ? " · Detay için tıkla" : ""}</p>
            </>
          );
          const cls = `app-surface-2 app-border rounded-xl border p-3 ${q.direction === "up" ? "flash-up" : q.direction === "down" ? "flash-down" : ""} ${isStock ? "card-hover cursor-pointer" : ""}`;
          return isStock ? (
            <Link key={q.code} href={`/varlik/${q.code}`} className={cls}>{inner}</Link>
          ) : (
            <article key={q.code} className={cls}>{inner}</article>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card padded={false} className="p-2"><TradingViewTape /></Card>
        <Card padded={false} className="p-2"><TradingViewMiniOverview /></Card>
      </div>
      <Card padded={false} className="mt-4 p-2"><TradingViewAdvancedChart /></Card>

      <p className="app-muted mt-3 text-xs">
        Veriler bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Son güncelleme: {updatedAt ? new Date(updatedAt).toLocaleString("tr-TR") : "-"} · {demoMode ? "Demo veri modu" : "Canlı kaynak"}
      </p>
    </section>
  );
}
