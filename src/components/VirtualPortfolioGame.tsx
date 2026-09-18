"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Play, Trophy } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { formatNumber } from "@/lib/utils";

const STARTING_CASH = 100000;
type Order = { symbol: string; side: "BUY" | "SELL"; quantity: number; execution_price: number; created_at?: string };
type Portfolio = { id: string; display_name: string; cash_balance: number; current_value: number; total_return_pct: number; game_orders?: Order[] } | null;
type LeaderboardRow = { display_name: string; current_value: number; total_return_pct: number; updated_at: string };

export function VirtualPortfolioGame() {
  const { quotes, updatedAt } = useLiveQuotes();
  const [portfolio, setPortfolio] = useState<Portfolio>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [displayName, setDisplayName] = useState("");
  const [symbol, setSymbol] = useState("THYAO");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch(`/api/games/trading?period=${period}`, { cache: "no-store" });
    const payload = (await response.json()) as { portfolio?: Portfolio; leaderboard?: LeaderboardRow[]; error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Oyun verisi alınamadı.");
      return;
    }
    setPortfolio(payload.portfolio ?? null);
    setLeaderboard(payload.leaderboard ?? []);
  }, [period]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    const refresh = window.setInterval(() => void load(), 30000);
    return () => { window.clearTimeout(timer); window.clearInterval(refresh); };
  }, [load]);

  const quoteMap = useMemo(() => new Map(quotes.map((quote) => [quote.code, quote])), [quotes]);
  const holdings = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of portfolio?.game_orders ?? []) map.set(order.symbol, (map.get(order.symbol) ?? 0) + (order.side === "BUY" ? order.quantity : -order.quantity));
    return Array.from(map.entries()).filter(([, value]) => value > 0);
  }, [portfolio]);
  const liveValue = (portfolio?.cash_balance ?? STARTING_CASH) + holdings.reduce((sum, [ticker, amount]) => sum + amount * (quoteMap.get(ticker)?.price ?? 0), 0);
  const liveReturn = ((liveValue / STARTING_CASH) - 1) * 100;

  async function startGame() {
    setBusy(true); setMessage(null);
    const response = await fetch("/api/games/trading", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "start", displayName }) });
    const payload = (await response.json()) as { portfolio?: Portfolio; error?: string };
    if (!response.ok) setMessage(payload.error ?? "Oyun başlatılamadı."); else setPortfolio(payload.portfolio ?? null);
    setBusy(false);
  }

  async function trade(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(null);
    const response = await fetch("/api/games/trading", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "trade", symbol, side, quantity: Number(quantity) }) });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) setMessage(payload.error ?? "İşlem başarısız."); else await load();
    setBusy(false);
  }

  return <section className="section-card mb-6 border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--surface)] to-[var(--color-gold)]/10"><div className="mb-4 flex items-start gap-3"><span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white"><BarChart3 className="h-5 w-5" /></span><div><p className="app-muted text-xs font-semibold uppercase tracking-wide">Gerçek zamanlı yarış</p><h2 className="app-text text-2xl font-bold">100.000 TL Sanal Bütçe ile Portföy Oluştur</h2><p className="app-text-secondary mt-1 text-sm">Canlı fiyatlarla işlem yap, haftalık ve aylık sıralamada yüksel.</p></div></div>
    {!portfolio ? <div className="app-surface-2 app-border rounded-xl border p-4"><p className="app-text text-sm font-semibold">Yarışmaya katıl</p><div className="mt-3 flex flex-wrap gap-2"><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Oyuncu adı" className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm" /><button type="button" disabled={busy} onClick={() => void startGame()} className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white"><Play className="h-4 w-4" /> Başlat</button></div></div> : <><div className="mb-4 grid gap-3 sm:grid-cols-3"><div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Canlı portföy</p><p className="app-text text-xl font-bold">{formatNumber(liveValue)} TL</p></div><div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Getiri</p><p className={`text-xl font-bold ${liveReturn >= 0 ? "text-bull" : "text-bear"}`}>{liveReturn >= 0 ? "+" : ""}{formatNumber(liveReturn)}%</p></div><div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Nakit</p><p className="app-text text-xl font-bold">{formatNumber(portfolio.cash_balance)} TL</p></div></div><form onSubmit={trade} className="app-surface-2 app-border mb-4 grid gap-2 rounded-xl border p-3 sm:grid-cols-4"><input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} placeholder="THYAO" className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm" /><select value={side} onChange={(event) => setSide(event.target.value as "BUY" | "SELL")} className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm"><option value="BUY">Alış</option><option value="SELL">Satış</option></select><input type="number" min="0.01" step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm" /><button disabled={busy} type="submit" className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white">İşlemi yap</button></form><div className="mb-4 flex flex-wrap gap-2">{holdings.map(([ticker, amount]) => <span key={ticker} className="app-surface-2 app-border rounded-full border px-3 py-1 text-xs"><strong>{ticker}</strong> · {formatNumber(amount)}</span>)}</div></>}
    {message ? <p className="mb-3 rounded-lg border border-[var(--color-gold)] bg-[var(--color-gold)]/10 p-3 text-xs text-gold">{message}</p> : null}<div className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-gold" /><h3 className="app-text text-sm font-semibold">Leaderboard</h3></div><div className="flex gap-1"><button type="button" onClick={() => setPeriod("weekly")} className={`rounded-lg px-3 py-1 text-xs ${period === "weekly" ? "bg-[var(--color-primary)] text-white" : "app-text-secondary"}`}>Haftalık</button><button type="button" onClick={() => setPeriod("monthly")} className={`rounded-lg px-3 py-1 text-xs ${period === "monthly" ? "bg-[var(--color-primary)] text-white" : "app-text-secondary"}`}>Aylık</button></div></div>{leaderboard.length ? <div className="space-y-2">{leaderboard.map((row, index) => <div key={`${row.display_name}-${index}`} className="app-border flex items-center justify-between border-b pb-2 text-sm"><span className="app-text"><strong className="mr-2 text-gold">#{index + 1}</strong>{row.display_name}</span><span className={row.total_return_pct >= 0 ? "text-bull" : "text-bear"}>{row.total_return_pct >= 0 ? "+" : ""}{formatNumber(row.total_return_pct)}%</span></div>)}</div> : <p className="app-muted text-xs">Bu dönemde henüz yarışmacı yok.</p>}<p className="app-muted mt-3 text-[11px]">Fiyat kaynağı: canlı piyasa verisi · Son güncelleme: {updatedAt ? new Date(updatedAt).toLocaleTimeString("tr-TR") : "bekleniyor"}</p></div>
  </section>;
}
