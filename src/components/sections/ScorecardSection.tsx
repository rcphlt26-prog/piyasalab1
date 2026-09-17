"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ShareCard } from "@/components/ShareCard";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { popularStocks, scorecardData } from "@/data/scorecardData";
import { insiderTransactions } from "@/data/insiderData";

const ScoreRadar = dynamic(() => import("@/components/ClientCharts").then((m) => m.ScoreRadar), { ssr: false });
const InsiderFlowChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.InsiderFlowChart), { ssr: false });

export function ScorecardSection() {
  const [selectedScoreStock, setSelectedScoreStock] = useState("THYAO");
  const [searchStock, setSearchStock] = useState("");
  const [insiderTickerFilter, setInsiderTickerFilter] = useState("Tümü");
  const [insiderTypeFilter, setInsiderTypeFilter] = useState<"Tümü" | "Alım" | "Satım" | "Geri Alım">("Tümü");

  const selectedMetrics = scorecardData[selectedScoreStock];
  const scoreAvg = useMemo(() => {
    if (!selectedMetrics) return 0;
    return (selectedMetrics.valuation + selectedMetrics.health + selectedMetrics.dividend + selectedMetrics.growth + selectedMetrics.momentum) / 5;
  }, [selectedMetrics]);
  const verdict = scoreAvg >= 7.2 ? "güçlü" : scoreAvg >= 5.5 ? "orta" : "zayıf";
  const filteredStocks = popularStocks.filter((s) => s.toLowerCase().includes(searchStock.toLowerCase()));

  const filteredInsider = insiderTransactions.filter((tx) => {
    const tickerOk = insiderTickerFilter === "Tümü" || tx.ticker === insiderTickerFilter;
    const typeOk = insiderTypeFilter === "Tümü" || tx.type === insiderTypeFilter;
    return tickerOk && typeOk;
  }).filter((tx) => Number.isFinite(tx.approxValue) && tx.approxValue >= 0 && Number.isFinite(tx.shares));

  const insiderFlow = useMemo(() => {
    const sums = filteredInsider.reduce(
      (acc, tx) => { acc[tx.type] += tx.approxValue; return acc; },
      { Alım: 0, Satım: 0, "Geri Alım": 0 } as Record<"Alım" | "Satım" | "Geri Alım", number>,
    );
    return [
      { tur: "Alım", tutar: Number.isFinite(sums.Alım) ? sums.Alım : 0 },
      { tur: "Satım", tutar: Number.isFinite(sums.Satım) ? sums.Satım : 0 },
      { tur: "Geri Alım", tutar: Number.isFinite(sums["Geri Alım"]) ? sums["Geri Alım"] : 0 },
    ];
  }, [filteredInsider]);

  return (
    <section className="section-card fade-in">
      <SectionTitle
        eyebrow="Analiz"
        title="Hisse Karnesi & Patron/Insider Takibi"
        description="Karnedeki veriler temsili eğitim verisidir. Yatırım kararı için tek başına kullanılmamalıdır."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="app-surface-2 app-border rounded-xl border p-3">
          <div className="mb-2 flex flex-wrap gap-2">
            <input value={searchStock} onChange={(e) => setSearchStock(e.target.value)} placeholder="Hisse ara..." className="app-surface app-border app-text flex-1 rounded-lg border px-3 py-2 text-sm" />
            <select value={selectedScoreStock} onChange={(e) => setSelectedScoreStock(e.target.value)} className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm">
              {filteredStocks.map((stock) => <option key={stock}>{stock}</option>)}
            </select>
          </div>
          {selectedMetrics ? (
            <>
              <p className="app-text-secondary mb-2 text-sm">{selectedMetrics.note}</p>
              <div className="mb-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <div className="app-surface app-border rounded-lg border p-2">
                  <p className="app-muted text-[10px]">Piyasa Değeri</p>
                  <p className="app-text font-semibold">{selectedMetrics.marketCap}</p>
                </div>
                <div className="app-surface app-border rounded-lg border p-2">
                  <p className="app-muted text-[10px]">52H Aralığı</p>
                  <p className="app-text font-semibold">{formatNumber(selectedMetrics.weekLow52)} - {formatNumber(selectedMetrics.weekHigh52)}</p>
                </div>
                <div className="app-surface app-border rounded-lg border p-2">
                  <p className="app-muted text-[10px]">Temettü Verimi</p>
                  <p className={`font-semibold ${selectedMetrics.dividendYield >= 4 ? "text-bull" : selectedMetrics.dividendYield >= 2 ? "text-gold" : "text-bear"}`}>%{formatNumber(selectedMetrics.dividendYield, 1)}</p>
                </div>
                <div className="app-surface app-border rounded-lg border p-2">
                  <p className="app-muted text-[10px]">Yıllık Getiri</p>
                  <p className={`font-semibold ${selectedMetrics.annualReturn >= 0 ? "text-bull" : "text-bear"}`}>{selectedMetrics.annualReturn >= 0 ? "+" : ""}{formatNumber(selectedMetrics.annualReturn, 1)}%</p>
                </div>
                <div className="app-surface app-border rounded-lg border p-2">
                  <p className="app-muted text-[10px]">Beta</p>
                  <p className={`font-semibold ${selectedMetrics.beta <= 1 ? "text-bull" : selectedMetrics.beta <= 1.4 ? "text-gold" : "text-bear"}`}>{formatNumber(selectedMetrics.beta)}</p>
                </div>
                <div className="app-surface app-border rounded-lg border p-2">
                  <p className="app-muted text-[10px]">Borç/Özsermaye</p>
                  <p className={`font-semibold ${selectedMetrics.debtEquity <= 0.8 ? "text-bull" : selectedMetrics.debtEquity <= 1.5 ? "text-gold" : "text-bear"}`}>{formatNumber(selectedMetrics.debtEquity)}</p>
                </div>
                <div className="app-surface app-border rounded-lg border p-2">
                  <p className="app-muted text-[10px]">F/K</p>
                  <p className="app-text font-semibold">{selectedMetrics.fk}</p>
                </div>
                <div className="app-surface app-border rounded-lg border p-2">
                  <p className="app-muted text-[10px]">PD/DD</p>
                  <p className="app-text font-semibold">{selectedMetrics.pddd}</p>
                </div>
              </div>
              <ScoreRadar
                data={[
                  { metric: "Değerleme", score: selectedMetrics.valuation },
                  { metric: "Finansal Sağlık", score: selectedMetrics.health },
                  { metric: "Temettü", score: selectedMetrics.dividend },
                  { metric: "Büyüme", score: selectedMetrics.growth },
                  { metric: "Momentum", score: selectedMetrics.momentum },
                ]}
              />
              <div className="mt-3 space-y-2 text-xs">
                {[
                  ["Değerleme", selectedMetrics.valuation],
                  ["Finansal Sağlık", selectedMetrics.health],
                  ["Temettü", selectedMetrics.dividend],
                  ["Büyüme", selectedMetrics.growth],
                  ["Momentum", selectedMetrics.momentum],
                ].map(([name, score]) => (
                  <div key={String(name)}>
                    <div className="mb-1 flex justify-between"><span>{name}</span><span>{score}/10</span></div>
                    <div className="app-surface-3 h-2 rounded-full"><div style={{ width: `${Number(score) * 10}%` }} className="h-full rounded-full bg-[var(--color-bull)]" /></div>
                  </div>
                ))}
              </div>
              <p className="app-surface app-border mt-3 rounded-xl border p-2 text-sm">Bileşik skor: <strong>{formatNumber(scoreAvg)}/10</strong> · Görünüm: <strong className={verdict === "güçlü" ? "text-bull" : verdict === "orta" ? "text-gold" : "text-bear"}>{verdict}</strong></p>
              <div className="mt-3">
                <ShareCard
                  template="karne"
                  title={`${selectedScoreStock} Hisse Karnesi`}
                  subtitle="Temsili skor özeti"
                  highlight={{ label: "Bileşik Skor", value: `${formatNumber(scoreAvg)}/10` }}
                  metrics={[
                    { label: "Görünüm", value: verdict.toUpperCase() },
                    { label: "F/K", value: String(selectedMetrics.fk) },
                    { label: "PD/DD", value: String(selectedMetrics.pddd) },
                    { label: "Momentum", value: `${selectedMetrics.momentum}/10` },
                  ]}
                  shareText={`${selectedScoreStock} için hisse karnesi skorumu VeriAkış'da çıkardım.`}
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="app-surface-2 app-border rounded-xl border p-3">
          <h3 className="app-text mb-2 text-lg font-semibold">Patron / Insider Takibi</h3>
          <div className="mb-2 flex max-w-full flex-wrap gap-2">
            <select value={insiderTickerFilter} onChange={(e) => setInsiderTickerFilter(e.target.value)} className="app-surface app-border app-text rounded-lg border px-2 py-1 text-xs">
              <option>Tümü</option>
              {[...new Set(insiderTransactions.map((x) => x.ticker))].map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={insiderTypeFilter} onChange={(e) => setInsiderTypeFilter(e.target.value as "Tümü" | "Alım" | "Satım" | "Geri Alım")} className="app-surface app-border app-text rounded-lg border px-2 py-1 text-xs">
              <option>Tümü</option><option>Alım</option><option>Satım</option><option>Geri Alım</option>
            </select>
          </div>
          <InsiderFlowChart data={insiderFlow} />
          <div className="mt-2 max-h-[280px] overflow-auto">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-xs">
                <thead>
                  <tr className="app-muted text-left">
                    <th className="app-border border-b px-2 py-1.5 font-semibold">Şirket</th>
                    <th className="app-border border-b px-2 py-1.5 font-semibold">İşlem</th>
                    <th className="app-border border-b px-2 py-1.5 font-semibold">Aktör</th>
                    <th className="app-border border-b px-2 py-1.5 text-right font-semibold">Tutar</th>
                    <th className="app-border border-b px-2 py-1.5 font-semibold">Tarih</th>
                    <th className="app-border border-b px-2 py-1.5 font-semibold">Kaynak</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInsider.map((tx) => (
                    <tr key={tx.id} className="app-border border-b">
                      <td className="px-2 py-1.5">
                        <span className="app-text font-semibold">{tx.ticker}</span>
                        <span className="app-muted block text-[10px]">{tx.company}</span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`inline-block rounded-full px-2 py-0.5 font-semibold ${tx.type === "Alım" ? "bg-[var(--color-bull)]/15 text-bull" : tx.type === "Satım" ? "bg-[var(--color-bear)]/15 text-bear" : "bg-[var(--color-primary)]/15 text-primary"}`}>{tx.type}</span>
                      </td>
                      <td className="app-text-secondary px-2 py-1.5">{tx.actor}</td>
                      <td className="app-text px-2 py-1.5 text-right font-semibold">{formatCurrency(tx.approxValue)}</td>
                      <td className="app-muted px-2 py-1.5 whitespace-nowrap">{tx.date}</td>
                      <td className="app-muted px-2 py-1.5">{tx.source}</td>
                    </tr>
                  ))}
                  {filteredInsider.length === 0 && (
                    <tr><td colSpan={6} className="app-muted px-2 py-4 text-center">Kayıt bulunamadı.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <p className="app-muted mt-2 text-xs">Not: Bu bölümdeki kayıtlar örnek/temsili veri olarak hazırlanmıştır.</p>
        </div>
      </div>
    </section>
  );
}
