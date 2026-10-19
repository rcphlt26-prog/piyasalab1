"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { getFundamentalSnapshot } from "@/data/fundamentalData";

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
  kaynakTip?: "canli" | "onbellek";
};

function TrendIcon({ positive }: { positive: boolean }) {
  return positive ? <TrendingUp className="h-4 w-4 text-bull" aria-hidden="true" /> : <TrendingDown className="h-4 w-4 text-bear" aria-hidden="true" />;
}

const amount = (value: number | null | undefined) => (value == null ? null : formatNumber(value, 0));
const ratio = (value: number | null | undefined) => (value == null ? null : formatNumber(value, 2));

function formatMarketCapTry(value: number) {
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

  const fundamentals = getFundamentalSnapshot(ticker, {
    peRatio: latest?.pe_ratio,
    pbRatio: latest?.pb_ratio,
    netProfit: latest?.net_profit,
    revenue: latest?.revenue,
    equity: latest?.equity ?? null,
    netProfitPrev: previous?.net_profit,
    revenuePrev: previous?.revenue,
  });

  const [apiFundamentals, setApiFundamentals] = useState<FundamentalsApiResponse | null>(null);
  const [fundamentalsLoading, setFundamentalsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setFundamentalsLoading(true);

    void fetch(`/api/fundamentals/${encodeURIComponent(ticker)}`)
      .then((response) => response.json())
      .then((payload: FundamentalsApiResponse) => {
        if (!cancelled) setApiFundamentals(payload);
      })
      .catch(() => {
        if (!cancelled) setApiFundamentals(null);
      })
      .finally(() => {
        if (!cancelled) setFundamentalsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ticker]);

  const effective = useMemo(() => {
    const fallbackMarketCap = Math.round(fundamentals.marketCapBnTry * 1_000_000_000);
    return {
      fk: apiFundamentals?.fk ?? latest?.pe_ratio ?? fundamentals.fk,
      pddd: apiFundamentals?.pddd ?? latest?.pb_ratio ?? fundamentals.pddd,
      roe: apiFundamentals?.roe ?? fundamentals.roePct,
      temettuVerimi: apiFundamentals?.temettuVerimi ?? fundamentals.dividendYieldPct,
      piyasaDegeri: apiFundamentals?.piyasaDegeri ?? fallbackMarketCap,
      kaynakTip: apiFundamentals?.kaynakTip ?? (fundamentals.source === "api" ? "canli" : "onbellek"),
      kaynakTarih: apiFundamentals?.kaynakTarih,
    };
  }, [apiFundamentals, fundamentals, latest?.pb_ratio, latest?.pe_ratio]);

  const metrics: Array<[string, string]> = [
    ["F/K", formatNumber(effective.fk, 1)],
    ["PD/DD", formatNumber(effective.pddd, 2)],
    ["Piyasa değeri", formatMarketCapTry(effective.piyasaDegeri)],
    ["FAVÖK", amount(latest?.ebitda) ?? `${formatNumber(fundamentals.balanceSummary.revenueBnTry * 0.18, 1)} mlr TL`],
    ["Net kâr", amount(latest?.net_profit) ?? `${formatNumber(fundamentals.balanceSummary.netProfitBnTry, 1)} mlr TL`],
    ["Ciro", amount(latest?.revenue) ?? `${formatNumber(fundamentals.balanceSummary.revenueBnTry, 1)} mlr TL`],
    ["Borç", amount(latest?.total_debt) ?? `${formatNumber(fundamentals.balanceSummary.equityBnTry * 0.62, 1)} mlr TL`],
    ["Özsermaye", `${formatNumber(fundamentals.balanceSummary.equityBnTry, 1)} mlr TL`],
    ["Temettü verimi", `%${formatNumber(effective.temettuVerimi, 1)}`],
    ["ROE", `%${formatNumber(effective.roe, 1)}`],
  ];

  const trends = [
    { label: "Net kâr değişimi", positive: fundamentals.balanceSummary.profitChangePct >= 0, text: `%${formatNumber(fundamentals.balanceSummary.profitChangePct, 1)}` },
    { label: "Hasılat değişimi", positive: fundamentals.balanceSummary.revenueChangePct >= 0, text: `%${formatNumber(fundamentals.balanceSummary.revenueChangePct, 1)}` },
    { label: "Dönem", positive: true, text: fundamentals.balanceSummary.period },
  ];

  return (
    <section className="section-card" aria-labelledby="financials-title">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 id="financials-title" className="app-text text-lg font-bold">Temel finansal bilgiler</h2>
        {effective.kaynakTip === "onbellek" ? (
          <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-1 text-[11px] font-semibold text-primary">
            📦 Önbellekten • {formatSourceDate(effective.kaynakTarih)}
          </span>
        ) : (
          <span className="rounded-full bg-[var(--up-bg)] px-2 py-1 text-[11px] font-semibold text-[var(--up)]">
            Canlı veri
          </span>
        )}
      </div>

      <p className="app-muted mb-4 mt-1 text-xs">
        {loading || fundamentalsLoading ? "Finansal metrikler güncelleniyor." : `Son izlenen dönem: ${fundamentals.balanceSummary.period}.`}
      </p>

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
