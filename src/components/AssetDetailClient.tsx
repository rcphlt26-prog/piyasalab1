"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, BarChart3, FileText, MessageCircle, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Sparkline } from "@/components/ui/Sparkline";
import { WatchStar } from "@/components/WatchStar";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useLiveQuote } from "@/hooks/useLiveQuotes";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { scorecardData } from "@/data/scorecardData";
import { formatMarketPrice, formatNumber } from "@/lib/utils";
import { StockInsightCard } from "@/components/StockInsightCard";
import { StockCommunityWidget } from "@/components/StockCommunityWidget";
import { ShareButtons } from "@/components/ShareButtons";
import { getMarketPriceMeta, type StockEntry, type MarketSymbol } from "@/data/marketSymbols";

const ScoreRadar = dynamic(() => import("@/components/ClientCharts").then((m) => m.ScoreRadar), { ssr: false });
const OverlayLineChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.OverlayLineChart), { ssr: false });
const PriceChart = dynamic(() => import("@/components/PriceChart").then((m) => m.PriceChart), { ssr: false, loading: () => <p className="app-muted py-16 text-center text-sm">Grafik hazırlanıyor...</p> });

const detailTabs: Array<["financials" | "news" | "sector" | "community", string, LucideIcon]> = [
  ["financials", "Bilanço ve metrikler", BarChart3],
  ["news", "KAP / şirket haberleri", FileText],
  ["sector", "Sektör karşılaştırması", TrendingUp],
  ["community", "Forum tartışmaları", MessageCircle],
];

type FinancialStatement = {
  id: string;
  symbol: string;
  year: number;
  quarter: number;
  net_profit: number;
  revenue: number;
  ebitda: number | null;
  total_debt: number | null;
  pe_ratio: number | null;
  pb_ratio: number | null;
};

type KapNotification = {
  id: string;
  title: string;
  summary: string | null;
  kap_url: string;
  category: string | null;
  publish_date: string;
};

const CATEGORY_LABEL: Record<MarketSymbol["category"], string> = {
  endeks: "Endeks",
  hisse: "Hisse Senedi",
  doviz: "Döviz",
  emtia: "Emtia",
  kripto: "Kripto Para",
};

export function AssetDetailClient({
  ticker,
  entry,
  market,
}: {
  ticker: string;
  entry: StockEntry | null;
  market: MarketSymbol | null;
}) {
  const [detailTab, setDetailTab] = useState<"financials" | "news" | "sector" | "community">("financials");
  const [quantity, setQuantity] = useState("1");
  const [statements, setStatements] = useState<FinancialStatement[]>([]);
  const [kapNotifications, setKapNotifications] = useState<KapNotification[]>([]);
  const { isWatched, toggle } = useWatchlist();
  const name = market?.label ?? entry?.name ?? ticker;
  const liveQuote = useLiveQuote(ticker);
  const { data: historicalPrices, loading: historyLoading, source: historySource, meta: historyMeta } = useHistoricalPrices(ticker);
  const sector = entry?.sector ?? (market ? CATEGORY_LABEL[market.category] : "Bilinmiyor");
  const categoryLabel = market ? CATEGORY_LABEL[market.category] : entry?.category ?? "-";
  const isStock = market ? market.category === "hisse" : Boolean(entry);
  const priceMeta = getMarketPriceMeta(market);
  const spark = historicalPrices.slice(-24).map((point) => point.value);
  const trend: "up" | "down" = spark.length < 2 || spark[spark.length - 1] >= spark[0] ? "up" : "down";
  const changePct = liveQuote?.changePct;
  const currentPrice = liveQuote?.price;
  const quantityValue = Math.max(0, Number(quantity) || 0);
  const positionValue = currentPrice === undefined ? undefined : currentPrice * quantityValue;
  const score = isStock ? scorecardData[ticker] : undefined;

  useEffect(() => {
    if (!isStock) return;
    let cancelled = false;
    void Promise.all([
      fetch(`/api/financial-statements?symbol=${encodeURIComponent(ticker)}`).then((response) => response.json()),
      fetch(`/api/kap?symbol=${encodeURIComponent(ticker)}`).then((response) => response.json()),
    ]).then(([financialPayload, kapPayload]) => {
      if (cancelled) return;
      setStatements(financialPayload.data ?? []);
      setKapNotifications(kapPayload.data ?? []);
    }).catch(() => {
      if (!cancelled) {
        setStatements([]);
        setKapNotifications([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isStock, ticker]);

  const financialChartData = statements.map((statement) => ({
    year: `${statement.year}Q${statement.quarter / 3}`,
    "Ciro": statement.revenue,
    "Net Kâr": statement.net_profit,
    "Borç": statement.total_debt ?? 0,
  }));
  const latestStatement = statements.at(-1);
  const sectorPeers = useMemo(() => {
    if (!entry?.sector) return [];
    return Object.entries(scorecardData)
      .filter(([peerTicker]) => peerTicker !== ticker)
      .map(([peerTicker, peerScore]) => ({ ticker: peerTicker, score: peerScore }))
      .filter(({ ticker: peerTicker }) => peerTicker.slice(0, 1) === ticker.slice(0, 1))
      .slice(0, 5);
  }, [entry?.sector, ticker]);

  const fundamentals: Array<[string, string]> = isStock
    ? [
        ["Sektör", sector],
        ["Kategori", categoryLabel],
        ["F/K", score ? String(score.fk) : "-"],
        ["PD/DD", score ? String(score.pddd) : "-"],
        ["Piyasa Değeri", score?.marketCap ?? "-"],
        ["Temettü Verimi", score ? `%${formatNumber(score.dividendYield, 1)}` : "-"],
        ["52H En Yüksek", historyMeta?.weekHigh52 == null ? "-" : formatNumber(historyMeta.weekHigh52)],
        ["52H En Düşük", historyMeta?.weekLow52 == null ? "-" : formatNumber(historyMeta.weekLow52)],
      ]
    : [
        ["Tür", categoryLabel],
        ["Kaynak Sembol", market?.yahooSymbol ?? "-"],
        ["Günlük Değişim", changePct === undefined ? "-" : `%${formatNumber(changePct, 2)}`],
        ["52H En Yüksek", historyMeta?.weekHigh52 == null ? "-" : formatNumber(historyMeta.weekHigh52)],
        ["52H En Düşük", historyMeta?.weekLow52 == null ? "-" : formatNumber(historyMeta.weekLow52)],
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

      <div className="mb-4"><ShareButtons title={`${ticker} Canlı Fiyatı, Bilanço ve KAP Haberleri`} /></div>

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
            {spark.length > 1 ? <Sparkline data={spark} width={120} height={44} trend={trend} /> : null}
            <div className="text-right">
              <p className="app-text text-xl font-bold">{currentPrice === undefined ? "-" : `${formatMarketPrice(currentPrice)} ${priceMeta.currencyLabel}`}</p>
              {changePct === undefined ? <p className="app-muted text-sm">-</p> : <p className={`text-sm font-bold ${changePct >= 0 ? "text-bull" : "text-bear"}`}>
                {changePct >= 0 ? "+" : ""}{formatNumber(changePct)}%
              </p>}
              <p className="app-muted text-xs">{liveQuote ? `${priceMeta.unitLabel} fiyatı · Canlı · 30 sn` : "Canlı veri bekleniyor"}</p>
            </div>
          </div>
        </div>
        <p className="app-muted mt-3 text-xs">
          Bu sayfadaki fiyat dışı veriler temsili/eğitim amaçlıdır ve yatırım tavsiyesi değildir.
        </p>
      </div>

      <section className="section-card mb-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h2 className="app-text text-base font-semibold">Hızlı değer hesapla</h2>
            <p className="app-muted mt-1 text-xs">Kaç {priceMeta.unitLabel.toLowerCase()} {name} tuttuğunuzu girin.</p>
          </div>
          <div className="grid grid-cols-[minmax(0,140px)_1fr] items-end gap-3 sm:min-w-[340px]">
            <label className="app-text-secondary min-w-0 text-xs">
              {priceMeta.unitLabel}
              <input
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
              />
            </label>
            <div className="app-surface-2 app-border min-w-0 rounded-lg border px-3 py-2">
              <p className="app-muted text-[11px]">Toplam değer</p>
              <p className="app-text truncate text-base font-bold">{positionValue === undefined ? "Canlı fiyat bekleniyor" : `${formatMarketPrice(positionValue)} ${priceMeta.currencyLabel}`}</p>
            </div>
          </div>
        </div>
      </section>

      {statements.length > 0 ? <StockInsightCard ticker={ticker} statements={statements} changePct={changePct} /> : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Grafik */}
        <div className="section-card">
          <SectionTitle eyebrow="Grafik" title={`${ticker} Fiyat Grafiği`} />
          {historyLoading ? <p className="app-muted py-16 text-center text-sm">Tarihsel veri yükleniyor...</p> : historicalPrices.length > 0 ? <PriceChart data={historicalPrices} height={430} /> : <p className="app-muted py-16 text-center text-sm">Bu sembol için tarihsel veri alınamadı.</p>}
          {historySource ? <p className="app-muted mt-2 text-right text-[11px]">Kaynak: {historySource}</p> : null}
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

      {score ? (
        <div className="section-card mt-4">
          <div className="mb-4 flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
            {detailTabs.map(([key, label, Icon]) => (
              <button key={String(key)} type="button" onClick={() => setDetailTab(key as typeof detailTab)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${detailTab === key ? "bg-[var(--color-primary)] text-white" : "app-text-secondary hover:app-surface-2"}`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          {detailTab === "financials" ? (
            <div>
              {statements.length === 0 ? <p className="app-muted rounded-xl border border-dashed p-8 text-center text-sm">Bu hisse için henüz gerçek finansal tablo kaydı bulunmuyor.</p> : <><div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><div className="app-surface-2 app-border rounded-lg border p-3"><p className="app-muted text-xs">F/K</p><p className="app-text text-lg font-bold">{latestStatement?.pe_ratio == null ? "Veri yok" : formatNumber(latestStatement.pe_ratio)}</p></div><div className="app-surface-2 app-border rounded-lg border p-3"><p className="app-muted text-xs">PD/DD</p><p className="app-text text-lg font-bold">{latestStatement?.pb_ratio == null ? "Veri yok" : formatNumber(latestStatement.pb_ratio)}</p></div><div className="app-surface-2 app-border rounded-lg border p-3"><p className="app-muted text-xs">Net Kâr</p><p className="app-text text-lg font-bold">{latestStatement ? formatNumber(latestStatement.net_profit) : "Veri yok"}</p></div><div className="app-surface-2 app-border rounded-lg border p-3"><p className="app-muted text-xs">Ciro</p><p className="app-text text-lg font-bold">{latestStatement ? formatNumber(latestStatement.revenue) : "Veri yok"}</p></div></div><h3 className="app-text mb-2 text-sm font-semibold">Gerçek finansal tablo geçmişi</h3><OverlayLineChart data={financialChartData} keys={["Ciro", "Net Kâr", "Borç"]} /></>}
            </div>
          ) : null}

          {detailTab === "news" ? (
            <div className="grid gap-3 md:grid-cols-2">
              {kapNotifications.length === 0 ? <p className="app-muted py-6 text-center text-sm">Bu sembol için gerçek KAP bildirimi bulunmuyor.</p> : kapNotifications.map((item) => <a key={item.id} href={item.kap_url} target="_blank" rel="noreferrer" className="app-surface-2 app-border card-hover rounded-xl border p-3"><div className="mb-1 flex items-center gap-2"><span className="rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 text-[10px] font-semibold text-primary">{item.category ?? "KAP"}</span><span className="app-muted text-[10px]">{new Date(item.publish_date).toLocaleDateString("tr-TR")}</span></div><h3 className="app-text text-sm font-semibold">{item.title}</h3><p className="app-text-secondary mt-1 text-xs">{item.summary ?? "KAP bildirimi"}</p></a>)}
            </div>
          ) : null}

          {detailTab === "sector" ? (
            <div><p className="app-muted mb-3 text-xs">Aynı sektör dizinindeki temsili metriklerle karşılaştırma.</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="app-muted border-b text-xs"><tr><th className="px-3 py-2">Hisse</th><th className="px-3 py-2">F/K</th><th className="px-3 py-2">PD/DD</th><th className="px-3 py-2">Temettü</th><th className="px-3 py-2">Sağlık</th></tr></thead><tbody><tr className="app-border border-b bg-[var(--color-primary)]/10"><td className="app-text px-3 py-2 font-bold">{ticker}</td><td className="app-text px-3 py-2">{formatNumber(score.fk)}</td><td className="app-text px-3 py-2">{formatNumber(score.pddd)}</td><td className="app-text px-3 py-2">%{formatNumber(score.dividendYield)}</td><td className="app-text px-3 py-2">{score.health}/10</td></tr>{sectorPeers.map(({ ticker: peerTicker, score: peer }) => <tr key={peerTicker} className="app-border border-b"><td className="app-text px-3 py-2 font-semibold">{peerTicker}</td><td className="app-text px-3 py-2">{formatNumber(peer.fk)}</td><td className="app-text px-3 py-2">{formatNumber(peer.pddd)}</td><td className="app-text px-3 py-2">%{formatNumber(peer.dividendYield)}</td><td className="app-text px-3 py-2">{peer.health}/10</td></tr>)}</tbody></table></div></div>
          ) : null}

          {detailTab === "community" ? <StockCommunityWidget ticker={ticker} /> : null}
        </div>
      ) : null}

    </div>
  );
}
