"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { formatNumber } from "@/lib/utils";

const currencies = [
  ["TRY", "Türk Lirası"], ["USD", "ABD Doları"], ["EUR", "Euro"], ["GBP", "Sterlin"],
  ["CHF", "İsviçre Frangı"], ["JPY", "Japon Yeni"], ["CAD", "Kanada Doları"],
  ["AUD", "Avustralya Doları"], ["RUB", "Rus Rublesi"], ["SAR", "Suudi Riyali"],
  ["CNY", "Çin Yuanı"], ["SEK", "İsveç Kronu"], ["NOK", "Norveç Kronu"],
  ["DKK", "Danimarka Kronu"], ["PLN", "Polonya Zlotisi"], ["AED", "BAE Dirhemi"],
  ["KWD", "Kuveyt Dinarı"], ["QAR", "Katar Riyali"], ["KRW", "Güney Kore Wonu"],
  ["INR", "Hindistan Rupisi"],
] as const;

type CurrencyCode = (typeof currencies)[number][0];
type Quote = { code: string; price: number };

const quoteCodes = currencies
  .filter(([code]) => code !== "TRY")
  .map(([code]) => `${code}TRY`)
  .join(",");

export function LiveCurrencyConverter() {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState<CurrencyCode>("USD");
  const [to, setTo] = useState<CurrencyCode>("TRY");
  const [rates, setRates] = useState<Record<string, number>>({ TRY: 1 });
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  async function loadRates() {
    setLoading(true);
    try {
      const response = await fetch(`/api/quotes?symbols=${quoteCodes}`, { cache: "no-store" });
      const payload = (await response.json()) as { data?: Quote[] };
      const nextRates: Record<string, number> = { TRY: 1 };
      for (const quote of payload.data ?? []) {
        const code = quote.code.replace(/TRY$/, "");
        if (quote.price > 0) nextRates[code] = quote.price;
      }
      setRates(nextRates);
      setUpdatedAt(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadRates(), 0);
    const timer = window.setInterval(() => void loadRates(), 30000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, []);

  const result = useMemo(() => {
    const fromRate = rates[from];
    const toRate = rates[to];
    if (!Number.isFinite(amount) || amount < 0 || !fromRate || !toRate) return null;
    return amount * fromRate / toRate;
  }, [amount, from, rates, to]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div className="app-surface-2 app-border mt-4 rounded-xl border p-3">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="app-text text-lg font-semibold">Canlı Döviz Dönüştürücü</h3>
          <p className="app-muted text-xs">Yahoo Finance kurlarından yaklaşık 30 saniyede bir güncellenir.</p>
        </div>
        <button type="button" onClick={() => void loadRates()} className="app-border app-text inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs" aria-label="Kurları yenile">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Yenile
        </button>
      </div>
      <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <label className="app-muted text-xs">Tutar
          <input type="number" min="0" value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          <select value={from} onChange={(event) => setFrom(event.target.value as CurrencyCode)} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm">
            {currencies.map(([code, label]) => <option key={code} value={code}>{code} - {label}</option>)}
          </select>
        </label>
        <button type="button" onClick={swap} className="app-border app-text rounded-lg border px-3 py-2 text-sm" aria-label="Para birimlerini değiştir">⇄</button>
        <label className="app-muted text-xs">Hedef para birimi
          <select value={to} onChange={(event) => setTo(event.target.value as CurrencyCode)} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm">
            {currencies.map(([code, label]) => <option key={code} value={code}>{code} - {label}</option>)}
          </select>
          <output className="app-surface app-border app-text mt-1 block min-h-10 rounded-lg border px-3 py-2 text-lg font-bold">
            {result === null ? (loading ? "Kurlar yükleniyor..." : "Kur bulunamadı") : `${formatNumber(result, result >= 100 ? 2 : 4)} ${to}`}
          </output>
        </label>
      </div>
      <p className="app-muted mt-2 text-[11px]">Son güncelleme: {updatedAt ? new Date(updatedAt).toLocaleTimeString("tr-TR") : "-"}. Bilgilendirme amaçlıdır.</p>
    </div>
  );
}
