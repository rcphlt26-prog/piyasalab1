"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, ChevronRight, ExternalLink, History, MessageCircle, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useLiveQuote } from "@/hooks/useLiveQuotes";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { formatMarketPrice, formatNumber } from "@/lib/utils";
import { StockInsightCard } from "@/components/StockInsightCard";
import { StockCommunityWidget } from "@/components/StockCommunityWidget";
import { ShareButtons } from "@/components/ShareButtons";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getMarketPriceMeta, type StockEntry, type MarketSymbol } from "@/data/marketSymbols";

const OverlayLineChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.OverlayLineChart), { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> });
const PriceChart = dynamic(() => import("@/components/PriceChart").then((m) => m.PriceChart), { ssr: false, loading: () => <Skeleton className="h-[360px] w-full" /> });

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

const UNAVAILABLE = "Veri mevcut değil";

function formatUpdated(timestamp: string | undefined) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
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
  const [quantity, setQuantity] = useState("1");
  const [statements, setStatements] = useState<FinancialStatement[]>([]);
  const [kapNotifications, setKapNotifications] = useState<KapNotification[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showCommunity, setShowCommunity] = useState(false);
  const { isWatched, toggle } = useWatchlist();
  const name = entry?.name ?? market?.label ?? ticker;
  const liveQuote = useLiveQuote(ticker);
  const { data: historicalPrices, loading: historyLoading, source: historySource, meta: historyMeta } = useHistoricalPrices(ticker);
  const priceMeta = getMarketPriceMeta(market);
  const isStock = market ? market.category === "hisse" : Boolean(entry);
  const categoryLabel = market ? CATEGORY_LABEL[market.category] : entry?.category ?? "Piyasa";
  const venue = isStock && priceMeta.currency === "TRY" ? "Borsa İstanbul" : categoryLabel;
  const changePct = liveQuote?.changePct;
  const currentPrice = liveQuote?.price;
  const updated = formatUpdated(liveQuote?.timestamp);
  const watched = isWatched(ticker);
  const quantityValue = Math.max(0, Number(quantity) || 0);
  const positionValue = currentPrice === undefined ? undefined : currentPrice * quantityValue;
  const watchedLabel = watched ? "İzleme listesinde" : "İzleme Listesine Ekle";

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
    }).finally(() => {
      if (!cancelled) setDataLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isStock, ticker]);

  const financialChartData = statements.map((statement) => ({
    year: `${statement.year}/${statement.quarter}`,
    "Ciro": statement.revenue,
    "Net Kâr": statement.net_profit,
    "Borç": statement.total_debt ?? 0,
  }));

  const priceSummary: Array<[string, string]> = [
    ["Piyasa", venue],
    ["Sektör", entry?.sector ?? UNAVAILABLE],
    ["52 hafta en yüksek", historyMeta?.weekHigh52 == null ? UNAVAILABLE : formatMarketPrice(historyMeta.weekHigh52)],
    ["52 hafta en düşük", historyMeta?.weekLow52 == null ? UNAVAILABLE : formatMarketPrice(historyMeta.weekLow52)],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <nav aria-label="Sayfa yolu" className="app-muted flex items-center gap-1 text-sm">
        <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="app-text">{ticker}</span>
      </nav>

      {/* Üst bölüm */}
      <header className="section-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-muted text-xs font-semibold uppercase tracking-wide">{venue}{entry?.sector ? ` · ${entry.sector}` : ""}</p>
            <h1 className="app-text mt-1 break-words text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>{ticker} <span className="app-text-secondary text-lg font-medium sm:text-xl">— {name}</span></h1>
            {currentPrice === undefined ? (
              <div className="mt-4 space-y-2" aria-busy="true"><Skeleton className="h-10 w-48" /><Skeleton className="h-5 w-24" /></div>
            ) : (
              <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="app-text text-4xl font-bold tabular-nums">{formatMarketPrice(currentPrice)} <span className="app-muted text-base font-medium">{priceMeta.currencyLabel}</span></p>
                {changePct === undefined ? null : <p className={`text-lg font-semibold tabular-nums ${changePct >= 0 ? "text-bull" : "text-bear"}`}>{changePct >= 0 ? "+" : ""}{formatNumber(changePct)}%</p>}
              </div>
            )}
            <p className="app-muted mt-2 text-xs">{currentPrice === undefined ? "Canlı fiyat şu anda kullanılamıyor." : `${priceMeta.unitLabel} fiyatı${updated ? ` · Son güncelleme: ${updated}` : ""}`}</p>
          </div>
          <button
            type="button"
            onClick={() => toggle(ticker)}
            aria-pressed={watched}
            className={`inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold sm:w-auto ${watched ? "app-surface-3 app-text" : "bg-[var(--color-primary-dark)] text-white hover:opacity-90"}`}
          >
            <Star className={`h-4 w-4 ${watched ? "fill-current text-gold" : ""}`} aria-hidden="true" /> {watched ? watchedLabel : `+ ${watchedLabel}`}
          </button>
        </div>
      </header>

      {/* Grafik */}
      <section className="section-card" aria-labelledby="chart-title">
        <h2 id="chart-title" className="app-text mb-4 text-lg font-bold">{ticker} fiyat grafiği</h2>
        {historyLoading ? <Skeleton className="h-[360px] w-full" /> : historicalPrices.length > 0 ? <PriceChart data={historicalPrices} height={360} /> : <EmptyState title="Bu sembol için grafik verisi şu anda kullanılamıyor." description="Tarihsel fiyat verisi alınamadı. Birkaç dakika sonra tekrar deneyin." />}
        {historySource ? <p className="app-muted mt-2 text-right text-[11px]">Kaynak: {historySource}</p> : null}
        <dl className="app-border mt-4 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-4">
          {priceSummary.map(([label, value]) => (
            <div key={label} className="min-w-0"><dt className="app-muted text-xs">{label}</dt><dd className={value === UNAVAILABLE ? "app-muted mt-0.5 text-xs" : "app-text mt-0.5 truncate text-sm font-semibold tabular-nums"}>{value}</dd></div>
          ))}
        </dl>
      </section>

      {isStock ? <StockInsightCard ticker={ticker} statements={statements} loading={dataLoading} /> : null}

      {isStock && statements.length > 1 ? (
        <section className="section-card" aria-labelledby="statement-history-title">
          <h2 id="statement-history-title" className="app-text mb-3 text-lg font-bold">Finansal tablo geçmişi</h2>
          <OverlayLineChart data={financialChartData} keys={["Ciro", "Net Kâr", "Borç"]} />
        </section>
      ) : null}

      {/* Param Ne Olurdu? */}
      {priceMeta.currency !== "USD" ? (
        <section className="section-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="param-cta-title">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-dark)] text-white"><History className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <h2 id="param-cta-title" className="app-text text-base font-bold">Bu hisseye geçmişte yatırım yapsaydın ne olurdu?</h2>
              <p className="app-muted mt-1 text-xs">Gerçek geçmiş kapanış fiyatlarıyla hesapla.</p>
            </div>
          </div>
          <Link href="/#param-ne-olurdu" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-dark)] px-5 text-sm font-semibold text-white hover:opacity-90">Geçmiş yatırımını hesapla <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </section>
      ) : null}

      {/* KAP bildirimleri */}
      {isStock ? (
        <section className="section-card" aria-labelledby="kap-title">
          <h2 id="kap-title" className="app-text mb-3 text-lg font-bold">KAP bildirimleri</h2>
          {dataLoading ? (
            <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((key) => <Skeleton key={key} className="h-14 w-full" />)}</div>
          ) : kapNotifications.length === 0 ? (
            <EmptyState compact title="Veri mevcut değil" description={`${ticker} için KAP bildirimi bulunmuyor.`} />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {kapNotifications.map((item) => (
                <li key={item.id}>
                  <a href={item.kap_url} target="_blank" rel="noopener noreferrer" className="block py-3 hover:text-primary">
                    <div className="app-muted flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                      <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 font-semibold text-primary">{item.category ?? "KAP"}</span>
                      <span>KAP</span>
                      <span>{new Date(item.publish_date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <p className="app-text mt-1.5 flex items-start gap-1.5 break-words text-sm font-semibold leading-snug">{item.title}<ExternalLink className="app-muted mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /></p>
                    {item.summary ? <p className="app-muted mt-1 line-clamp-2 text-xs">{item.summary}</p> : null}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section className="section-card" aria-labelledby="value-title">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h2 id="value-title" className="app-text text-base font-semibold">Hızlı değer hesapla</h2>
            <p className="app-muted mt-1 text-xs">Kaç {priceMeta.unitLabel.toLowerCase()} {name} tuttuğunuzu girin.</p>
          </div>
          <div className="grid grid-cols-[minmax(0,140px)_1fr] items-end gap-3 sm:min-w-[340px]">
            <label className="app-text-secondary min-w-0 text-xs">
              {priceMeta.unitLabel}
              <input type="number" min="0" step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="app-surface-2 app-border app-text mt-1 min-h-11 w-full rounded-lg border px-3 text-sm outline-none" />
            </label>
            <div className="app-surface-2 min-w-0 rounded-lg px-3 py-2">
              <p className="app-muted text-[11px]">Toplam değer</p>
              <p className="app-text truncate text-base font-bold tabular-nums">{positionValue === undefined ? "Canlı fiyat kullanılamıyor" : `${formatMarketPrice(positionValue)} ${priceMeta.currencyLabel}`}</p>
            </div>
          </div>
        </div>
      </section>

      {isStock ? (
        <section className="section-card" aria-labelledby="community-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="community-title" className="app-text inline-flex items-center gap-2 text-lg font-bold"><MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" /> Forum tartışmaları</h2>
            <button type="button" onClick={() => setShowCommunity((value) => !value)} aria-expanded={showCommunity} className="app-border app-text min-h-11 rounded-lg border px-4 text-sm font-semibold">{showCommunity ? "Gizle" : "Tartışmaları göster"}</button>
          </div>
          {showCommunity ? <div className="mt-4"><StockCommunityWidget ticker={ticker} /></div> : null}
        </section>
      ) : null}

      <div className="space-y-3">
        <ShareButtons title={`${ticker} Hisse Fiyatı, Grafik ve Finansal Tablolar`} />
        <p className="app-muted text-xs leading-5">Fiyat ve grafik verileri Yahoo Finance kaynaklıdır ve gecikmeli olabilir. Finansal tablo ve KAP verileri VeriAkış veri katmanından gelir; kayıt yoksa “{UNAVAILABLE}” gösterilir. Bu sayfa yatırım tavsiyesi değildir.</p>
      </div>
    </div>
  );
}
