"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Sparkles, Trophy, ShieldCheck, PieChart, Swords } from "lucide-react";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ShareCard } from "@/components/ShareCard";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { calculateReturn } from "@/lib/finance";
import { duelPeriods, regretScenarios, dailyTips } from "@/data/gamesData";
import { popularStocks } from "@/data/scorecardData";
import { bist100Series, gramGoldSeries, usdTrySeries } from "@/data/historicalData";

const OverlayLineChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.OverlayLineChart), { ssr: false });
const AllocationChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.AllocationChart), { ssr: false });

const currentYear = new Date().getFullYear();

const SIM_STOCKS = ["THYAO", "ASELS", "GARAN", "BIMAS", "EREGL"];

function hashSeed(text: string) {
  return text.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}
function generateStockPath(ticker: string, length: number) {
  const seed = hashSeed(ticker) % 15;
  let current = 100;
  return Array.from({ length }, (_, i) => {
    const cycle = Math.sin((i + seed) / 2.3) * 2.2;
    const trend = 0.9 + (seed % 5) * 0.12;
    current = current * (1 + (cycle + trend) / 100);
    return Number(current.toFixed(2));
  });
}

/** SVG yay (arc) progress göstergesi — harici kütüphane yok */
function ArcProgress({ value, color }: { value: number; color: string }) {
  const radius = 70;
  const circumference = Math.PI * radius; // yarım daire
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - pct / 100);
  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-[240px]">
      <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="var(--border)" strokeWidth="14" strokeLinecap="round" />
      <path
        d="M 20 90 A 70 70 0 0 1 160 90"
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="90" y="80" textAnchor="middle" className="fill-[var(--text-primary)]" fontSize="30" fontWeight="700">{pct}</text>
      <text x="90" y="96" textAnchor="middle" className="fill-[var(--text-muted)]" fontSize="11">/ 100</text>
    </svg>
  );
}

const gdbPeriods = [
  { label: "2005 → 2010", start: 2005, end: 2010 },
  { label: "2010 → 2015", start: 2010, end: 2015 },
  { label: "2015 → 2020", start: 2015, end: 2020 },
  { label: "2018 → 2023", start: 2018, end: 2023 },
  { label: `${currentYear - 5} → ${currentYear}`, start: currentYear - 5, end: currentYear },
];

export function GamesSection() {
  // Bugünün Piyasa Özeti (deterministik, tarih tohumlu)
  const dailySummary = useMemo(() => {
    const dateSeed = new Date().toISOString().slice(0, 10);
    const seed = hashSeed(dateSeed);
    const picks: { ticker: string; change: number }[] = [];
    const used = new Set<number>();
    let i = 0;
    while (picks.length < 3 && i < 200) {
      const idx = (seed + i * 13) % popularStocks.length;
      if (!used.has(idx)) {
        used.add(idx);
        const ticker = popularStocks[idx];
        const change = Number((((hashSeed(ticker + dateSeed) % 1200) / 100) - 6).toFixed(2));
        picks.push({ ticker, change });
      }
      i += 1;
    }
    const tip = dailyTips[seed % dailyTips.length];
    return { picks, tip };
  }, []);

  // Regret
  const [scenarioId, setScenarioId] = useState(regretScenarios[0].id);
  const [customAmount, setCustomAmount] = useState<string>("");
  const regretResult = useMemo(() => {
    const scenario = regretScenarios.find((s) => s.id === scenarioId) || regretScenarios[0];
    const parsedCustom = Number(customAmount.replace(/[^\d]/g, ""));
    const base = parsedCustom > 0 ? parsedCustom : scenario.amount;
    const cur: "TL" | "USD" = scenario.currency === "USD" ? "USD" : "TL";
    const yearsCount = Math.max(1, currentYear - scenario.year);
    const calc = (a: "BIST100" | "GRAM_ALTIN" | "USD") => calculateReturn({ initial: base, currency: cur, startYear: scenario.year, endYear: currentYear, asset: a, drip: true, usCpiAdjusted: false }).finalNominal;
    const bistVal = calc("BIST100");
    const altinVal = calc("GRAM_ALTIN");
    const usdVal = calc("USD");
    const thyaoVal = bistVal * (1.1 + yearsCount * 0.02);
    // TL karşılığı baz (USD senaryoda pişmanlık skoru için TL'ye çevrilmiş baz gerekir)
    const baseTL = cur === "USD" ? calculateReturn({ initial: base, currency: cur, startYear: scenario.year, endYear: scenario.year, asset: "USD", drip: false, usCpiAdjusted: false }).finalNominal : base;
    const best = Math.max(bistVal, altinVal, usdVal, thyaoVal);
    const regretScore = Math.min(100, Math.max(0, Math.round(((best - baseTL) / baseTL) * 16)));
    const mkRow = (varlik: string, deger: number) => ({ varlik, deger, pct: ((deger / baseTL - 1) * 100) });
    return {
      scenario, base, baseTL, bestValue: best,
      rows: [
        mkRow("THYAO", thyaoVal),
        mkRow("BIST 100", bistVal),
        mkRow("Gram Altın", altinVal),
        mkRow("USD", usdVal),
      ],
      regretScore,
      line: regretScore > 75 ? "Pişmanlık seviyesi kritik: O dönemki harcama bugün büyük bir portföy fırsatını kaçırmış olabilir."
        : regretScore > 45 ? "Orta düzey pişmanlık: Fırsat maliyeti can yaksa da yeni planla toparlanabilir."
        : "Düşük pişmanlık: Harcama kararın hayat kalitesine değmiş olabilir.",
    };
  }, [scenarioId, customAmount]);
  const regretColor = regretResult.regretScore > 75 ? "#f43f5e" : regretResult.regretScore > 45 ? "#f59e0b" : "#10b981";

  // Duel
  const [duelStockA, setDuelStockA] = useState("THYAO");
  const [duelStockB, setDuelStockB] = useState("ASELS");
  const [duelPeriod, setDuelPeriod] = useState(3);
  const duelData = useMemo(() => {
    const points = duelPeriod * 12;
    const a = generateStockPath(duelStockA, points);
    const b = generateStockPath(duelStockB, points);
    return a.map((value, i) => ({ donem: i + 1, [duelStockA]: value, [duelStockB]: b[i] }));
  }, [duelStockA, duelStockB, duelPeriod]);
  const duelSummary = useMemo(() => {
    const first = duelData[0]; const last = duelData[duelData.length - 1];
    const aReturn = ((Number(last[duelStockA]) / Number(first[duelStockA]) - 1) * 100).toFixed(2);
    const bReturn = ((Number(last[duelStockB]) / Number(first[duelStockB]) - 1) * 100).toFixed(2);
    return { aReturn, bReturn, winnerStock: Number(aReturn) >= Number(bReturn) ? duelStockA : duelStockB };
  }, [duelData, duelStockA, duelStockB]);

  // Quiz
  const [quizHorizon, setQuizHorizon] = useState("3-5 yıl");
  const [quizRisk, setQuizRisk] = useState("Orta");
  const [quizExp, setQuizExp] = useState("Temel");
  const quizResult = useMemo(() => {
    let score = 0;
    score += quizHorizon === "1 yıldan kısa" ? 15 : quizHorizon === "1-3 yıl" ? 30 : quizHorizon === "3-5 yıl" ? 55 : 80;
    score += quizRisk === "Düşük" ? 15 : quizRisk === "Orta" ? 35 : 60;
    score += quizExp === "Yeni" ? 10 : quizExp === "Temel" ? 25 : 45;
    score = Math.min(100, score);
    if (score < 40) return { label: "Muhafazakâr", score, allocation: [{ ad: "Hisse", oran: 20 }, { ad: "Altın", oran: 30 }, { ad: "Döviz", oran: 15 }, { ad: "Mevduat", oran: 35 }], text: "Dalgalanmaya düşük toleransınız var. Sermaye koruma odaklı ilerlemek daha uygun." };
    if (score < 70) return { label: "Dengeli", score, allocation: [{ ad: "Hisse", oran: 40 }, { ad: "Altın", oran: 25 }, { ad: "Döviz", oran: 15 }, { ad: "Mevduat", oran: 20 }], text: "Getiri ve risk dengesini birlikte yönetebilen bir profile sahipsiniz." };
    return { label: "Agresif", score, allocation: [{ ad: "Hisse", oran: 60 }, { ad: "Altın", oran: 15 }, { ad: "Döviz", oran: 10 }, { ad: "Mevduat", oran: 15 }], text: "Uzun vadede yüksek dalgalanmayı tolere ederek büyüme odaklı hareket edebilirsiniz." };
  }, [quizHorizon, quizRisk, quizExp]);

  // OYUN 5 — Portföy Simülatörü
  const simStocks = SIM_STOCKS;
  const [alloc, setAlloc] = useState<number[]>([20, 20, 20, 20, 20]);
  const allocTotal = alloc.reduce((a, b) => a + b, 0);
  const setAllocAt = (i: number, v: number) => setAlloc((prev) => prev.map((x, idx) => (idx === i ? v : x)));
  const simResult = useMemo(() => {
    const capital = 100000;
    const monthly = Array.from({ length: 13 }, (_, month) => {
      let total = 0;
      simStocks.forEach((ticker, i) => {
        const weight = allocTotal ? alloc[i] / allocTotal : 0;
        const path = generateStockPath(ticker, 13);
        total += capital * weight * (path[month] / path[0]);
      });
      return { ay: month, deger: Number(total.toFixed(0)) };
    });
    const final = monthly[monthly.length - 1].deger;
    return { monthly, final, gainPct: ((final / capital - 1) * 100).toFixed(2) };
  }, [alloc, allocTotal, simStocks]);

  // OYUN 6 — Altın mı Dolar mı Borsa mı
  const [gdbPeriodIdx, setGdbPeriodIdx] = useState(2);
  const [gdbGuess, setGdbGuess] = useState<"Altın" | "Dolar" | "Borsa" | null>(null);
  const gdbResult = useMemo(() => {
    const p = gdbPeriods[gdbPeriodIdx];
    const factor = (series: { year: number; value: number }[]) => {
      const s = series.find((x) => x.year === p.start)?.value ?? series[0].value;
      const e = series.find((x) => x.year === p.end)?.value ?? series[series.length - 1].value;
      return (e / s - 1) * 100;
    };
    const items = [
      { ad: "Altın", getiri: factor(gramGoldSeries), color: "#f59e0b" },
      { ad: "Dolar", getiri: factor(usdTrySeries), color: "#38bdf8" },
      { ad: "Borsa", getiri: factor(bist100Series), color: "#10b981" },
    ].sort((a, b) => b.getiri - a.getiri);
    const maxAbs = Math.max(...items.map((x) => Math.abs(x.getiri)), 1);
    return { items, winner: items[0].ad, maxAbs };
  }, [gdbPeriodIdx]);

  return (
    <section className="section-card fade-in">
      <SectionTitle
        eyebrow="Viral Bölüm"
        title="Mini Oyunlar: Günlük Özet, Pişmanlık, Düello, Simülatör ve Yarış"
        description="Tamamı tarayıcı içinde çalışan, paylaşılabilir eğlenceli finans deneyimleri. Sonuçlar temsilidir, yatırım tavsiyesi değildir."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Bugünün Piyasa Özeti */}
        <div className="app-surface-2 app-border rounded-xl border p-3">
          <h3 className="app-text mb-2 text-lg font-semibold"><Sparkles className="mr-1 inline h-4 w-4 text-[var(--color-primary-light)]" />Bugünün Piyasa Özeti</h3>
          <p className="app-muted mb-3 text-xs">Her gün otomatik seçilen 3 hisse ve günün yatırım ipucu. Sonuçlar temsilidir.</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {dailySummary.picks.map((p) => (
              <Link key={p.ticker} href={`/varlik/${p.ticker}`} className="app-surface app-border rounded-xl border p-3 text-center transition hover:border-[var(--color-primary)]">
                <p className="app-text text-sm font-bold">{p.ticker}</p>
                <p className={`mt-1 text-sm font-semibold ${p.change >= 0 ? "text-bull" : "text-bear"}`}>{p.change >= 0 ? "+" : ""}%{formatNumber(p.change, 2)}</p>
                <p className="app-muted mt-1 text-[10px]">Detay için tıkla</p>
              </Link>
            ))}
          </div>
          <div className="app-surface app-border mt-3 rounded-xl border p-3">
            <p className="text-gold mb-1 text-xs font-semibold">💡 Günün İpucu</p>
            <p className="app-text-secondary text-xs">{dailySummary.tip}</p>
          </div>
        </div>

        {/* Regret */}
        <div className="app-surface-2 app-border rounded-xl border p-3">
          <h3 className="app-text mb-2 text-lg font-semibold">😭 Piyasa Pişmanlık Ölçeri</h3>
          <select value={scenarioId} onChange={(e) => { setScenarioId(e.target.value); setCustomAmount(""); }} className="app-surface app-border app-text mb-2 w-full rounded-lg border px-3 py-2 text-sm">
            {regretScenarios.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <label className="app-muted mb-3 block text-xs">Kendi tutarını gir ({regretResult.scenario.currency === "USD" ? "USD" : "₺"}) — boş bırakırsan senaryo tutarı kullanılır
            <input
              type="text"
              inputMode="numeric"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder={formatNumber(regretResult.scenario.amount, 0)}
              className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <div className="mb-2 flex items-center justify-center">
            <div className="regret-pulse" style={{ ["--pulse-color" as string]: regretColor }}>
              <ArcProgress value={regretResult.regretScore} color={regretColor} />
            </div>
          </div>
          <p className="app-text-secondary mb-2 text-center text-xs">{regretResult.line}</p>
          <div className="app-surface app-border overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[360px] text-left text-xs">
              <thead className="app-surface-3"><tr><th className="p-2">Varlık</th><th className="p-2">Bugünkü Değer</th><th className="p-2">Getiri</th></tr></thead>
              <tbody>
                {regretResult.rows.map((r) => (
                  <tr key={r.varlik} className="app-border border-t">
                    <td className="p-2 font-semibold">{r.varlik}</td>
                    <td className="p-2">{formatCurrency(r.deger)}</td>
                    <td className={`p-2 font-semibold ${r.pct >= 0 ? "text-bull" : "text-bear"}`}>{r.pct >= 0 ? "+" : ""}%{formatNumber(r.pct, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <ShareCard template="regret" title="Pişmanlık Ölçeri" subtitle={regretResult.scenario.label} highlight={{ label: "Pişmanlık Skoru", value: `${regretResult.regretScore}/100` }} metrics={[{ label: "Ayrılan tutar", value: formatCurrency(regretResult.baseTL) }, ...regretResult.rows.map((r) => ({ label: r.varlik, value: formatCurrency(r.deger) }))]} shareText="VeriAkış'da pişmanlık skorumu ölçtüm, sonuç şaşırtıcı çıktı." />
          </div>
        </div>

        {/* Duel */}
        <div className="app-surface-2 app-border rounded-xl border p-3">
          <h3 className="app-text mb-2 text-lg font-semibold"><Trophy className="text-gold mr-1 inline h-4 w-4" />Hisse Düellosu</h3>
          <div className="mb-2 grid grid-cols-3 gap-2 text-xs">
            <select value={duelStockA} onChange={(e) => setDuelStockA(e.target.value)} className="app-surface app-border app-text rounded-lg border px-2 py-2">{popularStocks.map((s) => <option key={s}>{s}</option>)}</select>
            <select value={duelStockB} onChange={(e) => setDuelStockB(e.target.value)} className="app-surface app-border app-text rounded-lg border px-2 py-2">{popularStocks.map((s) => <option key={s}>{s}</option>)}</select>
            <select value={duelPeriod} onChange={(e) => setDuelPeriod(Number(e.target.value))} className="app-surface app-border app-text rounded-lg border px-2 py-2">{duelPeriods.map((p) => <option key={p.years} value={p.years}>{p.label}</option>)}</select>
          </div>
          <OverlayLineChart data={duelData as Array<Record<string, number>>} keys={[duelStockA, duelStockB]} />
          <p className="app-text-secondary mt-2 text-xs">{duelStockA}: %{duelSummary.aReturn} · {duelStockB}: %{duelSummary.bReturn} · Kazanan: <strong className="text-bull">{duelSummary.winnerStock}</strong></p>
        </div>

        {/* Quiz */}
        <div className="app-surface-2 app-border rounded-xl border p-3">
          <h3 className="app-text mb-2 text-lg font-semibold"><ShieldCheck className="text-primary mr-1 inline h-4 w-4" />Risk Profili & Portföy Quiz</h3>
          <div className="space-y-2 text-xs">
            <label className="block">Yatırım ufku
              <select value={quizHorizon} onChange={(e) => setQuizHorizon(e.target.value)} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2"><option>1 yıldan kısa</option><option>1-3 yıl</option><option>3-5 yıl</option><option>5+ yıl</option></select>
            </label>
            <label className="block">Risk toleransı
              <select value={quizRisk} onChange={(e) => setQuizRisk(e.target.value)} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2"><option>Düşük</option><option>Orta</option><option>Yüksek</option></select>
            </label>
            <label className="block">Piyasa tecrübesi
              <select value={quizExp} onChange={(e) => setQuizExp(e.target.value)} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2"><option>Yeni</option><option>Temel</option><option>İleri</option></select>
            </label>
          </div>
          <p className="app-text-secondary mt-2 text-sm">Profil: <strong className="text-bull">{quizResult.label}</strong> · Risk Skoru: <strong>{quizResult.score}/100</strong></p>
          <p className="app-text-secondary text-xs">{quizResult.text}</p>
          <AllocationChart data={quizResult.allocation} />
        </div>

        {/* OYUN 5 — Portföy Simülatörü */}
        <div className="app-surface-2 app-border rounded-xl border p-3">
          <h3 className="app-text mb-2 text-lg font-semibold"><PieChart className="text-bull mr-1 inline h-4 w-4" />Portföy Simülatörü (100.000 ₺)</h3>
          <p className="app-muted mb-2 text-xs">5 BIST hissesine dağılımını ayarla, 12 aylık simülasyon sonucunu gör.</p>
          <div className="space-y-2">
            {simStocks.map((ticker, i) => (
              <div key={ticker} className="flex items-center gap-2 text-xs">
                <span className="w-14 font-semibold">{ticker}</span>
                <input type="range" min={0} max={100} value={alloc[i]} onChange={(e) => setAllocAt(i, Number(e.target.value))} className="flex-1" />
                <span className="w-10 text-right">%{alloc[i]}</span>
              </div>
            ))}
          </div>
          <p className={`mt-1 text-xs ${allocTotal === 100 ? "text-bull" : "text-gold"}`}>Toplam dağılım: %{allocTotal} {allocTotal !== 100 ? "(ideal %100)" : ""}</p>
          <div className="app-surface app-border mt-2 grid grid-cols-2 gap-2 rounded-lg border p-2 text-xs">
            <div>Başlangıç: <strong>{formatCurrency(100000)}</strong></div>
            <div>12. ay: <strong>{formatCurrency(simResult.final)}</strong></div>
            <div className="col-span-2">Getiri: <strong className={Number(simResult.gainPct) >= 0 ? "text-bull" : "text-bear"}>%{simResult.gainPct}</strong></div>
          </div>
          <OverlayLineChart data={simResult.monthly.map((m) => ({ year: m.ay, "Portföy Değeri": m.deger }))} keys={["Portföy Değeri"]} />
        </div>

        {/* OYUN 6 — Altın mı Dolar mı Borsa mı */}
        <div className="app-surface-2 app-border rounded-xl border p-3 lg:col-span-2">
          <h3 className="app-text mb-2 text-lg font-semibold"><Swords className="text-gold mr-1 inline h-4 w-4" />Altın mı, Dolar mı, Borsa mı?</h3>
          <p className="app-muted mb-2 text-xs">Seçili 5 yıllık dönemde hangisi kazandırdı? Tahminini yap, gerçek verilerle yarışı izle.</p>
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            {gdbPeriods.map((p, idx) => (
              <button key={p.label} onClick={() => { setGdbPeriodIdx(idx); setGdbGuess(null); }} className={`app-border rounded-full border px-3 py-1 ${gdbPeriodIdx === idx ? "border-[var(--color-gold)] text-gold" : "app-text-secondary"}`}>{p.label}</button>
            ))}
          </div>
          <div className="mb-3 flex gap-2">
            {(["Altın", "Dolar", "Borsa"] as const).map((g) => (
              <button key={g} onClick={() => setGdbGuess(g)} className={`flex-1 rounded-lg border px-3 py-2 text-sm ${gdbGuess === g ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-primary" : "app-border app-text-secondary"}`}>{g}</button>
            ))}
          </div>
          <div className="space-y-2">
            {gdbResult.items.map((item) => (
              <div key={item.ad}>
                <div className="mb-1 flex justify-between text-xs"><span className="font-semibold">{item.ad}</span><span>%{formatNumber(item.getiri, 0)}</span></div>
                <div className="app-surface-3 h-4 overflow-hidden rounded-full">
                  <div className="grow-bar h-full rounded-full" style={{ width: `${(Math.abs(item.getiri) / gdbResult.maxAbs) * 100}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
          {gdbGuess ? (
            <p className={`mt-3 text-sm ${gdbGuess === gdbResult.winner ? "text-bull" : "text-bear"}`}>
              {gdbGuess === gdbResult.winner ? `Tebrikler! ${gdbResult.winner} bu dönemde gerçekten kazandı. 🎉` : `Bu dönemde kazanan ${gdbResult.winner} oldu. Tahminin: ${gdbGuess}.`}
            </p>
          ) : <p className="app-muted mt-3 text-xs">Bir tahmin seç ve sonucu gör.</p>}
        </div>
      </div>
    </section>
  );
}
