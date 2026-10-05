"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { useLiveQuotes, type LiveQuote } from "@/hooks/useLiveQuotes";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { useLiveNews } from "@/hooks/useLiveNews";
import { getMarketPriceMeta, marketSymbolByCode, stockDirectory } from "@/data/marketSymbols";
import { formatMarketPrice, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { InView } from "@/components/ui/InView";
import { EmptyState } from "@/components/ui/EmptyState";

type NavigateProps = { onNavigate: (tab: string) => void };

const KARNE_CODES = ["THYAO", "ASELS", "GARAN", "AKBNK", "EREGL", "TUPRS"];
const NEWS_LIMIT = 6;
const stockNames = new Map(stockDirectory.map((stock) => [stock.ticker, stock.name]));
const signedPct = (value: number) => `${value >= 0 ? "+" : ""}${formatNumber(value, 2)}%`;

function SectionHeader({ id, title, description, action }: { id: string; title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 id={id} className="app-text text-xl font-bold sm:text-2xl">{title}</h2>
        <p className="app-muted max-w-xl text-xs leading-5">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StockCard({ code, quote, loading }: { code: string; quote: LiveQuote | undefined; loading: boolean }) {
  const { data, meta, loading: historyLoading } = useHistoricalPrices(code, "1Y");
  const currency = getMarketPriceMeta(marketSymbolByCode.get(code)).currencyLabel;
  const name = stockNames.get(code) ?? marketSymbolByCode.get(code)?.label ?? code;

  const high = meta?.weekHigh52;
  const low = meta?.weekLow52;
  const hasRange = typeof high === "number" && typeof low === "number";
  const first = data[0]?.value;
  const last = data[data.length - 1]?.value;
  const yearChange = first && last ? (last / first - 1) * 100 : null;
  const hasFinancials = hasRange || yearChange !== null;

  return (
    <Link href={`/hisse/${code}`} className="app-surface app-border card-hover block rounded-xl border p-4" aria-label={`${code} hisse detayı`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="app-text text-base font-bold">{code}</p>
          <p className="app-muted truncate text-xs">{name}</p>
        </div>
        {quote ? <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold tabular-nums ${quote.changePct >= 0 ? "bg-[var(--color-bull)]/10 text-bull" : "bg-[var(--color-bear)]/10 text-bear"}`}>{signedPct(quote.changePct)}</span> : null}
      </div>

      {quote ? (
        <p className="app-text mt-3 text-2xl font-bold tabular-nums">{formatMarketPrice(quote.price)} <span className="app-muted text-xs font-medium">{currency}</span></p>
      ) : loading ? <Skeleton className="mt-3 h-8 w-32" /> : <p className="app-muted mt-3 text-xs">Fiyat verisi şu anda mevcut değil.</p>}

      <div className="app-border mt-3 border-t pt-3">
        {historyLoading ? (
          <div className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
        ) : hasFinancials ? (
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div className="min-w-0"><dt className="app-muted">52 hafta aralığı</dt><dd className="app-text mt-0.5 truncate font-semibold tabular-nums">{hasRange ? `${formatMarketPrice(low)} – ${formatMarketPrice(high)}` : "Mevcut değil"}</dd></div>
            <div className="min-w-0"><dt className="app-muted">1 yıllık değişim</dt><dd className={`mt-0.5 font-semibold tabular-nums ${yearChange === null ? "app-text" : yearChange >= 0 ? "text-bull" : "text-bear"}`}>{yearChange === null ? "Mevcut değil" : signedPct(yearChange)}</dd></div>
          </dl>
        ) : <p className="app-muted text-xs leading-5">Finansal veri şu anda mevcut değil.</p>}
      </div>
    </Link>
  );
}

export function HomeStockCards() {
  const { quotes, isLoading } = useLiveQuotes();
  const quoteMap = new Map(quotes.map((quote) => [quote.code, quote]));

  return (
    <section id="hisseler" className="scroll-mt-24" aria-labelledby="karne-title">
      <SectionHeader
        id="karne-title"
        title="Hisse Karnesi"
        description="Canlı fiyat, 52 haftalık aralık ve 1 yıllık fiyat değişimi. Ayrıntılar için karta dokun."
        action={<a href="#piyasalar" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-primary">Tüm piyasalar <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>}
      />
      <InView fallback={<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">{KARNE_CODES.map((code) => <Skeleton key={code} className="h-44 w-full rounded-xl" />)}</div>}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {KARNE_CODES.map((code) => <StockCard key={code} code={code} quote={quoteMap.get(code)} loading={isLoading} />)}
        </div>
      </InView>
      <p className="app-muted mt-3 text-[11px] leading-5">Veriler Yahoo Finance kaynaklıdır; gecikmeli olabilir ve yatırım tavsiyesi değildir.</p>
    </section>
  );
}

export function HomeNewsList({ onNavigate }: NavigateProps) {
  const { items, source, isLoading } = useLiveNews();
  // "demo" kaynağı yalnızca eğitim amaçlı yerel içeriktir; gerçek haber gibi gösterilmez.
  const live = source !== "demo";
  const latest = live ? [...items].sort((a, b) => b.date.localeCompare(a.date)).slice(0, NEWS_LIMIT) : [];

  return (
    <section className="scroll-mt-24" aria-labelledby="haber-title">
      <SectionHeader
        id="haber-title"
        title="Haberler"
        description="Piyasa ve ekonomi gündeminden son başlıklar."
        action={<button type="button" onClick={() => onNavigate("haberler")} className="app-text inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-primary">Tüm haberler <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>}
      />
      {isLoading && !latest.length ? (
        <div className="section-card space-y-4" aria-busy="true" aria-label="Haberler yükleniyor">{[0, 1, 2].map((key) => <div key={key} className="space-y-2"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-5 w-full" /></div>)}</div>
      ) : latest.length ? (
        <ul className="section-card divide-y divide-[var(--border)] py-1 md:py-2">
          {latest.map((item) => {
            const date = item.date ? new Date(item.date) : null;
            const meta = (
              <div className="app-muted flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 font-semibold text-primary">{item.category}</span>
                {item.source ? <span>{item.source}</span> : null}
                {date && !Number.isNaN(date.getTime()) ? <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" />{date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span> : null}
              </div>
            );
            const title = <p className="app-text mt-1.5 break-words text-sm font-semibold leading-snug sm:text-base">{item.title}</p>;
            const symbols = item.relatedSymbols?.slice(0, 3) ?? [];
            return (
              <li key={item.slug || item.title} className="py-3">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="block hover:text-primary">{meta}{title}</a>
                ) : <Link href={`/haber/${item.slug}`} className="block hover:text-primary">{meta}{title}</Link>}
                {symbols.length ? <div className="mt-1.5 flex flex-wrap gap-1">{symbols.map((symbol) => <Link key={symbol} href={`/varlik/${symbol}`} className="app-surface-3 app-text-secondary rounded-full px-2 py-0.5 text-[10px] font-semibold">{symbol}</Link>)}</div> : null}
              </li>
            );
          })}
        </ul>
      ) : <EmptyState title="Haber akışı şu anda kullanılamıyor." description="Güncel haberler alınamadı. Birkaç dakika sonra tekrar deneyin." />}
    </section>
  );
}
