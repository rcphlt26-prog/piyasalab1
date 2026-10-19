"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, LogIn, Star } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { formatNumber } from "@/lib/utils";
import { getMarketPriceMeta, marketSymbolByCode } from "@/data/marketSymbols";

type PortfolioPayload = { data?: Array<{ portfolio_transactions?: Array<{ symbol: string; buy_price: number; quantity: number; type: "BUY" | "SELL" }> }>; error?: string };

export function HomePersonalPanel() {
  const supabase = getSupabaseBrowserClient();
  const { quotes } = useLiveQuotes();
  const [loggedIn, setLoggedIn] = useState(false);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioPayload["data"]>([]);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted || !data.user) return;
      setLoggedIn(true);
      const [watchResponse, portfolioResponse] = await Promise.all([fetch("/api/account/watchlist", { cache: "no-store" }), fetch("/api/account/portfolio", { cache: "no-store" })]);
      const watchPayload = (await watchResponse.json()) as { symbols?: string[] };
      const portfolioPayload = (await portfolioResponse.json()) as PortfolioPayload;
      if (mounted) {
        setSymbols(watchPayload.symbols ?? []);
        setPortfolio(portfolioPayload.data ?? []);
      }
    });
    return () => { mounted = false; };
  }, [supabase]);

  if (!loggedIn) return <section className="section-card border-dashed"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-primary"><LogIn className="h-5 w-5" /></span><div><h2 className="app-text text-lg font-bold">Kişisel panelini aç</h2><p className="app-muted mt-1 text-sm">Portföyünü ve izleme listeni ana sayfada takip etmek için giriş yap.</p></div></div><span className="app-muted text-xs">Üye girişi üst menüde</span></div></section>;

  const transactions = (portfolio ?? []).flatMap((item) => item.portfolio_transactions ?? []);
  // Yalnızca tüm pozisyonlar TL fiyatlı ve canlı fiyatlı ise toplam hesaplanır; aksi halde değer uydurulmaz.
  const holdings = new Map<string, number>();
  for (const item of transactions) holdings.set(item.symbol, (holdings.get(item.symbol) ?? 0) + (item.type === "SELL" ? -1 : 1) * item.quantity);
  const open = Array.from(holdings).filter(([, quantity]) => quantity > 0);
  const priced = open.map(([symbol, quantity]) => ({ quantity, quote: quotes.find((q) => q.code === symbol), currency: getMarketPriceMeta(marketSymbolByCode.get(symbol)).currency }));
  const valueAvailable = priced.length > 0 && priced.every((entry) => entry.quote && entry.currency === "TRY");
  const value = valueAvailable ? priced.reduce((sum, entry) => sum + entry.quantity * (entry.quote?.price ?? 0), 0) : null;

  return <section className="section-card"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5 text-primary" /><h2 className="app-text text-lg font-bold">Kullanıcı Paneli</h2></div><div className="flex gap-2"><Link href="/portfoy" className="app-text-secondary text-xs underline">Portföyü aç</Link></div></div><div className="grid gap-3 sm:grid-cols-2"><div className="app-surface-2 app-border rounded-xl border p-4"><p className="app-muted text-xs">Kişisel portföy özeti</p><p className="app-text mt-1 text-2xl font-bold tabular-nums">{value === null ? <span className="app-muted text-sm font-medium">Son kapanış bazlı hesaplanıyor</span> : `${formatNumber(value)} TL`}</p><p className="app-muted mt-1 text-xs">{value === null ? (priced.length ? "Fiyatlar güncellenirken son bilinen değerler korunur." : "Portföyünü oluşturduğunda burada otomatik özet görünecek.") : `${priced.length} açık pozisyon · canlı fiyatlarla`}</p></div><div className="app-surface-2 app-border rounded-xl border p-4"><div className="flex items-center gap-2"><Star className="h-4 w-4 text-gold" fill="currentColor" /><p className="app-muted text-xs">İzleme listem</p></div><div className="mt-2 flex flex-wrap gap-2">{symbols.length ? symbols.slice(0, 8).map((symbol) => <span key={symbol} className="app-text rounded-full border px-2 py-1 text-xs">{symbol}</span>) : <span className="app-muted text-xs">İzleme listene sembol eklediğinde burada görünecek.</span>}</div></div></div></section>;
}
