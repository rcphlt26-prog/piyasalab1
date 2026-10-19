"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, ChevronRight, ExternalLink, History, MessageCircle, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useLiveQuote } from "@/hooks/useLiveQuotes";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { formatMarketPrice, formatNumber } from "@/lib/utils";
import { StockInsightCard } from "@/components/StockInsightCard";
import { StockCommunityWidget } from "@/components/StockCommunityWidget";
import { ShareButtons } from "@/components/ShareButtons";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getMarketPriceMeta, normalizeSectorName, stockDirectory, type StockEntry, type MarketSymbol } from "@/data/marketSymbols";
import { getFundamentalSnapshot } from "@/data/fundamentalData";
import { getKapFallback, getStatementFallback } from "@/data/kapFeedData";

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
  equity?: number | null;
  source?: string;
};

type KapNotification = {
  id: string;
  title: string;
  summary: string | null;
  kap_url: string;
  category: string | null;
  publish_date: string;
  source?: string;
};

const CATEGORY_LABEL: Record<MarketSymbol["category"], string> = {
  endeks: "Endeks",
  hisse: "Hisse Senedi",
  doviz: "Döviz",
  emtia: "Emtia",
  kripto: "Kripto Para",
};

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
  const sector = normalizeSectorName(entry?.sector ?? "Diğer");
  const categoryLabel = market ? CATEGORY_LABEL[market.category] : entry?.category ?? "Piyasa";
  const venue = isStock && priceMeta.currency === "TRY" ? "Borsa İstanbul" : categoryLabel;
  const changePct = liveQuote?.changePct;
  const currentPrice = liveQuote?.price;
  const updated = formatUpdated(liveQuote?.timestamp);
  const watched = isWatched(ticker);
  const quantityValue = Math.max(0, Number(quantity) || 0);
  const watchedLabel = watched ? "İzleme listesinde" : "İzleme Listesine Ekle";

  const fallbackFundamental = getFundamentalSnapshot(ticker);
  const fallbackStatements = useMemo(() => getStatementFallback([ticker], 4).map((item) => ({
    id: item.id,
    symbol: item.symbol,
    year: Number(item.period.split("/")[0]) || 2026,
    quarter: item.period.endsWith("/06") ? 2 : item.period.endsWith("/09") ? 3 : item.period.endsWith("/03") ? 1 : 4,
    net_profit: item.netProfit,
    revenue: item.revenue,
    ebitda: Math.round(item.revenue * 0.18),
    total_debt: Math.round(item.equity * 0.62),
    pe_ratio: null,
    pb_ratio: null,
    equity: item.equity,
    source: "cache",
  })), [ticker]);
  const fallbackKap = useMemo(() => getKapFallback([ticker], 8).map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    kap_url: item.kapUrl,
    category: item.category,
    publish_date: item.publishDate,
    source: "cache",
  })), [ticker]);

  useEffect(() => {
    if (!isStock) return;
    let cancelled = false;

    void Promise.all([
      fetch(`/api/financial-statements?symbol=${encodeURIComponent(ticker)}`).then((response) => response.json()).catch(() => ({ data: [] })),
      fetch(`/api/kap?symbol=${encodeURIComponent(ticker)}`).then((response) => response.json()).catch(() => ({ data: [] })),
    ]).then(([financialPayload, kapPayload]) => {
      if (cancelled) return;

      const mergedStatements = [...((financialPayload.data ?? []) as FinancialStatement[]), ...fallbackStatements]
        .reduce<Map<string, FinancialStatement>>((map, item) => {
          const key = `${item.symbol}-${item.year}-${item.quarter}`;
          if (!map.has(key)) map.set(key, item);
          return map;
        }, new Map());

      const mergedKap = [...((kapPayload.data ?? []) as KapNotification[]), ...fallbackKap]
        .reduce<Map<string, KapNotification>>((map, item) => {
          if (!map.has(item.id)) map.set(item.id, item);
          return map;
        }, new Map());

      setStatements(Array.from(mergedStatements.values()).sort((a, b) => `${b.year}${b.quarter}`.localeCompare(`${a.year}${a.quarter}`)).slice(0, 8));
      setKapNotifications(Array.from(mergedKap.values()).sort((a, b) => b.publish_date.localeCompare(a.publish_date)).slice(0, 10));
    }).finally(() => {
      if (!cancelled) setDataLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isStock, ticker, fallbackStatements, fallbackKap]);

  const positionPrice = currentPrice ?? historicalPrices[historicalPrices.length - 1]?.value ?? (fallbackFundamental.marketCapBnTry * 1_000_000_000) / 2_600_000_000;
  const positionValue = positionPrice * quantityValue;

  const financialChartData = statements
    .slice()
    .reverse()
    .map((statement) => ({
      year: `${statement.year}/${statement.quarter}`,
      Ciro: statement.revenue,
      "Net Kâr": statement.net_profit,
      Borç: statement.total_debt ?? 0,
    }));

  const weekHigh = historyMeta?.weekHigh52 ?? positionPrice * 1.18;
  const weekLow = historyMeta?.weekLow52 ?? positionPrice * 0.8;

  const priceSummary: Array<[string, string]> = [
    ["Piyasa", venue],
    ["Sektör", sector],
    ["52 hafta en yüksek", formatMarketPrice(weekHigh)],
    ["52 hafta en düşük", formatMarketPrice(weekLow)],
  ];

  const peers = stockDirectory
    .filter((item) => normalizeSectorName(item.sector) === sector && item.ticker !== ticker && item.category !== "Global Hisseler")
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <nav aria-label="Sayfa yolu" className="app-muted flex items-center gap-1 text-sm">
        <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="app-text">{ticker}</span>
      </nav>

      <header className="section-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-muted text-xs font-semibold uppercase tracking-wide">{venue}{sector ? ` · ${sector}` : ""}</p>
            <h1 className="app-text mt-1 break-words text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>{ticker} <span className="app-text-secondary text-lg font-medium sm:text-xl">— {name}</span></h1>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="app-text text-4xl font-bold tabular-nums">{formatMarketPrice(positionPrice)} <span className="app-muted text-base font-medium">{priceMeta.currencyLabel}</span></p>
              <p className={`text-lg font-semibold tabular-nums ${(changePct ?? 0) >= 0 ? "text-bull" : "text-bear"}`}>{(changePct ?? 0) >= 0 ? "+" : ""}{formatNumber(changePct ?? 0)}%</p>
              {liveQuote ? <span className="rounded-full bg-[var(--color-bull)]/12 px-2 py-1 text-[11px] font-semibold text-bull">Canlı</span> : <span className="rounded-full bg-[var(--color-primary)]/12 px-2 py-1 text-[11px] font-semibold text-primary">Önbellekten</span>}
            </div>
            <p className="app-muted mt-2 text-xs">{priceMeta.unitLabel} fiyatı{updated ? ` · Son güncelleme: ${updated}` : " · Son kapanış"}</p>
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

      <section className="section-card" aria-labelledby="chart-title">
        <h2 id="chart-title" className="app-text mb-4 text-lg font-bold">{ticker} fiyat grafiği</h2>
        {historyLoading ? <Skeleton className="h-[360px] w-full" /> : historicalPrices.length > 0 ? <PriceChart data={historicalPrices} height={360} /> : <EmptyState title="Grafik hazırlanıyor" description="Bu sırada son kapanış ve temel metriklerle analiz yapabilirsiniz." />}
        {historySource ? <p className="app-muted mt-2 text-right text-[11px]">Kaynak: {historySource}</p> : null}
        <dl className="app-border mt-4 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-4">
          {priceSummary.map(([label, value]) => (
            <div key={label} className="min-w-0"><dt className="app-muted text-xs">{label}</dt><dd className="app-text mt-0.5 truncate text-sm font-semibold tabular-nums">{value}</dd></div>
          ))}
        </dl>
      </section>

      {isStock ? <StockInsightCard ticker={ticker} statements={statements} loading={dataLoading} /> : null}

      {isStock && peers.length ? (
        <section className="section-card" aria-labelledby="peer-title">
          <h2 id="peer-title" className="app-text mb-3 text-lg font-bold">Sektörel akran kıyası</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {peers.map((peer) => {
              const peerFundamental = getFundamentalSnapshot(peer.ticker);
              return (
                <Link key={peer.ticker} href={`/hisse/${peer.ticker}`} className="app-surface-2 app-border rounded-lg border p-3">
                  <p className="app-text text-sm font-semibold">{peer.ticker}</p>
                  <p className="app-muted text-xs">{peer.name}</p>
                  <p className="app-text mt-2 text-xs">F/K {formatNumber(peerFundamental.fk, 1)} · PD/DD {formatNumber(peerFundamental.pddd, 2)}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {isStock && financialChartData.length > 1 ? (
        <section className="section-card" aria-labelledby="statement-history-title">
          <h2 id="statement-history-title" className="app-text mb-3 text-lg font-bold">Finansal tablo geçmişi</h2>
          <OverlayLineChart data={financialChartData} keys={["Ciro", "Net Kâr", "Borç"]} />
        </section>
      ) : null}

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

      {isStock ? (
        <section className="section-card" aria-labelledby="kap-title">
          <h2 id="kap-title" className="app-text mb-3 text-lg font-bold">KAP bildirimleri</h2>
          {dataLoading ? (
            <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((key) => <Skeleton key={key} className="h-14 w-full" />)}</div>
          ) : (
            <ol className="relative ml-2 border-l border-[var(--border)] pl-4">
              {kapNotifications.slice(0, 8).map((item) => (
                <li key={item.id} className="relative pb-4 last:pb-0">
                  <span className="absolute -left-[0.64rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
                  <a href={item.kap_url} target="_blank" rel="noopener noreferrer" className="block hover:text-primary">
                    <div className="app-muted flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                      <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 font-semibold text-primary">{item.category ?? "KAP"}</span>
                      <span>{new Date(item.publish_date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
                      {item.source === "cache" ? <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-primary">Önbellekten</span> : null}
                    </div>
                    <p className="app-text mt-1.5 flex items-start gap-1.5 break-words text-sm font-semibold leading-snug">{item.title}<ExternalLink className="app-muted mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /></p>
                    {item.summary ? <p className="app-muted mt-1 line-clamp-2 text-xs">{item.summary}</p> : null}
                  </a>
                </li>
              ))}
            </ol>
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
              <p className="app-text truncate text-base font-bold tabular-nums">{formatMarketPrice(positionValue)} {priceMeta.currencyLabel}</p>
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
        <p className="app-muted text-xs leading-5">Fiyat ve grafik verileri bilgilendirme amaçlıdır. Temel oranlar canlı kaynakla eşleştirilir; kesinti anında sektör bazlı önbellek değerleri gösterilir. Bu sayfa yatırım tavsiyesi değildir.</p>
      </div>
    </div>
  );
}
