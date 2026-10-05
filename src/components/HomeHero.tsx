"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bitcoin, Calculator, Coins, DollarSign, Search, TrendingUp } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { getMarketPriceMeta, marketSymbolByCode } from "@/data/marketSymbols";
import { formatMarketPrice, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

const summaryCodes = ["XU100", "USDTRY", "GRAMALTIN", "GRAMGUMUS", "BTCUSD"];
const summaryIcons = [TrendingUp, DollarSign, Coins, Coins, Bitcoin];

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

export function HomeMarketSummary() {
  const { quotes, liveAvailable, updatedAt, isLoading } = useLiveQuotes();
  const [showMovers, setShowMovers] = useState(false);
  const quoteMap = new Map(quotes.map((quote) => [quote.code, quote]));
  const stocks = quotes.filter((quote) => marketSymbolByCode.get(quote.code)?.category === "hisse");
  const gainers = [...stocks].sort((a, b) => b.changePct - a.changePct).slice(0, 4);
  const losers = [...stocks].sort((a, b) => a.changePct - b.changePct).slice(0, 4);

  return (
    <section id="piyasa-ozeti" className="section-card scroll-mt-24" aria-labelledby="summary-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="summary-title" className="app-text text-xl font-bold">Piyasa özeti</h2>
        {liveAvailable ? <span className="rounded-full bg-[var(--color-bull)]/15 px-3 py-1 text-xs font-semibold text-bull">Canlı · {updatedAt ? new Date(updatedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : ""}</span> : null}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {summaryCodes.map((code, index) => {
          const quote = quoteMap.get(code);
          const Icon = summaryIcons[index];
          const priceMeta = getMarketPriceMeta(marketSymbolByCode.get(code));
          const label = quote?.label ?? marketSymbolByCode.get(code)?.label ?? code;
          return (
            <Link key={code} href={`/varlik/${code}`} className="app-surface-2 app-border card-hover min-w-0 rounded-xl border p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2"><span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-primary"><Icon className="h-4 w-4" aria-hidden="true" /></span><span className="app-text truncate text-sm font-semibold">{label}</span></div>
                {quote ? quote.changePct >= 0 ? <ArrowUpRight className="h-4 w-4 shrink-0 text-bull" aria-hidden="true" /> : <ArrowDownRight className="h-4 w-4 shrink-0 text-bear" aria-hidden="true" /> : null}
              </div>
              {quote ? (
                <>
                  <p className="app-text mt-3 truncate text-lg font-bold tabular-nums sm:text-2xl">{formatMarketPrice(quote.price)} <span className="app-muted text-xs font-medium">{priceMeta.currencyLabel}</span></p>
                  <p className={`mt-1 text-xs font-semibold tabular-nums ${quote.changePct >= 0 ? "text-bull" : "text-bear"}`}>{quote.changePct >= 0 ? "+" : ""}{formatNumber(quote.changePct, 2)}%</p>
                </>
              ) : isLoading ? (
                <div className="mt-3 space-y-2"><Skeleton className="h-6 w-24" /><Skeleton className="h-3 w-12" /></div>
              ) : <p className="app-muted mt-3 text-xs leading-5">Bu veri şu anda kullanılamıyor.</p>}
            </Link>
          );
        })}
      </div>
      {stocks.length > 0 ? (
        <>
          <button type="button" aria-expanded={showMovers} onClick={() => setShowMovers((value) => !value)} className="app-surface-2 app-border mt-4 flex min-h-11 w-full items-center justify-between rounded-xl border px-3 text-left"><span className="app-text text-sm font-semibold">En çok yükselenler ve düşenler</span><span className="app-muted text-xs">{showMovers ? "Gizle" : "Göster"}</span></button>
          {showMovers ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="app-surface-2 app-border rounded-xl border p-4"><h3 className="app-text mb-3 text-sm font-semibold">En çok yükselenler</h3><div className="grid gap-2 sm:grid-cols-2">{gainers.map((quote) => <Link key={quote.code} href={`/varlik/${quote.code}`} className="flex min-h-11 items-center justify-between rounded-lg border border-[var(--color-bull)]/20 px-3"><span className="app-text text-xs font-semibold">{quote.label}</span><span className="text-xs font-bold tabular-nums text-bull">+{formatNumber(quote.changePct, 2)}%</span></Link>)}</div></div>
              <div className="app-surface-2 app-border rounded-xl border p-4"><h3 className="app-text mb-3 text-sm font-semibold">En çok düşenler</h3><div className="grid gap-2 sm:grid-cols-2">{losers.map((quote) => <Link key={quote.code} href={`/varlik/${quote.code}`} className="flex min-h-11 items-center justify-between rounded-lg border border-[var(--color-bear)]/20 px-3"><span className="app-text text-xs font-semibold">{quote.label}</span><span className="text-xs font-bold tabular-nums text-bear">{formatNumber(quote.changePct, 2)}%</span></Link>)}</div></div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
