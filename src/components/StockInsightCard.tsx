"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
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
};

const UNAVAILABLE = "Veri mevcut değil";

function TrendIcon({ positive }: { positive: boolean }) {
  return positive ? <TrendingUp className="h-4 w-4 text-bull" aria-hidden="true" /> : <TrendingDown className="h-4 w-4 text-bear" aria-hidden="true" />;
}

const amount = (value: number | null | undefined) => (value == null ? null : formatNumber(value, 0));
const ratio = (value: number | null | undefined) => (value == null ? null : formatNumber(value, 2));

export function StockInsightCard({ statements, loading }: { ticker: string; statements: FinancialStatement[]; loading: boolean }) {
  const latest = statements[statements.length - 1];
  const first = statements[0];

  // Şema piyasa değeri, özsermaye ve temettü verimi içermez; bu alanlar tahmin edilmez.
  const metrics: Array<[string, string | null]> = [
    ["F/K", ratio(latest?.pe_ratio)],
    ["PD/DD", ratio(latest?.pb_ratio)],
    ["Piyasa değeri", null],
    ["FAVÖK", amount(latest?.ebitda)],
    ["Net kâr", amount(latest?.net_profit)],
    ["Ciro", amount(latest?.revenue)],
    ["Borç", amount(latest?.total_debt)],
    ["Özsermaye", null],
    ["Temettü verimi", null],
  ];

  const trends = statements.length > 1 && latest && first ? [
    { label: "Net kâr", positive: latest.net_profit >= first.net_profit, text: latest.net_profit >= first.net_profit ? "İlk kayıtlı döneme göre yüksek." : "İlk kayıtlı döneme göre düşük." },
    { label: "Ciro", positive: latest.revenue >= first.revenue, text: latest.revenue >= first.revenue ? "İlk kayıtlı döneme göre yüksek." : "İlk kayıtlı döneme göre düşük." },
    ...(latest.total_debt != null && first.total_debt ? [{ label: "Borç", positive: latest.total_debt <= first.total_debt, text: latest.total_debt <= first.total_debt ? "İlk kayıtlı döneme göre düşük veya eşit." : "İlk kayıtlı döneme göre yüksek." }] : []),
  ] : [];

  return (
    <section className="section-card" aria-labelledby="financials-title">
      <div className="mb-4">
        <h2 id="financials-title" className="app-text text-lg font-bold">Temel finansal bilgiler</h2>
        <p className="app-muted mt-1 text-xs">
          {loading ? "Finansal tablo verisi yükleniyor." : latest ? `Son kayıtlı dönem: ${latest.year} / ${latest.quarter}. ay. Tutarlar kayıttaki birimle gösterilir.` : "Bu hisse için finansal tablo kaydı bulunmuyor."}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-16 w-full" />)}</div>
      ) : (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {metrics.map(([label, value]) => (
            <div key={label} className="app-surface-2 min-w-0 rounded-lg p-3">
              <dt className="app-muted text-xs">{label}</dt>
              <dd className={value ? "app-text mt-1 truncate text-base font-semibold tabular-nums" : "app-muted mt-1 text-xs"}>{value ?? UNAVAILABLE}</dd>
            </div>
          ))}
        </dl>
      )}

      {trends.length ? (
        <div className="app-border mt-4 grid gap-3 border-t pt-4 sm:grid-cols-3">
          {trends.map((item) => (
            <div key={item.label} className="flex items-start gap-2"><TrendIcon positive={item.positive} /><div><p className="app-text text-sm font-semibold">{item.label}</p><p className="app-muted text-xs">{item.text}</p></div></div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
