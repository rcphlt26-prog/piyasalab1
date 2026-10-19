"use client";

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

function TrendIcon({ positive }: { positive: boolean }) {
  return positive ? <TrendingUp className="h-4 w-4 text-bull" aria-hidden="true" /> : <TrendingDown className="h-4 w-4 text-bear" aria-hidden="true" />;
}

const amount = (value: number | null | undefined) => (value == null ? null : formatNumber(value, 0));
const ratio = (value: number | null | undefined) => (value == null ? null : formatNumber(value, 2));

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

  const metrics: Array<[string, string]> = [
    ["F/K", ratio(latest?.pe_ratio) ?? formatNumber(fundamentals.fk, 1)],
    ["PD/DD", ratio(latest?.pb_ratio) ?? formatNumber(fundamentals.pddd, 2)],
    ["Piyasa değeri", `${formatNumber(fundamentals.marketCapBnTry, 1)} mlr TL`],
    ["FAVÖK", amount(latest?.ebitda) ?? `${formatNumber(fundamentals.balanceSummary.revenueBnTry * 0.18, 1)} mlr TL`],
    ["Net kâr", amount(latest?.net_profit) ?? `${formatNumber(fundamentals.balanceSummary.netProfitBnTry, 1)} mlr TL`],
    ["Ciro", amount(latest?.revenue) ?? `${formatNumber(fundamentals.balanceSummary.revenueBnTry, 1)} mlr TL`],
    ["Borç", amount(latest?.total_debt) ?? `${formatNumber(fundamentals.balanceSummary.equityBnTry * 0.62, 1)} mlr TL`],
    ["Özsermaye", `${formatNumber(fundamentals.balanceSummary.equityBnTry, 1)} mlr TL`],
    ["Temettü verimi", `%${formatNumber(fundamentals.dividendYieldPct, 1)}`],
    ["ROE", `%${formatNumber(fundamentals.roePct, 1)}`],
  ];

  const trends = [
    { label: "Net kâr değişimi", positive: fundamentals.balanceSummary.profitChangePct >= 0, text: `%${formatNumber(fundamentals.balanceSummary.profitChangePct, 1)}` },
    { label: "Hasılat değişimi", positive: fundamentals.balanceSummary.revenueChangePct >= 0, text: `%${formatNumber(fundamentals.balanceSummary.revenueChangePct, 1)}` },
    { label: "Dönem", positive: true, text: fundamentals.balanceSummary.period },
  ];

  return (
    <section className="section-card" aria-labelledby="financials-title">
      <div className="mb-4">
        <h2 id="financials-title" className="app-text text-lg font-bold">Temel finansal bilgiler</h2>
        <p className="app-muted mt-1 text-xs">
          {loading ? "Finansal tablo verisi güncelleniyor." : `Son izlenen dönem: ${fundamentals.balanceSummary.period}.`}
          {fundamentals.source === "cache" ? " Önbellekten destekleniyor." : " Canlı veri ile eşleşti."}
        </p>
      </div>

      {loading ? (
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
