"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Bitcoin, Coins, DollarSign, TrendingUp } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { marketSymbolByCode } from "@/data/marketSymbols";
import { formatNumber } from "@/lib/utils";

const summaryCodes = ["XU100", "USDTRY", "GRAMALTIN", "GRAMGUMUS", "BTCUSD"];

export function HomeHero() {
  const { quotes, liveAvailable, updatedAt } = useLiveQuotes();
  const quoteMap = new Map(quotes.map((quote) => [quote.code, quote]));
  const stocks = quotes.filter((quote) => marketSymbolByCode.get(quote.code)?.category === "hisse");
  const gainers = [...stocks].sort((a, b) => b.changePct - a.changePct).slice(0, 4);
  const losers = [...stocks].sort((a, b) => a.changePct - b.changePct).slice(0, 4);
  const icons = [TrendingUp, DollarSign, Coins, Coins, Bitcoin];

  return (
    <section className="section-card fade-in overflow-hidden border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/15 via-[var(--surface)] to-[var(--color-bull)]/10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="app-muted text-xs font-semibold uppercase tracking-wide">Piyasa açılışı</p><h1 className="app-text mt-1 text-3xl font-bold tracking-tight">Bugün Piyasada Ne Oldu?</h1><p className="app-text-secondary mt-2 max-w-2xl text-sm">BIST, kur, değerli madenler ve kriptoda günün kısa özeti. Kartlara dokunarak detay sayfasına geç.</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${liveAvailable ? "bg-[var(--color-bull)]/15 text-bull" : "bg-[var(--color-gold)]/15 text-gold"}`}>{liveAvailable ? `Canlı · ${updatedAt ? new Date(updatedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : ""}` : "Veri bekleniyor"}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{summaryCodes.map((code, index) => { const quote = quoteMap.get(code); const Icon = icons[index]; return <Link key={code} href={`/varlik/${code}`} className="app-surface-2 app-border card-hover rounded-xl border p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 text-primary"><Icon className="h-4 w-4" /></span><span className="app-text text-sm font-semibold">{quote?.label ?? code}</span></div>{quote ? quote.changePct >= 0 ? <ArrowUpRight className="h-4 w-4 text-bull" /> : <ArrowDownRight className="h-4 w-4 text-bear" /> : null}</div><p className="app-text mt-4 text-2xl font-bold">{quote ? formatNumber(quote.price, quote.price >= 100 ? 2 : 4) : "-"}</p><p className={`mt-1 text-xs font-semibold ${!quote || quote.changePct >= 0 ? "text-bull" : "text-bear"}`}>{quote ? `${quote.changePct >= 0 ? "+" : ""}${formatNumber(quote.changePct, 2)}%` : "Canlı veri bekleniyor"}</p></Link> })}</div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2"><div className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-3 flex items-center justify-between"><h2 className="app-text text-sm font-semibold">En çok yükselenler</h2><span className="text-xs text-bull">Canlı liste</span></div><div className="grid gap-2 sm:grid-cols-2">{gainers.map((quote) => <Link key={quote.code} href={`/varlik/${quote.code}`} className="flex items-center justify-between rounded-lg border border-[var(--color-bull)]/20 px-3 py-2"><span className="app-text text-xs font-semibold">{quote.label}</span><span className="text-xs font-bold text-bull">+{formatNumber(quote.changePct, 2)}%</span></Link>)}</div></div><div className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-3 flex items-center justify-between"><h2 className="app-text text-sm font-semibold">En çok düşenler</h2><span className="text-xs text-bear">Canlı liste</span></div><div className="grid gap-2 sm:grid-cols-2">{losers.map((quote) => <Link key={quote.code} href={`/varlik/${quote.code}`} className="flex items-center justify-between rounded-lg border border-[var(--color-bear)]/20 px-3 py-2"><span className="app-text text-xs font-semibold">{quote.label}</span><span className="text-xs font-bold text-bear">{formatNumber(quote.changePct, 2)}%</span></Link>)}</div></div></div>
    </section>
  );
}
