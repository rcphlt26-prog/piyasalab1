"use client";

import { useMemo, useState } from "react";
import { History, TrendingDown, TrendingUp } from "lucide-react";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { getMarketPriceMeta, marketSymbolByCode, marketSymbols, type MarketCategory } from "@/data/marketSymbols";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const DAY_MS = 86_400_000;
const MIN_DATE = new Date(Date.now() - 3640 * DAY_MS).toISOString().slice(0, 10);
const MAX_DATE = new Date().toISOString().slice(0, 10);
const MAX_GAP_DAYS = 10;
const AMOUNT_PRESETS = [10_000, 50_000, 100_000];
const BENCHMARK_CODES = ["GRAMALTIN", "USDTRY"] as const;

const QUICK_CODES = [
  "XU100",
  "GRAMALTIN",
  "USDTRY",
  "BTCUSD",
  "THYAO",
  "ASELS",
  "TUPRS",
  "FROTO",
  "GARAN",
  "EREGL",
  "KCHOL",
  "SISE",
  "BIMAS",
  "SASA",
  "AKBNK",
] as const;

const UNAVAILABLE_TITLE = "Bu tarih için geçmiş fiyat verisi şu anda kullanılamıyor.";
const GROUPS: Array<{ category: MarketCategory; label: string }> = [
  { category: "endeks", label: "Endeksler" },
  { category: "hisse", label: "Hisseler" },
  { category: "doviz", label: "Döviz" },
  { category: "emtia", label: "Altın ve emtia" },
];

const allAssets = GROUPS.flatMap((group) =>
  marketSymbols
    .filter((symbol) => symbol.category === group.category && getMarketPriceMeta(symbol).currency !== "USD")
    .map((symbol) => ({ ...symbol, groupLabel: group.label })),
);

type AssetOption = (typeof allAssets)[number];

const quickAssets: AssetOption[] = QUICK_CODES
  .map((code) => allAssets.find((asset) => asset.code === code))
  .filter((asset): asset is AssetOption => Boolean(asset));

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

function Stat({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" }) {
  const color = tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : "app-text";
  return <div className="min-w-0"><dt className="app-muted text-xs">{label}</dt><dd className={`mt-0.5 truncate text-base font-semibold tabular-nums ${color}`}>{value}</dd></div>;
}

function AssetPicker({ code, onChange }: { code: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel = labelOf(code);
  const visibleOptions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    if (!query) return quickAssets.slice(0, 15);

    return allAssets
      .filter((asset) =>
        asset.label.toLocaleLowerCase("tr-TR").includes(query)
        || asset.code.toLocaleLowerCase("tr-TR").includes(query),
      )
      .slice(0, 40);
  }, [search]);

  function selectAsset(nextCode: string) {
    onChange(nextCode);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="relative">
      <button
        type="button"
        id="param-asset"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="app-surface app-border app-text min-h-12 w-full rounded-lg border px-3 text-left text-base outline-none focus:border-[var(--color-primary)]"
      >
        <span className="block truncate">{selectedLabel}</span>
      </button>

      {open ? (
        <div className="app-surface app-border absolute z-40 mt-2 w-full rounded-xl border p-2 shadow-2xl">
          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Sembol veya varlık adı ara..."
            className="app-surface-2 app-border app-text mb-2 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <ul role="listbox" className="max-h-56 space-y-1 overflow-auto pr-1">
            {visibleOptions.map((asset) => (
              <li key={asset.code}>
                <button
                  type="button"
                  onClick={() => selectAsset(asset.code)}
                  className={`w-full rounded-lg px-2.5 py-2 text-left text-sm transition ${asset.code === code ? "bg-[var(--color-primary)] text-white" : "app-text hover:app-surface-3"}`}
                >
                  <span className="font-semibold">{asset.code}</span>
                  <span className={`ml-2 ${asset.code === code ? "text-white/90" : "app-muted"}`}>{asset.label}</span>
                  <span className={`ml-2 text-[10px] ${asset.code === code ? "text-white/80" : "app-muted"}`}>{asset.groupLabel}</span>
                </button>
              </li>
            ))}
          </ul>
          {!search.trim() ? <p className="app-muted mt-2 text-[11px]">Daha fazla varlık için arama yazın.</p> : null}
          {search.trim() && visibleOptions.length === 0 ? <p className="app-muted mt-2 text-[11px]">Eşleşen varlık bulunamadı.</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function ComparisonBars({ query, mainResult }: { query: Query; mainResult: Extract<Result, { status: "ok" }> }) {
  const gramResult = useInvestmentResult(BENCHMARK_CODES[0], query.amount, query.date);
  const usdResult = useInvestmentResult(BENCHMARK_CODES[1], query.amount, query.date);

  const loading = gramResult.status === "loading" || usdResult.status === "loading";
  if (loading) return <div className="mt-5 space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-20 w-full" /></div>;

  if (gramResult.status !== "ok" || usdResult.status !== "ok") {
    return <p className="app-muted mt-5 text-xs">Karşılaştırma için aynı dönem gram altın veya dolar verisi alınamadı.</p>;
  }

  const rows = [
    { key: "asset", label: `${labelOf(query.code)} (Seçimin)`, result: mainResult, tone: "bg-[var(--color-primary-dark)]" },
    { key: "gold", label: "Gram Altın", result: gramResult, tone: "bg-[var(--color-gold)]" },
    { key: "usd", label: "USD/TRY", result: usdResult, tone: "bg-[var(--color-bull)]" },
  ];

  const maxFinal = Math.max(...rows.map((row) => row.result.final));

  return (
    <div className="mt-6 space-y-3">
      <h3 className="app-text text-sm font-semibold">Enflasyona / Dolar / Gram Altın Karşılaştırması</h3>
      <p className="app-muted text-xs leading-5">
        Seçtiğin varlıkta paran <strong className="app-text-secondary">{formatCurrency(mainResult.final)}</strong> oldu,
        aynı gün Gram Altın alsaydın <strong className="app-text-secondary">{formatCurrency(gramResult.final)}</strong>,
        USD alsaydın <strong className="app-text-secondary">{formatCurrency(usdResult.final)}</strong> olacaktı.
      </p>

      <div className="space-y-2">
        {rows.map((row) => {
          const width = Math.max(8, (row.result.final / maxFinal) * 100);
          const positive = row.result.pct >= 0;
          return (
            <div key={row.key} className="app-surface app-border rounded-lg border p-3">
              <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                <span className="app-text font-semibold">{row.label}</span>
                <span className="app-text tabular-nums font-semibold">{formatCurrency(row.result.final)}</span>
              </div>
              <div className="app-surface-3 h-2 overflow-hidden rounded-full">
                <div className={`h-full rounded-full ${row.tone}`} style={{ width: `${width}%` }} aria-hidden="true" />
              </div>
              <p className={`mt-1 text-right text-[11px] font-semibold tabular-nums ${positive ? "text-bull" : "text-bear"}`}>{signedPct(row.result.pct)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({ query }: { query: Query }) {
  const result = useInvestmentResult(query.code, query.amount, query.date);

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

      <ComparisonBars query={query} mainResult={result} />
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
            <AssetPicker code={code} onChange={setCode} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickAssets.map((asset) => (
                <button
                  key={asset.code}
                  type="button"
                  onClick={() => setCode(asset.code)}
                  className={`min-h-8 rounded-full border px-2.5 text-[11px] font-semibold ${asset.code === code ? "border-transparent bg-[var(--color-primary-dark)] text-white" : "app-border app-text-secondary"}`}
                >
                  {asset.code}
                </button>
              ))}
            </div>
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
