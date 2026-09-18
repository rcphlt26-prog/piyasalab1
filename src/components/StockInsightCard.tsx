"use client";

import { ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

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

function TrendIcon({ positive }: { positive: boolean }) {
  return positive ? <TrendingUp className="h-4 w-4 text-bull" /> : <TrendingDown className="h-4 w-4 text-bear" />;
}

export function StockInsightCard({ ticker, statements, changePct }: { ticker: string; statements: FinancialStatement[]; changePct?: number }) {
  if (statements.length === 0) return null;
  const latest = statements[statements.length - 1];
  const first = statements[0];
  const profitGrowing = latest.net_profit >= first.net_profit;
  const debtSafe = latest.total_debt === null || !first.total_debt || latest.total_debt <= first.total_debt;
  const growthPositive = latest.revenue >= first.revenue;

  const metrics = [
    ["Piyasa Değeri", "Veri yok"],
    ["F/K", latest.pe_ratio === null ? "Veri yok" : formatNumber(latest.pe_ratio)],
    ["PD/DD", latest.pb_ratio === null ? "Veri yok" : formatNumber(latest.pb_ratio)],
    ["FD/FAVÖK", latest.ebitda === null ? "Veri yok" : formatNumber(latest.revenue / Math.max(latest.ebitda, 1))],
    ["Borç", latest.total_debt === null ? "Veri yok" : formatNumber(latest.total_debt)],
    ["Net Kâr", formatNumber(latest.net_profit)],
    ["Ciro", formatNumber(latest.revenue)],
    ["Temettü", "Veri yok"],
  ];

  return (
    <section className="section-card mb-4 border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--surface)] to-[var(--color-bull)]/10">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="app-muted text-xs font-semibold uppercase tracking-wide">Otomatik veri özeti</p>
          <h2 className="app-text mt-1 text-xl font-bold">{ticker} için hızlı görünüm</h2>
          <p className="app-muted mt-1 text-xs">Temsili karne verilerinden türetilmiştir; yatırım tavsiyesi değildir.</p>
        </div>
        <ShieldCheck className="h-5 w-5 text-bull" aria-label="Bilgilendirme özeti" />
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <div className="app-surface-2 app-border rounded-xl border p-3"><div className="flex items-center gap-2"><TrendIcon positive={profitGrowing} /><p className="app-text text-sm font-semibold">Kârlılık</p></div><p className="app-muted mt-1 text-xs">Son 5 yıllık seride {profitGrowing ? "artış eğiliminde" : "dalgalı"}.</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><div className="flex items-center gap-2"><TrendIcon positive={debtSafe} /><p className="app-text text-sm font-semibold">Borçluluk</p></div><p className="app-muted mt-1 text-xs">Borç/özsermaye {debtSafe ? "görece güvenli" : "yakından izlenmeli"}.</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><div className="flex items-center gap-2"><TrendIcon positive={growthPositive} /><p className="app-text text-sm font-semibold">Büyüme</p></div><p className="app-muted mt-1 text-xs">Son dönem ciro trendi {growthPositive ? "pozitif" : "geriliyor"}.</p></div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {metrics.map(([label, value]) => <div key={label} className="app-surface-2 app-border rounded-lg border p-2"><p className="app-muted text-[10px]">{label}</p><p className="app-text mt-1 text-sm font-bold">{value}</p></div>)}
      </div>
      {changePct !== undefined ? <p className="app-muted mt-3 text-[11px]">Günlük fiyat değişimi: <span className={changePct >= 0 ? "text-bull" : "text-bear"}>{changePct >= 0 ? "+" : ""}{formatNumber(changePct)}%</span></p> : null}
    </section>
  );
}
