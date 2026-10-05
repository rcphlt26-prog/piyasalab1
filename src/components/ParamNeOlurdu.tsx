"use client";

import { useMemo, useState } from "react";
import { BarChart3, History, TrendingDown, TrendingUp } from "lucide-react";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { getMarketPriceMeta, marketSymbolByCode, marketSymbols, type MarketCategory } from "@/data/marketSymbols";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const DAY_MS = 86_400_000;
// Tarihsel veri servisi en fazla 3650 gün geriye gider; sınırın biraz içinde kalınır.
const MIN_DATE = new Date(Date.now() - 3640 * DAY_MS).toISOString().slice(0, 10);
const MAX_DATE = new Date().toISOString().slice(0, 10);
// Seçilen tarihten sonraki ilk işlem günü bu kadar günden uzaksa varlık o tarihte işlem görmüyor kabul edilir.
const MAX_GAP_DAYS = 10;
const AMOUNT_PRESETS = [10_000, 50_000, 100_000];
const BENCHMARKS = ["XU100", "GRAMALTIN", "USDTRY"];
const UNAVAILABLE_TITLE = "Bu tarih için geçmiş fiyat verisi şu anda kullanılamıyor.";
const GROUPS: Array<{ category: MarketCategory; label: string }> = [
  { category: "endeks", label: "Endeksler" },
  { category: "hisse", label: "Hisseler" },
  { category: "doviz", label: "Döviz" },
  { category: "emtia", label: "Altın ve emtia" },
];

// Tutar TL kabul edildiği için yalnızca TL bazlı varlıklar listelenir.
const assetGroups = GROUPS.map((group) => ({
  ...group,
  items: marketSymbols.filter((symbol) => symbol.category === group.category && getMarketPriceMeta(symbol).currency !== "USD"),
})).filter((group) => group.items.length > 0);

type Query = { id: number; code: string; amount: number; date: string };

type Result =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "ok"; startDate: string; endDate: string; startPrice: number; endPrice: number; final: number; gain: number; pct: number };

const labelOf = (code: string) => marketSymbolByCode.get(code)?.label ?? code;
const formatDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
const signedPct = (value: number) => `${value >= 0 ? "+" : ""}${formatNumber(value, 2)}%`;
const daysBetween = (from: string, to: string) => Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / DAY_MS);

function useInvestmentResult(code: string, amount: number, date: string): Result {
  const { data, loading } = useHistoricalPrices(code, "MAX");
  return useMemo<Result>(() => {
    if (loading) return { status: "loading" };
    const start = data.find((point) => String(point.time) >= date);
    const end = data[data.length - 1];
    if (!start || !end || !(start.value > 0) || daysBetween(date, String(start.time)) > MAX_GAP_DAYS) return { status: "unavailable" };
    const final = (amount / start.value) * end.value;
    return { status: "ok", startDate: String(start.time), endDate: String(end.time), startPrice: start.value, endPrice: end.value, final, gain: final - amount, pct: (final / amount - 1) * 100 };
  }, [data, loading, amount, date]);
}

function BenchmarkRow({ code, amount, date }: { code: string; amount: number; date: string }) {
  const result = useInvestmentResult(code, amount, date);
  return (
    <li className="app-border flex min-h-12 items-center justify-between gap-3 border-b py-2 last:border-b-0">
      <span className="min-w-0">
        <span className="app-text block truncate text-sm font-medium">{labelOf(code)}</span>
        {result.status === "ok" ? <span className="app-muted block text-[11px]">Başlangıç: {formatDate(result.startDate)}</span> : null}
      </span>
      {result.status === "loading" ? <Skeleton className="h-5 w-28" /> : result.status === "ok" ? (
        <span className="flex shrink-0 flex-col items-end tabular-nums">
          <span className="app-text text-sm font-semibold">{formatCurrency(result.final)}</span>
          <span className={`text-xs font-semibold ${result.pct >= 0 ? "text-bull" : "text-bear"}`}>{signedPct(result.pct)}</span>
        </span>
      ) : <span className="app-muted max-w-[11rem] text-right text-xs">Bu dönem için veri mevcut değil.</span>}
    </li>
  );
}

function Comparison({ query }: { query: Query }) {
  const codes = BENCHMARKS.filter((code) => code !== query.code);
  return (
    <div className="mt-5">
      <h3 className="app-text mb-1 text-sm font-semibold">Aynı dönemde, aynı tutarla</h3>
      <p className="app-muted mb-1 text-xs">Yalnızca fiyat değişimine göre hesaplanır.</p>
      <ul>{codes.map((code) => <BenchmarkRow key={code} code={code} amount={query.amount} date={query.date} />)}</ul>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" }) {
  const color = tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : "app-text";
  return <div className="min-w-0"><dt className="app-muted text-xs">{label}</dt><dd className={`mt-0.5 truncate text-base font-semibold tabular-nums ${color}`}>{value}</dd></div>;
}

function ResultCard({ query }: { query: Query }) {
  const result = useInvestmentResult(query.code, query.amount, query.date);
  const [compare, setCompare] = useState(false);

  if (result.status === "loading") {
    return <div className="space-y-3" aria-busy="true" aria-label="Sonuç hesaplanıyor"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-12 w-2/3" /><Skeleton className="h-16 w-full" /></div>;
  }
  if (result.status === "unavailable") {
    return <EmptyState title={UNAVAILABLE_TITLE} description={`${labelOf(query.code)} için ${formatDate(query.date)} sonrasında kullanılabilir bir fiyat bulunamadı. Daha yakın bir tarih veya başka bir varlık deneyin.`} />;
  }

  const positive = result.gain >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  const adjusted = result.startDate !== query.date;
  return (
    <div>
      <p className="app-muted text-xs">Fiyat değişimine göre · {labelOf(query.code)}</p>
      <p className="app-text-secondary mt-1 text-sm">{formatCurrency(query.amount)} tutarın bugünkü karşılığı</p>
      <p className="app-text mt-1 text-3xl font-bold tabular-nums sm:text-5xl">{formatCurrency(result.final)}</p>
      <p className={`mt-2 inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums ${positive ? "text-bull" : "text-bear"}`}><Icon className="h-4 w-4" aria-hidden="true" />{positive ? "+" : "-"}{formatCurrency(Math.abs(result.gain))} · {signedPct(result.pct)}</p>

      <dl className="app-border mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t pt-4 sm:grid-cols-4">
        <Stat label="Başlangıç tutarı" value={formatCurrency(query.amount)} />
        <Stat label="Güncel değer" value={formatCurrency(result.final)} />
        <Stat label="Kazanç / kayıp" value={`${positive ? "+" : "-"}${formatCurrency(Math.abs(result.gain))}`} tone={positive ? "bull" : "bear"} />
        <Stat label="Değişim" value={signedPct(result.pct)} tone={positive ? "bull" : "bear"} />
      </dl>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="app-surface app-border rounded-lg border p-3"><dt className="app-muted text-xs">Başlangıç fiyatı · {formatDate(result.startDate)}</dt><dd className="app-text mt-0.5 text-sm font-semibold tabular-nums">{formatNumber(result.startPrice)}</dd></div>
        <div className="app-surface app-border rounded-lg border p-3"><dt className="app-muted text-xs">Güncel fiyat · {formatDate(result.endDate)}</dt><dd className="app-text mt-0.5 text-sm font-semibold tabular-nums">{formatNumber(result.endPrice)}</dd></div>
      </dl>
      {adjusted ? <p className="app-muted mt-3 text-xs leading-5">Seçtiğin tarih ({formatDate(query.date)}) işlem günü olmadığı için veri setindeki sonraki ilk işlem günü olan <strong className="app-text-secondary">{formatDate(result.startDate)}</strong> kapanış fiyatı kullanıldı.</p> : null}

      <button type="button" onClick={() => setCompare((value) => !value)} aria-expanded={compare} className="app-border app-text mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold hover:border-[var(--color-primary)]"><BarChart3 className="h-4 w-4" aria-hidden="true" />{compare ? "Karşılaştırmayı gizle" : "BIST 100, gram altın ve dolarla karşılaştır"}</button>
      {compare ? <Comparison query={query} /> : null}
    </div>
  );
}

const stepLabel = "app-text-secondary mb-1.5 flex items-center gap-2 text-xs font-medium";
const stepBadge = "inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary-dark)] text-[11px] font-bold text-white";
const fieldClass = "app-surface app-border app-text min-h-12 w-full rounded-lg border px-3 text-base outline-none focus:border-[var(--color-primary)]";

export function ParamNeOlurdu() {
  const [code, setCode] = useState("THYAO");
  const [amountText, setAmountText] = useState("10000");
  const [date, setDate] = useState("2020-01-01");
  const [query, setQuery] = useState<Query | null>(null);

  const amount = Number(amountText);
  const amountError = !Number.isFinite(amount) || amount < 100 ? "En az 100 TL girin." : null;
  const dateError = !date ? "Bir tarih seçin." : date < MIN_DATE ? `En erken ${formatDate(MIN_DATE)} seçilebilir.` : date > MAX_DATE ? "Gelecek bir tarih seçilemez." : null;
  const canSubmit = !amountError && !dateError;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setQuery((previous) => ({ id: (previous?.id ?? 0) + 1, code, amount, date }));
  }

  return (
    <section id="param-ne-olurdu" className="section-card scroll-mt-24 sm:p-8" aria-labelledby="param-title">
      <div className="mb-6 flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-dark)] text-white"><History className="h-5 w-5" aria-hidden="true" /></span>
        <div>
          <h2 id="param-title" className="app-text text-2xl font-bold">Param Ne Olurdu?</h2>
          <p className="app-text-secondary mt-1 text-sm">Geçmişte yatırım yapsaydın bugün paran ne kadar olurdu?</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label htmlFor="param-asset" className={stepLabel}><span className={stepBadge}>1</span> Varlık</label>
            <select id="param-asset" value={code} onChange={(event) => setCode(event.target.value)} className={fieldClass}>
              {assetGroups.map((group) => <optgroup key={group.category} label={group.label}>{group.items.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</optgroup>)}
            </select>
          </div>
          <div>
            <label htmlFor="param-amount" className={stepLabel}><span className={stepBadge}>2</span> Yatırım tutarı (TL)</label>
            <input id="param-amount" type="number" inputMode="decimal" min={100} step="any" value={amountText} onChange={(event) => setAmountText(event.target.value)} className={`${fieldClass} font-semibold tabular-nums`} aria-invalid={Boolean(amountError)} aria-describedby={amountError ? "param-amount-error" : undefined} />
            <div className="mt-2 flex flex-wrap gap-2">{AMOUNT_PRESETS.map((preset) => <button key={preset} type="button" onClick={() => setAmountText(String(preset))} className={`min-h-9 rounded-full border px-3 text-xs font-semibold ${amount === preset ? "border-transparent bg-[var(--color-primary-dark)] text-white" : "app-border app-text-secondary"}`}>{new Intl.NumberFormat("tr-TR").format(preset)} TL</button>)}</div>
            {amountError ? <p id="param-amount-error" role="alert" className="mt-1.5 text-xs text-bear">{amountError}</p> : null}
          </div>
          <div>
            <label htmlFor="param-date" className={stepLabel}><span className={stepBadge}>3</span> Başlangıç tarihi</label>
            <input id="param-date" type="date" min={MIN_DATE} max={MAX_DATE} value={date} onChange={(event) => setDate(event.target.value)} className={fieldClass} aria-invalid={Boolean(dateError)} aria-describedby={dateError ? "param-date-error" : undefined} />
            {dateError ? <p id="param-date-error" role="alert" className="mt-1.5 text-xs text-bear">{dateError}</p> : <p className="app-muted mt-1.5 text-xs">İşlem günü değilse sonraki ilk işlem günü kullanılır.</p>}
          </div>
        </div>
        <button type="submit" disabled={!canSubmit} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--color-primary-dark)] px-6 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">Şimdi hesapla</button>
      </form>

      <div className="app-surface-2 app-border mt-6 min-w-0 rounded-xl border p-4 sm:p-6" aria-live="polite">
        {query ? <ResultCard key={query.id} query={query} /> : <EmptyState compact title="Sonuç burada görünecek" description="Varlığı, tutarı ve başlangıç tarihini seçip “Şimdi hesapla” düğmesine bas." />}
      </div>

      <p className="app-muted mt-4 text-[11px] leading-5">Sonuç, seçilen başlangıç gününün kapanış fiyatı ile son kapanış fiyatı arasındaki değişime göre hesaplanır. Komisyon, vergi, temettü, bölünme ve enflasyon etkisi dahil değildir. Veri kaynağı: Yahoo Finance. Bu hesaplama bilgilendirme amaçlıdır; yatırım tavsiyesi değildir ve geçmiş performans gelecekteki getiriyi garanti etmez.</p>
    </section>
  );
}
