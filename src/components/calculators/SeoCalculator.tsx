"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator } from "lucide-react";
import { calculateReturn, type CurrencyCode } from "@/lib/finance";
import { formatCurrency, formatNumber } from "@/lib/utils";

type CalculatorMode = "compound" | "dividend" | "average" | "stockGold";

type Props = {
  mode: CalculatorMode;
  title: string;
  intro: string;
};

type CalculatorResult = {
  average?: number;
  totalInvested?: number;
  months?: number;
  stock?: ReturnType<typeof calculateReturn>;
  gold?: ReturnType<typeof calculateReturn>;
  base?: ReturnType<typeof calculateReturn>;
  dividendEffect?: number;
  final?: number;
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1979 }, (_, index) => 1980 + index);
const currencyOptions: Array<{ code: CurrencyCode; label: string }> = [
  { code: "TL", label: "Türk Lirası" },
  { code: "USD", label: "ABD Doları" },
  { code: "EUR", label: "Euro" },
];
const money = (value: number) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(value);

export function SeoCalculator({ mode, title, intro }: Props) {
  const [amount, setAmount] = useState(100000);
  const [startYear, setStartYear] = useState(Math.max(1986, currentYear - 5));
  const [endYear, setEndYear] = useState(currentYear);
  const [currency, setCurrency] = useState<CurrencyCode>("TL");
  const [annualDividend, setAnnualDividend] = useState(3.5);
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [averagePrice, setAveragePrice] = useState(100);

  const result: CalculatorResult = useMemo(() => {
    if (mode === "average") {
      const months = Math.max(1, (endYear - startYear + 1) * 12);
      const totalInvested = monthlyAmount * months;
      return { average: totalInvested / Math.max(1, Math.floor(totalInvested / averagePrice)), totalInvested, months };
    }

    if (mode === "stockGold") {
      const stock = calculateReturn({ initial: amount, currency: "TL", startYear, endYear, asset: "BIST100", drip: true, usCpiAdjusted: false });
      const gold = calculateReturn({ initial: amount, currency: "TL", startYear, endYear, asset: "GRAM_ALTIN", drip: false, usCpiAdjusted: false });
      return { stock, gold };
    }

    const base = calculateReturn({
      initial: amount,
      currency,
      startYear,
      endYear,
      asset: "BIST100",
      drip: mode === "dividend",
      usCpiAdjusted: false,
    });
    const dividendEffect = mode === "dividend" ? base.finalNominal * (annualDividend / 100) * Math.max(1, endYear - startYear) : 0;
    return { base, dividendEffect, final: base.finalNominal + dividendEffect };
  }, [amount, annualDividend, averagePrice, currency, endYear, mode, monthlyAmount, startYear]);

  const heading = mode === "stockGold" ? "BIST 100 vs Gram Altın" : mode === "average" ? "Maliyet Ortalaman" : mode === "dividend" ? "Temettü Getirin" : "Bileşik Getirin";

  return (
    <section className="section-card mx-auto max-w-4xl">
      <div className="mb-5 flex items-start gap-3"><span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white"><Calculator className="h-5 w-5" /></span><div><p className="app-muted text-xs font-semibold uppercase tracking-wide">Ücretsiz finans aracı</p><h1 className="app-text text-2xl font-bold md:text-3xl">{title}</h1><p className="app-text-secondary mt-2 text-sm leading-6">{intro}</p></div></div>
      <div className="app-surface-2 app-border rounded-2xl border p-4">
        {mode === "average" ? <div className="grid gap-3 sm:grid-cols-3"><label className="app-text-secondary text-xs">Aylık yatırım<input type="number" min="0" value={monthlyAmount} onChange={(event) => setMonthlyAmount(Number(event.target.value))} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label><label className="app-text-secondary text-xs">Alış fiyatı<input type="number" min="0.01" value={averagePrice} onChange={(event) => setAveragePrice(Number(event.target.value))} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label><label className="app-text-secondary text-xs">Başlangıç yılı<select value={startYear} onChange={(event) => setStartYear(Number(event.target.value))} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm">{years.map((year) => <option key={year}>{year}</option>)}</select></label></div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="app-text-secondary text-xs">Başlangıç tutarı<input type="number" min="0" value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label><label className="app-text-secondary text-xs">Başlangıç yılı<select value={startYear} onChange={(event) => setStartYear(Number(event.target.value))} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm">{years.map((year) => <option key={year}>{year}</option>)}</select></label><label className="app-text-secondary text-xs">Bitiş yılı<select value={endYear} onChange={(event) => setEndYear(Number(event.target.value))} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm">{years.filter((year) => year >= startYear).map((year) => <option key={year}>{year}</option>)}</select></label>{mode === "dividend" ? <label className="app-text-secondary text-xs">Yıllık temettü verimi %<input type="number" min="0" step="0.1" value={annualDividend} onChange={(event) => setAnnualDividend(Number(event.target.value))} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label> : <label className="app-text-secondary text-xs">Para birimi<select value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm">{currencyOptions.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>}</div>}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="app-surface-2 app-border rounded-xl border p-4"><p className="app-muted text-xs">{heading}</p><p className="app-text mt-1 text-2xl font-bold">{mode === "average" ? `${money(result.average ?? 0)} TL` : mode === "stockGold" ? `${money(result.stock?.finalNominal ?? 0)} TL` : `${money(result.final ?? 0)} TL`}</p></div><div className="app-surface-2 app-border rounded-xl border p-4"><p className="app-muted text-xs">Karşılaştırma</p><p className="app-text mt-1 text-2xl font-bold">{mode === "average" ? `${result.months ?? 0} ay` : mode === "stockGold" ? `${money(result.gold?.finalNominal ?? 0)} TL` : `%${formatNumber(result.base?.gainPct ?? 0)}`}</p></div><div className="app-surface-2 app-border rounded-xl border p-4"><p className="app-muted text-xs">Bilgi</p><p className="app-text mt-1 text-sm font-semibold">{mode === "average" ? `${money(result.totalInvested ?? 0)} TL toplam yatırım` : mode === "stockGold" ? `Altın farkı: ${money((result.stock?.finalNominal ?? 0) - (result.gold?.finalNominal ?? 0))} TL` : `CAGR: %${formatNumber(result.base?.cagr ?? 0)}`}</p></div></div>

      {mode === "stockGold" ? <div className="mt-5 rounded-xl border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 p-4 text-sm"><p className="app-text font-semibold">100.000 TL 5 yıl önce ne oldu?</p><p className="app-muted mt-1">BIST 100: {formatCurrency(result.stock?.finalNominal ?? 0)} · Gram Altın: {formatCurrency(result.gold?.finalNominal ?? 0)}</p></div> : null}
      {mode === "dividend" ? <p className="app-muted mt-4 text-xs">Temettü etkisi simülasyona dahil edilmiştir. Gerçek ödeme tarihleri ve şirket politikaları farklılık gösterebilir.</p> : null}
      <div className="mt-6 flex flex-wrap gap-2"><Link href="/hesaplayicilar/bilesik-getiri" className="app-border app-text-secondary inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs">Bileşik getiri <ArrowRight className="h-3 w-3" /></Link><Link href="/hesaplayicilar/temettu-getirisi" className="app-border app-text-secondary inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs">Temettü getirisi <ArrowRight className="h-3 w-3" /></Link><Link href="/hesaplayicilar/maliyet-ortalamasi" className="app-border app-text-secondary inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs">Maliyet ortalaması <ArrowRight className="h-3 w-3" /></Link><Link href="/hesaplayicilar/hisse-vs-altin" className="app-border app-text-secondary inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs">Hisse vs Altın <ArrowRight className="h-3 w-3" /></Link></div>
      <p className="app-muted mt-5 border-t border-[var(--border)] pt-4 text-xs">Hesaplama sonuçları tarihsel ve yaklaşık serilere dayanır; yatırım tavsiyesi değildir.</p>
    </section>
  );
}
