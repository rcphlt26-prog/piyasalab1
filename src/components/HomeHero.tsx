"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Calculator, Search } from "lucide-react";
import { useLiveQuotes, type LiveQuote } from "@/hooks/useLiveQuotes";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { getMarketPriceMeta, marketSymbolByCode } from "@/data/marketSymbols";
import { formatMarketPrice, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { InView } from "@/components/ui/InView";

const Sparkline = dynamic(() => import("@/components/ui/Sparkline").then((module) => module.Sparkline), {
  ssr: false,
  loading: () => <Skeleton className="h-8 w-24" />,
});

const SUMMARY_CODES = ["XU100", "USDTRY", "EURTRY", "GRAMALTIN", "BTCUSD"];
const SPARK_POINTS = 30;

export function HomeHero() {
  return (
    <section className="px-1 pb-2 pt-4 sm:pt-8" aria-labelledby="hero-title">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Yatırım yapmadan önce araştır</p>
      <h1 id="hero-title" className="app-text max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Paranı nereye yatırsaydın ne olurdu?</h1>
      <p className="app-text-secondary mt-3 max-w-2xl text-base leading-7">Hisseleri karşılaştır, geçmiş yatırımlarını hesapla ve piyasayı tek ekrandan takip et.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a href="#param-ne-olurdu" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-dark)] px-5 text-sm font-semibold text-white hover:opacity-90"><Calculator className="h-4 w-4" aria-hidden="true" /> Geçmiş yatırımını hesapla</a>
        <a href="#hisseler" className="app-surface app-border app-text inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold hover:border-[var(--color-primary)]"><Search className="h-4 w-4" aria-hidden="true" /> Hisseleri keşfet</a>
      </div>
    </section>
  );
}

function SparkFromHistory({ code, positive }: { code: string; positive: boolean }) {
  const { data } = useHistoricalPrices(code, "1Y");
  const spark = data.slice(-SPARK_POINTS).map((point) => point.value);
  return spark.length > 1 ? <Sparkline data={spark} width={96} height={32} trend={positive ? "up" : "down"} /> : null;
}

function SummaryCard({ code, quote }: { code: string; quote: LiveQuote | undefined }) {
  const meta = getMarketPriceMeta(marketSymbolByCode.get(code));
  const label = marketSymbolByCode.get(code)?.label ?? code;

  if (!quote) {
    return (
      <Link href={`/varlik/${code}`} className="app-surface-2 block min-w-[11rem] shrink-0 snap-start rounded-xl p-4 md:min-w-0">
        <p className="app-text-secondary text-sm font-medium">{label}</p>
        <div className="mt-3 space-y-2"><Skeleton className="h-7 w-28" /><Skeleton className="h-4 w-20" /></div>
      </Link>
    );
  }

  const positive = quote.changePct >= 0;
  const tone = positive ? "text-bull" : "text-bear";
  const absChange = quote.changePct > -100 ? quote.price - quote.price / (1 + quote.changePct / 100) : null;
  return (
    <Link href={`/varlik/${code}`} className="app-surface-2 card-hover block min-w-[11rem] shrink-0 snap-start rounded-xl p-4 md:min-w-0">
      <p className="app-text-secondary truncate text-sm font-medium">{label}</p>
      <p className="app-text mt-2 truncate text-xl font-bold tabular-nums sm:text-2xl">{formatMarketPrice(quote.price)} <span className="app-muted text-xs font-medium">{meta.currencyLabel}</span></p>
      <p className={`mt-1 text-xs font-semibold tabular-nums ${tone}`}>
        {absChange !== null ? `${positive ? "+" : "-"}${formatMarketPrice(Math.abs(absChange))} · ` : ""}{positive ? "+" : ""}{formatNumber(quote.changePct, 2)}%
      </p>
      <div className="mt-3 h-8">{quote ? <InView fallback={<Skeleton className="h-8 w-24" />}><SparkFromHistory code={code} positive={positive} /></InView> : null}</div>
    </Link>
  );
}

export function HomeMarketSummary() {
  const { quotes, liveAvailable, updatedAt, isLoading, isValidating, fallbackReason } = useLiveQuotes();
  const [showMovers, setShowMovers] = useState(false);
  const quoteMap = new Map(quotes.map((quote) => [quote.code, quote]));
  const stocks = quotes.filter((quote) => marketSymbolByCode.get(quote.code)?.category === "hisse");
  const gainers = [...stocks].sort((a, b) => b.changePct - a.changePct).slice(0, 4);
  const losers = [...stocks].sort((a, b) => a.changePct - b.changePct).slice(0, 4);

  return (
    <section id="piyasa-ozeti" className="scroll-mt-24" aria-labelledby="summary-title">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="summary-title" className="app-text text-xl font-bold sm:text-2xl">Piyasa özeti</h2>
          <p className="app-muted text-xs">Günlük değişim ve son 30 günlük fiyat seyri.</p>
        </div>
        {liveAvailable ? (
          <span className="rounded-full bg-[var(--color-bull)]/15 px-3 py-1 text-xs font-semibold text-bull">
            Canlı · {updatedAt ? new Date(updatedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : ""}
          </span>
        ) : (
          <span className="rounded-full bg-[var(--color-primary)]/12 px-3 py-1 text-xs font-semibold text-primary">
            Son Kapanış • {isValidating || isLoading ? "Güncelleniyor..." : fallbackReason === "cache" ? "Önbellek" : "Referans"}
          </span>
        )}
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {SUMMARY_CODES.map((code) => <SummaryCard key={code} code={code} quote={quoteMap.get(code)} />)}
      </div>
      {stocks.length > 0 ? (
        <>
          <button type="button" aria-expanded={showMovers} onClick={() => setShowMovers((value) => !value)} className="app-surface-2 mt-3 flex min-h-11 w-full items-center justify-between rounded-xl px-4 text-left"><span className="app-text text-sm font-semibold">En çok yükselenler ve düşenler</span><span className="app-muted text-xs">{showMovers ? "Gizle" : "Göster"}</span></button>
          {showMovers ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="app-surface-2 rounded-xl p-4"><h3 className="app-text mb-3 text-sm font-semibold">En çok yükselenler</h3><div className="grid gap-2 sm:grid-cols-2">{gainers.map((quote) => <Link key={quote.code} href={`/varlik/${quote.code}`} className="app-surface flex min-h-11 items-center justify-between rounded-lg px-3"><span className="app-text text-xs font-semibold">{quote.label}</span><span className="text-xs font-bold tabular-nums text-bull">+{formatNumber(quote.changePct, 2)}%</span></Link>)}</div></div>
              <div className="app-surface-2 rounded-xl p-4"><h3 className="app-text mb-3 text-sm font-semibold">En çok düşenler</h3><div className="grid gap-2 sm:grid-cols-2">{losers.map((quote) => <Link key={quote.code} href={`/varlik/${quote.code}`} className="app-surface flex min-h-11 items-center justify-between rounded-lg px-3"><span className="app-text text-xs font-semibold">{quote.label}</span><span className="text-xs font-bold tabular-nums text-bear">{formatNumber(quote.changePct, 2)}%</span></Link>)}</div></div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
