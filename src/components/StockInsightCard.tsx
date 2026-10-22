"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

type FinancialStatement = {
  year: number;
  quarter: number;
  net_profit: number;
  revenue: number;
  ebitda: number | null;
  total_debt: number | null;
  pe_ratio: number | null;
  pb_ratio: number | null;
  equity?: number | null;
};

type FundamentalsApiResponse = {
  symbol: string;
  fk: number | null;
  pddd: number | null;
  roe: number | null;
  temettuVerimi: number | null;
  piyasaDegeri: number | null;
  hisseBasinaKazanc: number | null;
  defterdegerPerShare: number | null;
  guncelFiyat: number | null;
  degisimYuzde: number | null;
  kaynakTarih?: string;
  kaynakTip?: "canli";
  error?: string;
};

function TrendIcon({ positive }: { positive: boolean }) {
  return positive ? <TrendingUp className="h-4 w-4 text-bull" aria-hidden="true" /> : <TrendingDown className="h-4 w-4 text-bear" aria-hidden="true" />;
}

const amount = (value: number | null | undefined) => (value == null ? "—" : formatNumber(value, 0));

function formatMarketCapTry(value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "—";
  const abs = Math.abs(value);
  const tr = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  if (abs >= 1_000_000_000_000) return `${tr.format(value / 1_000_000_000_000)} Trilyon ₺`;
  if (abs >= 1_000_000_000) return `${tr.format(value / 1_000_000_000)} Milyar ₺`;
  if (abs >= 1_000_000) return `${tr.format(value / 1_000_000)} Milyon ₺`;
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value)} ₺`;
}

function formatSourceDate(iso?: string) {
  if (!iso) return "az önce";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "az önce";
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StockInsightCard({ statements, loading, ticker }: { ticker: string; statements: FinancialStatement[]; loading: boolean }) {
  const latest = statements[statements.length - 1];
  const previous = statements.length > 1 ? statements[statements.length - 2] : null;

  const [apiFundamentals, setApiFundamentals] = useState<FundamentalsApiResponse | null>(null);
  const [fundamentalsLoading, setFundamentalsLoading] = useState(true);
  const [fundamentalsError, setFundamentalsError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setFundamentalsLoading(true);
    setFundamentalsError(null);

    void fetch(`/api/fundamentals/${encodeURIComponent(ticker)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as FundamentalsApiResponse;
        if (!response.ok) throw new Error(payload.error ?? "Canlı veri alınamadı, lütfen tekrar deneyin.");
        return payload;
      })
      .then((payload: FundamentalsApiResponse) => {
        if (!cancelled) setApiFundamentals(payload);
      })
      .catch((error) => {
        if (!cancelled) {
          setApiFundamentals(null);
          setFundamentalsError(error instanceof Error ? error.message : "Canlı veri alınamadı, lütfen tekrar deneyin.");
        }
      })
      .finally(() => {
        if (!cancelled) setFundamentalsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ticker, retryTick]);

  const metrics = useMemo<Array<[string, string]>>(() => [
    ["F/K", typeof apiFundamentals?.fk === "number" ? formatNumber(apiFundamentals.fk, 1) : "—"],
    ["PD/DD", typeof apiFundamentals?.pddd === "number" ? formatNumber(apiFundamentals.pddd, 2) : "—"],
    ["Piyasa değeri", formatMarketCapTry(apiFundamentals?.piyasaDegeri ?? null)],
    ["FAVÖK", latest?.ebitda != null ? amount(latest.ebitda) : "—"],
    ["Net kâr", latest?.net_profit != null ? amount(latest.net_profit) : "—"],
    ["Ciro", latest?.revenue != null ? amount(latest.revenue) : "—"],
    ["Borç", latest?.total_debt != null ? amount(latest.total_debt) : "—"],
    ["Özsermaye", latest?.equity != null ? amount(latest.equity) : "—"],
    ["Temettü verimi", typeof apiFundamentals?.temettuVerimi === "number" ? `%${formatNumber(apiFundamentals.temettuVerimi, 1)}` : "—"],
    ["ROE", typeof apiFundamentals?.roe === "number" ? `%${formatNumber(apiFundamentals.roe, 1)}` : "—"],
  ], [apiFundamentals, latest]);

  const profitChange = latest?.net_profit != null && previous?.net_profit != null && previous.net_profit !== 0
    ? ((latest.net_profit - previous.net_profit) / Math.abs(previous.net_profit)) * 100
    : null;
  const revenueChange = latest?.revenue != null && previous?.revenue != null && previous.revenue !== 0
    ? ((latest.revenue - previous.revenue) / Math.abs(previous.revenue)) * 100
    : null;

  const trends = [
    { label: "Net kâr değişimi", positive: (profitChange ?? 0) >= 0, text: profitChange == null ? "—" : `%${formatNumber(profitChange, 1)}` },
    { label: "Hasılat değişimi", positive: (revenueChange ?? 0) >= 0, text: revenueChange == null ? "—" : `%${formatNumber(revenueChange, 1)}` },
    { label: "Dönem", positive: true, text: latest ? `${latest.year}/Q${latest.quarter}` : "—" },
  ];

  return (
    <section className="section-card" aria-labelledby="financials-title">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 id="financials-title" className="app-text text-lg font-bold">Temel finansal bilgiler</h2>
        {apiFundamentals ? (
          <span className="rounded-full bg-[var(--up-bg)] px-2 py-1 text-[11px] font-semibold text-[var(--up)]">
            Canlı veri · {formatSourceDate(apiFundamentals.kaynakTarih)}
          </span>
        ) : null}
      </div>

      <p className="app-muted mb-4 mt-1 text-xs">
        {loading || fundamentalsLoading ? "Finansal metrikler güncelleniyor." : "Canlı temel oranlar API üzerinden gösterilir."}
      </p>

      {fundamentalsError ? (
        <div className="mb-4 rounded-lg border border-[var(--color-gold)] bg-[var(--color-gold)]/10 p-3 text-xs text-gold">
          <p>{fundamentalsError}</p>
          <button type="button" onClick={() => setRetryTick((v) => v + 1)} className="mt-2 inline-flex items-center gap-1 font-semibold text-primary">
            <RefreshCw className="h-3.5 w-3.5" /> Yeniden dene
          </button>
        </div>
      ) : null}

      {loading || fundamentalsLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-16 w-full" />)}</div>
      ) : (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {metrics.map(([label, value]) => (
            <div key={label} className="app-surface-2 min-w-0 rounded-lg p-3">
              <dt className="app-muted text-xs">{label}</dt>
              <dd className="app-text mt-1 truncate text-base font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="app-border mt-4 grid gap-3 border-t pt-4 sm:grid-cols-3">
        {trends.map((item) => (
          <div key={item.label} className="flex items-start gap-2"><TrendIcon positive={item.positive} /><div><p className="app-text text-sm font-semibold">{item.label}</p><p className="app-muted text-xs">{item.text}</p></div></div>
        ))}
      </div>
    </section>
  );
}
