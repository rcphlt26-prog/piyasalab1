"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Plus, Star, Trash2, X } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { scorecardData } from "@/data/scorecardData";

const format = (value: number | null | undefined) => value === null || value === undefined ? "-" : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(value);

type AlertItem = { id: string; symbol: string; target_value: number; condition: "ABOVE" | "BELOW"; metric_type: string; is_triggered: boolean };

export function WatchlistSection() {
  const { quotes } = useLiveQuotes();
  const [symbols, setSymbols] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [alertSymbol, setAlertSymbol] = useState<string | null>(null);
  const [metricType, setMetricType] = useState("PRICE");
  const [condition, setCondition] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [targetValue, setTargetValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([
        fetch("/api/account/watchlist", { cache: "no-store" }).then((response) => response.json()),
        fetch("/api/account/alerts", { cache: "no-store" }).then((response) => response.json()),
      ]).then(([watchlistPayload, alertPayload]) => {
        if (watchlistPayload.error) {
          setMessage(watchlistPayload.error);
          return;
        }
        setSymbols(watchlistPayload.symbols ?? []);
        setAlerts(alertPayload.data ?? []);
      }).catch(() => setMessage("İzleme listesi yüklenemedi."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const quoteMap = useMemo(() => new Map(quotes.map((quote) => [quote.code, quote])), [quotes]);

  async function saveSymbols(nextSymbols: string[]) {
    setSymbols(nextSymbols);
    const response = await fetch("/api/account/watchlist", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ symbols: nextSymbols }) });
    if (!response.ok) setMessage("İzleme listesi kaydedilemedi.");
  }

  async function addSymbol(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const symbol = newSymbol.trim().toUpperCase();
    if (!symbol || symbols.includes(symbol)) return;
    setNewSymbol("");
    await saveSymbols([...symbols, symbol]);
  }

  async function createAlert(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!alertSymbol) return;
    const response = await fetch("/api/account/alerts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ symbol: alertSymbol, metricType, condition, targetValue: Number(targetValue) }) });
    const payload = (await response.json()) as { data?: AlertItem; error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Alarm oluşturulamadı.");
      return;
    }
    if (payload.data) setAlerts((current) => [payload.data as AlertItem, ...current]);
    setTargetValue("");
    setAlertSymbol(null);
  }

  async function deleteAlert(id: string) {
    await fetch(`/api/account/alerts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  }

  return (
    <section className="section-card fade-in">
      <div className="mb-5 flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-gold)] text-slate-950"><Star className="h-5 w-5" fill="currentColor" /></span><div><p className="app-muted text-xs font-semibold uppercase tracking-wide">Kişisel takip</p><h1 className="app-text text-2xl font-bold">İzleme Listem</h1><p className="app-text-secondary mt-1 text-sm">F/K, PD/DD, günlük değişim ve temettü verimini canlı izle.</p></div></div></div>
      <form onSubmit={addSymbol} className="app-surface-2 app-border mb-4 flex gap-2 rounded-xl border p-3"><input required value={newSymbol} onChange={(event) => setNewSymbol(event.target.value.toUpperCase())} placeholder="Sembol ekle: THYAO, GRAMALTIN" className="app-surface app-border app-text min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none" /><button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Ekle</button></form>
      {message ? <div className="mb-4 rounded-xl border border-[var(--color-gold)] bg-[var(--color-gold)]/10 p-3 text-sm text-gold">{message}</div> : null}
      {symbols.length === 0 ? <div className="app-surface-2 app-border rounded-xl border p-8 text-center"><p className="app-text font-semibold">Listen henüz boş</p><p className="app-muted mt-1 text-sm">İlk sembolünü ekleyerek kişisel piyasa ekranını oluştur.</p></div> : <div className="grid gap-3 md:grid-cols-2">{symbols.map((symbol) => { const quote = quoteMap.get(symbol); const score = scorecardData[symbol]; return <article key={symbol} className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-3 flex items-center justify-between"><div><h2 className="app-text text-lg font-bold">{symbol}</h2><p className="app-muted text-xs">{quote?.label ?? "Canlı veri bekleniyor"}</p></div><div className="flex gap-1"><button type="button" onClick={() => setAlertSymbol(symbol)} className="app-border app-text-secondary rounded-lg border p-2" title="Alarm kur"><Bell className="h-4 w-4" /></button><button type="button" onClick={() => void saveSymbols(symbols.filter((item) => item !== symbol))} className="app-border app-text-secondary rounded-lg border p-2" title="Listeden çıkar"><Trash2 className="h-4 w-4" /></button></div></div><div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4"><div><p className="app-muted text-xs">Fiyat</p><p className="app-text font-semibold">{format(quote?.price)}</p></div><div><p className="app-muted text-xs">F/K</p><p className="app-text font-semibold">{format(score?.fk)}</p></div><div><p className="app-muted text-xs">PD/DD</p><p className="app-text font-semibold">{format(score?.pddd)}</p></div><div><p className="app-muted text-xs">Günlük</p><p className={`font-semibold ${(quote?.changePct ?? 0) >= 0 ? "text-bull" : "text-bear"}`}>{quote ? `${quote.changePct >= 0 ? "+" : ""}${format(quote.changePct)}%` : "-"}</p></div></div><div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs"><span className="app-muted">Temettü verimi</span><span className="text-gold font-semibold">{score ? `%${format(score.dividendYield)}` : "-"}</span></div></article>; })}</div>}
      {alerts.length > 0 ? <div className="mt-5"><h2 className="app-text mb-2 text-lg font-semibold">Aktif alarmlar</h2><div className="space-y-2">{alerts.map((alert) => <div key={alert.id} className="app-surface-2 app-border flex items-center justify-between rounded-xl border p-3 text-sm"><span className="app-text"><strong>{alert.symbol}</strong> · {alert.metric_type} {alert.condition === "ABOVE" ? ">" : "<"} {format(alert.target_value)}</span><button type="button" onClick={() => void deleteAlert(alert.id)} className="app-muted hover:text-bear" title="Alarmı sil"><X className="h-4 w-4" /></button></div>)}</div></div> : null}
      {alertSymbol ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true"><form onSubmit={createAlert} className="app-surface app-border w-full max-w-md rounded-2xl border p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><div><p className="app-muted text-xs">Yeni alarm</p><h2 className="app-text text-xl font-bold">{alertSymbol}</h2></div><button type="button" onClick={() => setAlertSymbol(null)} className="app-muted" title="Kapat"><X className="h-5 w-5" /></button></div><div className="space-y-3"><label className="app-text-secondary block text-xs">Metrik<select value={metricType} onChange={(event) => setMetricType(event.target.value)} className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm"><option value="PRICE">Fiyat</option><option value="DAILY_CHANGE">Günlük değişim %</option><option value="PE_RATIO">F/K</option><option value="MA200">200 günlük ortalama</option></select></label><div className="grid grid-cols-2 gap-2"><select value={condition} onChange={(event) => setCondition(event.target.value as "ABOVE" | "BELOW")} className="app-surface-2 app-border app-text rounded-lg border px-3 py-2 text-sm"><option value="ABOVE">Üstüne çıkarsa</option><option value="BELOW">Altına düşerse</option></select><input required type="number" step="any" value={targetValue} onChange={(event) => setTargetValue(event.target.value)} placeholder="Hedef değer" className="app-surface-2 app-border app-text rounded-lg border px-3 py-2 text-sm outline-none" /></div></div><button type="submit" className="mt-4 w-full rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white">Alarmı kaydet</button></form></div> : null}
    </section>
  );
}
