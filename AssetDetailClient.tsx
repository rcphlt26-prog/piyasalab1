"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Sparkline, generateSparkData } from "@/components/ui/Sparkline";
import { WatchStar } from "@/components/WatchStar";
import { useWatchlist } from "@/hooks/useWatchlist";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { newsForTicker } from "@/data/newsData";
import { scorecardData } from "@/data/scorecardData";
import { formatNumber } from "@/lib/utils";
import type { StockEntry, MarketSymbol } from "@/data/marketSymbols";

const TradingViewSymbolChart = dynamic(
  () => import("@/components/TradingViewWidgets").then((m) => m.TradingViewSymbolChart),
  { ssr: false },
);

const ScoreRadar = dynamic(() => import("@/components/ClientCharts").then((m) => m.ScoreRadar), { ssr: false });

function seededValue(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const frac = x - Math.floor(x);
  return min + frac * (max - min);
}

const DOVIZ_TV: Record<string, string> = {
  USDTRY: "FX_IDC:USDTRY",
  EURTRY: "FX_IDC:EURTRY",
  GBPTRY: "FX_IDC:GBPTRY",
  JPYTRY: "FX_IDC:JPYTRY",
  CHFTRY: "FX_IDC:CHFTRY",
  SARATRY: "FX_IDC:SARTRY",
  RUBTRY: "FX_IDC:RUBTRY",
};

const EMTIA_TV: Record<string, string> = {
  ALTIN: "TVC:GOLD",
  GUMUS: "TVC:SILVER",
  PETROL: "TVC:UKOIL",
  DOGALGAZ: "NYMEX:NG1!",
  BAKIR: "COMEX:HG1!",
  PLATIN: "TVC:PLATINUM",
};

const CATEGORY_LABEL: Record<MarketSymbol["category"], string> = {
  endeks: "Endeks",
  hisse: "Hisse Senedi",
  doviz: "Döviz",
  emtia: "Emtia",
  kripto: "Kripto Para",
};

function resolveTvSymbol(ticker: string, market: MarketSymbol | null, entry: StockEntry | null): string {
  if (market) {
    switch (market.category) {
      case "endeks":
        return `BIST:${ticker}`;
      case "hisse":
        return `BIST:${ticker}`;
      case "doviz":
        return DOVIZ_TV[ticker] ?? `FX_IDC:${ticker}`;
      case "emtia":
        return EMTIA_TV[ticker] ?? `TVC:${ticker}`;
      case "kripto":
        return `CRYPTO:${ticker}`;
    }
  }
  if (entry?.category === "Global Hisseler") return `NASDAQ:${ticker}`;
  return `BIST:${ticker}`;
}

export function AssetDetailClient({
  ticker,
  entry,
  market,
}: {
  ticker: string;
  entry: StockEntry | null;
  market: MarketSymbol | null;
}) {
  const { isWatched, toggle } = useWatchlist();
  const name = market?.label ?? entry?.name ?? ticker;
  const sector = entry?.sector ?? (market ? CATEGORY_LABEL[market.category] : "Bilinmiyor");
  const categoryLabel = market ? CATEGORY_LABEL[market.category] : entry?.category ?? "-";
  const isStock = market ? market.category === "hisse" : Boolean(entry);
  const tvSymbol = resolveTvSymbol(ticker, market, entry);

  const seed = ticker.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const spark = generateSparkData(ticker, 24);
  const trend: "up" | "down" = spark[spark.length - 1] >= spark[0] ? "up" : "down";
  const changePct = seededValue(seed, -4, 6);
  const news = newsForTicker(ticker, name);
  const score = isStock ? scorecardData[ticker] : undefined;

  const fundamentals: Array<[string, string]> = isStock
    ? [
        ["Sektör", sector],
        ["Kategori", categoryLabel],
        ["F/K (temsili)", score ? String(score.fk) : formatNumber(seededValue(seed + 1, 4, 25))],
        ["PD/DD (temsili)", score ? String(score.pddd) : formatNumber(seededValue(seed + 2, 0.8, 5))],
        ["Piyasa Değeri (temsili)", `₺${formatNumber(seededValue(seed + 3, 5, 400), 1)} milyar`],
        ["Temettü Verimi (temsili)", `%${formatNumber(seededValue(seed + 4, 0, 8), 1)}`],
      ]
    : [
        ["Tür", categoryLabel],
        ["Kaynak Sembol", market?.yahooSymbol ?? "-"],
        ["52H En Yüksek (temsili)", formatNumber(seededValue(seed + 3, 100, 1000), 2)],
        ["52H En Düşük (temsili)", formatNumber(seededValue(seed + 4, 10, 90), 2)],
        ["Günlük Değişim (temsili)", `%${formatNumber(changePct, 2)}`],
      ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <div className="app-muted mb-4 flex items-center gap-2 text-sm">
        <Link href="/" className="hover:text-primary">
          Ana Sayfa
        </Link>
        <span>/</span>
        <span className="app-text">{ticker}</span>
      </div>

      <Link href="/" className="app-text-secondary mb-4 inline-flex items-center gap-2 text-sm hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Geri dön
      </Link>

      {/* Başlık kartı */}
      <div className="section-card mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
              <TrendingUp className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="app-text text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {ticker}
                </h1>
                <WatchStar watched={isWatched(ticker)} onToggle={() => toggle(ticker)} size={20} />
              </div>
              <p className="app-text-secondary text-sm">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Sparkline data={spark} width={120} height={44} trend={trend} />
            <div className="text-right">
              <p className={`text-xl font-bold ${trend === "up" ? "text-bull" : "text-bear"}`}>
                {changePct >= 0 ? "+" : ""}
                {formatNumber(changePct)}%
              </p>
              <p className="app-muted text-xs">Günlük (temsili)</p>
            </div>
          </div>
        </div>
        <p className="app-muted mt-3 text-xs">
          Bu sayfadaki fiyat dışı veriler temsili/eğitim amaçlıdır ve yatırım tavsiyesi değildir.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Grafik */}
        <div className="section-card">
          <SectionTitle eyebrow="Grafik" title={`${ticker} Fiyat Grafiği`} />
          <TradingViewSymbolChart symbol={tvSymbol} />
        </div>

        {/* Temel bilgiler + karne */}
        <div className="space-y-4">
          <div className="section-card">
            <h2 className="app-text mb-3 text-lg font-semibold">Temel Bilgiler</h2>
            <div className="space-y-2 text-sm">
              {fundamentals.map(([label, value]) => (
                <div key={label} className="app-border flex justify-between border-b pb-1.5">
                  <span className="app-muted">{label}</span>
                  <span className="app-text font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {score ? (
            <div className="section-card">
              <h2 className="app-text mb-2 text-lg font-semibold">Hisse Karnesi</h2>
              <ScoreRadar
                data={[
                  { metric: "Değerleme", score: score.valuation },
                  { metric: "Finansal Sağlık", score: score.health },
                  { metric: "Temettü", score: score.dividend },
                  { metric: "Büyüme", score: score.growth },
                  { metric: "Momentum", score: score.momentum },
                ]}
              />
              <p className="app-text-secondary mt-2 text-xs">{score.note}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Haberler */}
      <div className="section-card mt-4">
        <SectionTitle eyebrow="Haberler" title={`${ticker} Güncel Haberleri`} />
        <div className="grid gap-3 md:grid-cols-2">
          {news.map((n) => (
            <article key={n.slug} className="app-surface-2 app-border card-hover rounded-xl border p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {n.category}
                </span>
                {n.breaking ? (
                  <span className="rounded-full bg-[var(--color-bear)]/15 px-2 py-0.5 text-[10px] font-semibold text-bear">
                    Son Dakika
                  </span>
                ) : null}
              </div>
              <h3 className="app-text text-sm font-semibold">{n.title}</h3>
              <p className="app-text-secondary mt-1 text-xs">{n.summary}</p>
              <p className="app-muted mt-2 text-[10px]">
                {n.source} · {n.date}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
