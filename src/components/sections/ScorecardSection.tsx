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
  });

  const insiderFlow = useMemo(() => {
    const sums = filteredInsider.reduce(
      (acc, tx) => { acc[tx.type] += tx.approxValue; return acc; },
      { Alım: 0, Satım: 0, "Geri Alım": 0 } as Record<"Alım" | "Satım" | "Geri Alım", number>,
    );
    return [
      { tur: "Alım", tutar: sums.Alım },
      { tur: "Satım", tutar: sums.Satım },
      { tur: "Geri Alım", tutar: sums["Geri Alım"] },
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
              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div className="app-border rounded-lg border p-2">F/K: <strong>{selectedMetrics.fk}</strong></div>
                <div className="app-border rounded-lg border p-2">PD/DD: <strong>{selectedMetrics.pddd}</strong></div>
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
                  shareText={`${selectedScoreStock} için hisse karnesi skorumu Piyasalab'da çıkardım.`}
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="app-surface-2 app-border rounded-xl border p-3">
          <h3 className="app-text mb-2 text-lg font-semibold">Patron / Insider Takibi</h3>
          <div className="mb-2 flex gap-2">
            <select value={insiderTickerFilter} onChange={(e) => setInsiderTickerFilter(e.target.value)} className="app-surface app-border app-text rounded-lg border px-2 py-1 text-xs">
              <option>Tümü</option>
              {[...new Set(insiderTransactions.map((x) => x.ticker))].map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={insiderTypeFilter} onChange={(e) => setInsiderTypeFilter(e.target.value as "Tümü" | "Alım" | "Satım" | "Geri Alım")} className="app-surface app-border app-text rounded-lg border px-2 py-1 text-xs">
              <option>Tümü</option><option>Alım</option><option>Satım</option><option>Geri Alım</option>
            </select>
          </div>
          <InsiderFlowChart data={insiderFlow} />
          <div className="mt-2 max-h-[260px] space-y-2 overflow-auto pr-1 text-xs">
            {filteredInsider.map((tx) => (
              <article key={tx.id} className="app-surface app-border rounded-lg border p-2">
                <div className="mb-1 flex items-center justify-between"><strong>{tx.company} ({tx.ticker})</strong>
                  <span className={`rounded-full px-2 py-0.5 ${tx.type === "Alım" ? "bg-[var(--color-bull)]/15 text-bull" : tx.type === "Satım" ? "bg-[var(--color-bear)]/15 text-bear" : "bg-[var(--color-primary)]/15 text-primary"}`}>{tx.type}</span>
                </div>
                <p>{tx.actor} · {formatNumber(tx.shares, 0)} lot · ≈ {formatCurrency(tx.approxValue)}</p>
                <p className="app-muted">{tx.date} · {tx.source}</p>
              </article>
            ))}
          </div>
          <p className="app-muted mt-2 text-xs">Not: Bu bölümdeki kayıtlar örnek/temsili veri olarak hazırlanmıştır.</p>
        </div>
      </div>
    </section>
  );
}
