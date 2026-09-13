"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Flame,
  Users,
  Vote,
  Sparkles,
  ShieldCheck,
  Trophy,
  Coins,
} from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRealtimeCommunity } from "@/hooks/useRealtimeCommunity";
import { portfolioBands, tickerTabs } from "@/data/demoRealtime";
import { AdSlot } from "@/components/AdSlot";
import { TradingViewAdvancedChart, TradingViewMiniOverview, TradingViewTape } from "@/components/TradingViewWidgets";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { assetList, calculateReturn, toAssetLabel } from "@/lib/finance";
import { bigMacSeries, dailyBasketSeries, gramGoldSeries, minimumWageSeries, quarterGoldSeries } from "@/data/historicalData";
import { popularStocks, scorecardData } from "@/data/scorecardData";
import { insiderTransactions } from "@/data/insiderData";
import { duelPeriods, regretScenarios, tarotDeck } from "@/data/gamesData";
import { ShareCard } from "@/components/ShareCard";

const OverlayLineChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.OverlayLineChart), { ssr: false });
const SimpleBarChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.SimpleBarChart), { ssr: false });
const InsiderFlowChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.InsiderFlowChart), { ssr: false });
const ScoreRadar = dynamic(() => import("@/components/ClientCharts").then((m) => m.ScoreRadar), { ssr: false });
const AllocationChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.AllocationChart), { ssr: false });

const years = Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) => 1980 + i);

const bandColor: Record<string, string> = {
  "%0-10": "bg-slate-700",
  "%10-20": "bg-sky-800",
  "%20-30": "bg-indigo-800",
  "%30-40": "bg-violet-800",
  "%40-50": "bg-emerald-800",
  "%50-75": "bg-amber-800",
  "%75-100": "bg-rose-800",
};

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

export default function HomePage() {
  const supabase = getSupabaseBrowserClient();
  const { quotes, tickerTape, demoMode: marketDemoMode, updatedAt } = useLiveQuotes();
  const community = useRealtimeCommunity(supabase);

  const [nickname, setNickname] = useState("BorsaMeraklısı");
  const [portfolioBand, setPortfolioBand] = useState<(typeof portfolioBands)[number]>("%10-20");
  const [commentBody, setCommentBody] = useState("");

  const [initialAmount, setInitialAmount] = useState(100000);
  const [currency, setCurrency] = useState<"TL" | "USD">("TL");
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [asset, setAsset] = useState<(typeof assetList)[number]>("BIST100");
  const [drip, setDrip] = useState(true);
  const [usCpiAdjusted, setUsCpiAdjusted] = useState(false);
  const [chartScale, setChartScale] = useState<"linear" | "log">("linear");

  const [selectedScoreStock, setSelectedScoreStock] = useState("THYAO");
  const [searchStock, setSearchStock] = useState("");

  const [insiderTickerFilter, setInsiderTickerFilter] = useState("Tümü");
  const [insiderTypeFilter, setInsiderTypeFilter] = useState<"Tümü" | "Alım" | "Satım" | "Geri Alım">("Tümü");

  const [powerYear, setPowerYear] = useState(2005);
  const [powerAmount, setPowerAmount] = useState(10000);

  const [ipoLot, setIpoLot] = useState(100);
  const [ipoPrice, setIpoPrice] = useState(25);
  const [tavanDays, setTavanDays] = useState(10);

  const [tarotMode, setTarotMode] = useState<"gunluk" | "serbest">("gunluk");
  const [tarotCards, setTarotCards] = useState<number[]>([0, 2, 4]);

  const [scenarioId, setScenarioId] = useState(regretScenarios[0].id);

  const [duelStockA, setDuelStockA] = useState("THYAO");
  const [duelStockB, setDuelStockB] = useState("ASELS");
  const [duelPeriod, setDuelPeriod] = useState(3);

  const [quizHorizon, setQuizHorizon] = useState("3-5 yıl");
  const [quizRisk, setQuizRisk] = useState("Orta");
  const [quizExp, setQuizExp] = useState("Temel");

  const [votedWeekly, setVotedWeekly] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("piyasalab-weekly-vote") || "";
  });

  const currentReturn = useMemo(
    () => calculateReturn({ initial: initialAmount, currency, startYear, endYear, asset, drip, usCpiAdjusted }),
    [initialAmount, currency, startYear, endYear, asset, drip, usCpiAdjusted],
  );

  const opportunitySet = useMemo(() => {
    return assetList.map((a) => {
      const res = calculateReturn({ initial: initialAmount, currency, startYear, endYear, asset: a, drip, usCpiAdjusted });
      return { asset: toAssetLabel(a), value: res.finalNominal, gain: res.gainPct };
    });
  }, [initialAmount, currency, startYear, endYear, drip, usCpiAdjusted]);

  const winner = opportunitySet.reduce((max, cur) => (cur.value > max.value ? cur : max), opportunitySet[0]);

  const overlayData = useMemo(() => {
    const selectedAssets = ["BIST100", "GRAM_ALTIN", "USD", "EUR", "MEVDUAT"] as const;
    const tracks = selectedAssets.map((a) => ({
      key: toAssetLabel(a),
      track: calculateReturn({ initial: initialAmount, currency, startYear, endYear, asset: a, drip, usCpiAdjusted: false }).yearlyTrack,
    }));

    return tracks[0].track.map((point, idx) => {
      const row: Record<string, number> = { year: point.year };
      tracks.forEach((t) => {
        row[t.key] = t.track[idx]?.value ?? 0;
      });
      return row;
    });
  }, [initialAmount, currency, startYear, endYear, drip]);

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
      (acc, tx) => {
        acc[tx.type] += tx.approxValue;
        return acc;
      },
      { Alım: 0, Satım: 0, "Geri Alım": 0 },
    );
    return [
      { tur: "Alım", tutar: sums.Alım },
      { tur: "Satım", tutar: sums.Satım },
      { tur: "Geri Alım", tutar: sums["Geri Alım"] },
    ];
  }, [filteredInsider]);

  const nowPower = useMemo(() => {
    const cpiPast = dailyBasketSeries.find((x) => x.year === powerYear)?.value || 1;
    const cpiNow = dailyBasketSeries[dailyBasketSeries.length - 1].value;
    return powerAmount * (cpiNow / cpiPast);
  }, [powerAmount, powerYear]);

  const nostalgia = useMemo(() => {
    const byYear = (series: { year: number; value: number }[]) => series.find((x) => x.year === powerYear)?.value || series[0].value;
    const byNow = (series: { year: number; value: number }[]) => series[series.length - 1].value;

    return {
      wagePast: powerAmount / byYear(minimumWageSeries),
      wageNow: nowPower / byNow(minimumWageSeries),
      quarterPast: powerAmount / byYear(quarterGoldSeries),
      quarterNow: nowPower / byNow(quarterGoldSeries),
      bigMacPast: powerAmount / byYear(bigMacSeries),
      bigMacNow: nowPower / byNow(bigMacSeries),
      gramPast: powerAmount / byYear(gramGoldSeries),
      gramNow: nowPower / byNow(gramGoldSeries),
    };
  }, [powerAmount, powerYear, nowPower]);

  const ipoResult = useMemo(() => {
    let price = ipoPrice;
    const rows = [{ gun: 0, fiyat: price, deger: price * ipoLot }];
    for (let i = 1; i <= tavanDays; i += 1) {
      price *= 1.1;
      rows.push({ gun: i, fiyat: Number(price.toFixed(2)), deger: Number((price * ipoLot).toFixed(2)) });
    }
    const finalValue = rows[rows.length - 1].deger;
    const startValue = ipoPrice * ipoLot;
    return {
      rows,
      finalValue,
      gain: ((finalValue / startValue - 1) * 100).toFixed(2),
      targetDays: (target: number) => Math.ceil(Math.log(target / ipoPrice) / Math.log(1.1)),
    };
  }, [ipoLot, ipoPrice, tavanDays]);

  const runTarot = () => {
    const dateSeed = new Date().toISOString().slice(0, 10);
    const visitor = localStorage.getItem("piyasalab-visitor") || crypto.randomUUID();
    localStorage.setItem("piyasalab-visitor", visitor);

    const seed = tarotMode === "gunluk" ? hashSeed(visitor + dateSeed) : Date.now();
    const used = new Set<number>();
    while (used.size < 3) {
      used.add((seed + used.size * 7 + Math.floor(Math.random() * tarotDeck.length)) % tarotDeck.length);
    }
    setTarotCards([...used]);
  };

  const regretResult = useMemo(() => {
    const scenario = regretScenarios.find((s) => s.id === scenarioId) || regretScenarios[0];
    const base = scenario.amount;
    const yearsCount = Math.max(1, new Date().getFullYear() - scenario.year);

    const bistVal = calculateReturn({
      initial: base,
      currency: "TL",
      startYear: scenario.year,
      endYear: new Date().getFullYear(),
      asset: "BIST100",
      drip: true,
      usCpiAdjusted: false,
    }).finalNominal;

    const altinVal = calculateReturn({
      initial: base,
      currency: "TL",
      startYear: scenario.year,
      endYear: new Date().getFullYear(),
      asset: "GRAM_ALTIN",
      drip: true,
      usCpiAdjusted: false,
    }).finalNominal;

    const usdVal = calculateReturn({
      initial: base,
      currency: "TL",
      startYear: scenario.year,
      endYear: new Date().getFullYear(),
      asset: "USD",
      drip: true,
      usCpiAdjusted: false,
    }).finalNominal;

    const thyaoVal = bistVal * (1.1 + yearsCount * 0.02);

    const best = Math.max(bistVal, altinVal, usdVal, thyaoVal);
    const regretScore = Math.min(100, Math.round(((best - base) / base) * 16));

    return {
      scenario,
      points: [
        { varlik: "THYAO", deger: Number(thyaoVal.toFixed(0)) },
        { varlik: "BIST 100", deger: Number(bistVal.toFixed(0)) },
        { varlik: "Gram Altın", deger: Number(altinVal.toFixed(0)) },
        { varlik: "USD", deger: Number(usdVal.toFixed(0)) },
      ],
      regretScore,
      line:
        regretScore > 75
          ? "Pişmanlık seviyesi kritik: O dönemki harcama bugün portföy mitingi kaçırmış olabilir."
          : regretScore > 45
            ? "Orta düzey pişmanlık: Fırsat maliyeti can yaksa da yeni planla toparlanabilir."
            : "Düşük pişmanlık: Harcama kararın hayat kalitesine değmiş olabilir.",
    };
  }, [scenarioId]);

  const duelData = useMemo(() => {
    const points = duelPeriod * 12;
    const a = generateStockPath(duelStockA, points);
    const b = generateStockPath(duelStockB, points);
    return a.map((value, i) => ({
      donem: i + 1,
      [duelStockA]: value,
      [duelStockB]: b[i],
    }));
  }, [duelStockA, duelStockB, duelPeriod]);

  const duelSummary = useMemo(() => {
    const first = duelData[0];
    const last = duelData[duelData.length - 1];
    const aReturn = ((Number(last[duelStockA]) / Number(first[duelStockA]) - 1) * 100).toFixed(2);
    const bReturn = ((Number(last[duelStockB]) / Number(first[duelStockB]) - 1) * 100).toFixed(2);
    const winnerStock = Number(aReturn) >= Number(bReturn) ? duelStockA : duelStockB;
    return { aReturn, bReturn, winnerStock };
  }, [duelData, duelStockA, duelStockB]);

  const quizResult = useMemo(() => {
    let score = 0;
    score += quizHorizon === "1 yıldan kısa" ? 15 : quizHorizon === "1-3 yıl" ? 30 : quizHorizon === "3-5 yıl" ? 55 : 80;
    score += quizRisk === "Düşük" ? 15 : quizRisk === "Orta" ? 35 : 60;
    score += quizExp === "Yeni" ? 10 : quizExp === "Temel" ? 25 : 45;
    score = Math.min(100, score);

    if (score < 40) {
      return {
        label: "Muhafazakâr",
        score,
        allocation: [
          { ad: "Hisse", oran: 20 },
          { ad: "Altın", oran: 30 },
          { ad: "Döviz", oran: 15 },
          { ad: "Mevduat", oran: 35 },
        ],
        text: "Dalgalanmaya düşük toleransınız var. Sermaye koruma odaklı ilerlemek daha uygun.",
      };
    }
    if (score < 70) {
      return {
        label: "Dengeli",
        score,
        allocation: [
          { ad: "Hisse", oran: 40 },
          { ad: "Altın", oran: 25 },
          { ad: "Döviz", oran: 15 },
          { ad: "Mevduat", oran: 20 },
        ],
        text: "Getiri ve risk dengesini birlikte yönetebilen bir profile sahipsiniz.",
      };
    }
    return {
      label: "Agresif",
      score,
      allocation: [
        { ad: "Hisse", oran: 60 },
        { ad: "Altın", oran: 15 },
        { ad: "Döviz", oran: 10 },
        { ad: "Mevduat", oran: 15 },
      ],
      text: "Uzun vadede yüksek dalgalanmayı tolere ederek büyüme odaklı hareket edebilirsiniz.",
    };
  }, [quizHorizon, quizRisk, quizExp]);

  const weeklyCountdown = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
    end.setHours(18, 0, 0, 0);
    const diff = Math.max(0, end.getTime() - now.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} saat ${mins} dakika`;
  }, []);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-3 pb-20 pt-3 sm:px-4 md:px-6">
      <header className="sticky top-0 z-40 mb-4 rounded-2xl border border-slate-800 bg-slate-950/95 p-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tight text-emerald-400 md:text-2xl">Piyasalab</h1>
          <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">piyasalab.com.tr</span>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto text-xs">
          {[
            ["#canli", "Canlı Akış"],
            ["#forum", "Forum"],
            ["#karnesi", "Hisse Karnesi"],
            ["#getiri", "Getiri Aracı"],
            ["#alim-gucu", "Alım Gücü"],
            ["#oyunlar", "Mini Oyunlar"],
            ["#seo-makale", "Finans Rehberi"],
          ].map(([href, text]) => (
            <a key={href} href={href} className="whitespace-nowrap rounded-full border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:border-emerald-400 hover:text-emerald-300">
              {text}
            </a>
          ))}
        </div>
      </header>

      <AdSlot label="Üst Leaderboard" width={728} height={90} className="mb-4" />

      <section id="canli" className="section-card mb-6">
        <SectionTitle eyebrow="Canlı Veri" title="Saniyelik Canlı Borsa ve Döviz Akışı" description="Veriler 3 saniye civarında güncellenir. Kaynak erişilemezse ekran demo veriyle boş kalmadan çalışmaya devam eder." />
        <div className="mb-3 rounded-xl border border-slate-800 bg-slate-900/80 p-2">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {tickerTape.map((q) => (
              <div key={q.code} className="min-w-[130px] rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs">
                <p className="font-semibold text-slate-200">{q.label}</p>
                <p className={`font-bold ${q.changePct >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{formatNumber(q.price)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {quotes.map((q) => (
            <article key={q.code} className={`rounded-xl border border-slate-800 bg-slate-950/80 p-3 ${q.direction === "up" ? "flash-up" : q.direction === "down" ? "flash-down" : ""}`}>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">{q.label}</h3>
                <span className={`text-xs ${q.changePct >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {q.changePct >= 0 ? <ArrowUpRight className="inline h-3 w-3" /> : <ArrowDownRight className="inline h-3 w-3" />} %{formatNumber(Math.abs(q.changePct), 2)}
                </span>
              </div>
              <p className="text-lg font-bold text-slate-50">{formatNumber(q.price)}</p>
              <p className="text-[11px] text-slate-400">{q.source}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2"><TradingViewTape /></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2"><TradingViewMiniOverview /></div>
        </div>
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-2"><TradingViewAdvancedChart /></div>

        <p className="mt-3 text-xs text-slate-400">
          Veriler bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Son güncelleme: {updatedAt ? new Date(updatedAt).toLocaleString("tr-TR") : "-"} · {marketDemoMode ? "Demo veri modu" : "Canlı kaynak"}
        </p>
      </section>

      <section id="forum" className="section-card mb-6">
        <SectionTitle eyebrow="Topluluk" title="Gerçek Zamanlı Forum, Anketler ve APE Sentiment" description="Supabase bağlantısı yoksa veya tablolar kurulmadıysa bölüm otomatik olarak demo modda devam eder." />
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-300"><Users className="mr-1 inline h-3 w-3" /> Şu an sitede: {community.onlineCount} kişi</span>
          {community.demoMode ? <span className="rounded-full border border-amber-700 bg-amber-900/30 px-3 py-1 text-amber-300">Demo mod</span> : <span className="rounded-full border border-emerald-700 bg-emerald-900/30 px-3 py-1 text-emerald-300">Canlı bağlı</span>}
        </div>

        <div className="mb-4 no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {tickerTabs.map((ticker) => (
            <button key={ticker} onClick={() => community.setActiveTicker(ticker)} className={`rounded-full border px-3 py-1 text-xs ${community.activeTicker === ticker ? "border-emerald-400 bg-emerald-600/20 text-emerald-300" : "border-slate-700 text-slate-300"}`}>
              #{ticker}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="grid gap-2 md:grid-cols-3">
                <input value={nickname} onChange={(e) => setNickname(e.target.value)} aria-label="Takma ad" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" placeholder="Takma ad" />
                <select value={portfolioBand} onChange={(e) => setPortfolioBand(e.target.value as (typeof portfolioBands)[number])} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm">
                  {portfolioBands.map((band) => <option key={band}>{band}</option>)}
                </select>
                <button
                  onClick={async () => {
                    if (!commentBody.trim()) return;
                    await community.postComment({ ticker: community.activeTicker, nickname: nickname || "Anonim", portfolioBand, body: commentBody });
                    setCommentBody("");
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold hover:bg-emerald-500"
                >Yorum Gönder</button>
              </div>
              <textarea value={commentBody} onChange={(e) => setCommentBody(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" placeholder={`#${community.activeTicker} için görüşünü yaz...`} />
            </div>

            <div className="max-h-[480px] space-y-2 overflow-auto pr-1">
              {community.tickerComments.map((comment) => {
                const rc = community.reactionCount.get(comment.id) || { rocket: 0, fire: 0, cry: 0 };
                return (
                  <article key={comment.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <strong>{comment.nickname}</strong>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] text-white ${bandColor[comment.portfolio_band] || "bg-slate-700"}`}>Portföy {comment.portfolio_band}</span>
                      <span className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleTimeString("tr-TR")}</span>
                    </div>
                    <p className="text-slate-200">{comment.body}</p>
                    <div className="mt-2 flex gap-2 text-xs">
                      <button onClick={() => community.reactComment(comment.id, "🚀")} className="rounded-full border border-slate-700 px-2 py-1 hover:border-emerald-400">🚀 {rc.rocket}</button>
                      <button onClick={() => community.reactComment(comment.id, "🔥")} className="rounded-full border border-slate-700 px-2 py-1 hover:border-amber-400">🔥 {rc.fire}</button>
                      <button onClick={() => community.reactComment(comment.id, "😭")} className="rounded-full border border-slate-700 px-2 py-1 hover:border-rose-400">😭 {rc.cry}</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <h3 className="mb-2 text-sm font-semibold"><Vote className="mr-1 inline h-4 w-4 text-emerald-300" />Boğa vs Ayı ({community.activeTicker})</h3>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <button onClick={() => community.castSentimentVote("boga", portfolioBand)} className="rounded-lg bg-emerald-700/70 px-3 py-2 text-sm">Boğa</button>
                <button onClick={() => community.castSentimentVote("ayi", portfolioBand)} className="rounded-lg bg-rose-700/70 px-3 py-2 text-sm">Ayı</button>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div style={{ width: `${community.tickerSentiment.bogaPct}%` }} className="h-full bg-emerald-500" />
              </div>
              <p className="mt-1 text-xs text-slate-300">Boğa %{formatNumber(community.tickerSentiment.bogaPct)} · Ayı %{formatNumber(100 - community.tickerSentiment.bogaPct)}</p>
              <p className="text-xs text-slate-400">Balina akışı: <strong className={community.tickerSentiment.dominant === "Boğa" ? "text-emerald-300" : "text-rose-300"}>{community.tickerSentiment.dominant} baskın</strong></p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <h3 className="mb-2 text-sm font-semibold"><Flame className="mr-1 inline h-4 w-4 text-orange-300" />Trending BIST Hype Index</h3>
              <ol className="space-y-1 text-sm">
                {community.hypeIndex.map((item, idx) => (
                  <li key={item.ticker} className="flex items-center justify-between rounded-lg border border-slate-800 px-2 py-1">
                    <span>#{idx + 1} {item.ticker}</span>
                    <span className="text-xs text-slate-300">Skor {item.score}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <h3 className="mb-2 text-sm font-semibold">{community.poll.question}</h3>
              {community.pollStats.byChoice.map((item) => (
                <button
                  key={item.option}
                  disabled={!!votedWeekly}
                  onClick={async () => {
                    await community.castPollVote(item.option);
                    localStorage.setItem("piyasalab-weekly-vote", item.option);
                    setVotedWeekly(item.option);
                  }}
                  className="mb-2 w-full rounded-lg border border-slate-700 p-2 text-left disabled:opacity-70"
                >
                  <div className="mb-1 flex items-center justify-between text-xs"><span>{item.option}</span><span>%{formatNumber(item.pct)}</span></div>
                  <div className="h-2 rounded-full bg-slate-800"><div style={{ width: `${item.pct}%` }} className="h-full rounded-full bg-sky-500" /></div>
                </button>
              ))}
              <p className="text-xs text-slate-400">Toplam oy: {community.pollStats.total} · Kapanışa: {weeklyCountdown}</p>
              {votedWeekly ? <p className="mt-1 text-xs text-emerald-300">Bu tarayıcıyla oy kullandınız: {votedWeekly}</p> : null}
            </div>
          </aside>
        </div>
      </section>

      <section id="karnesi" className="section-card mb-6">
        <SectionTitle eyebrow="Analiz" title="Hisse Karnesi & Patron/Insider Takibi" description="Karnedeki veriler temsili eğitim verisidir. Yatırım kararı için tek başına kullanılmamalıdır." />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              <input value={searchStock} onChange={(e) => setSearchStock(e.target.value)} placeholder="Hisse ara..." className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" />
              <select value={selectedScoreStock} onChange={(e) => setSelectedScoreStock(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm">
                {filteredStocks.map((stock) => <option key={stock}>{stock}</option>)}
              </select>
            </div>
            {selectedMetrics ? (
              <>
                <p className="mb-2 text-sm text-slate-300">{selectedMetrics.note}</p>
                <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-slate-800 p-2">F/K: <strong>{selectedMetrics.fk}</strong></div>
                  <div className="rounded-lg border border-slate-800 p-2">PD/DD: <strong>{selectedMetrics.pddd}</strong></div>
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
                      <div className="h-2 rounded-full bg-slate-800"><div style={{ width: `${Number(score) * 10}%` }} className="h-full rounded-full bg-emerald-500" /></div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 rounded-xl border border-slate-800 bg-slate-900 p-2 text-sm">Bileşik skor: <strong>{formatNumber(scoreAvg)}/10</strong> · Görünüm: <strong className={verdict === "güçlü" ? "text-emerald-300" : verdict === "orta" ? "text-amber-300" : "text-rose-300"}>{verdict}</strong></p>
                <ShareCard
                  title={`${selectedScoreStock} Hisse Karnesi`}
                  subtitle="Temsili skor özeti"
                  metrics={[
                    { label: "Bileşik Skor", value: `${formatNumber(scoreAvg)}/10` },
                    { label: "Görünüm", value: verdict.toUpperCase() },
                    { label: "F/K", value: String(selectedMetrics.fk) },
                    { label: "PD/DD", value: String(selectedMetrics.pddd) },
                  ]}
                  shareText={`${selectedScoreStock} için hisse karnesi skorumu Piyasalab'da çıkardım.`}
                />
              </>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <h3 className="mb-2 text-lg font-semibold">Patron / Insider Takibi</h3>
            <div className="mb-2 flex gap-2">
              <select value={insiderTickerFilter} onChange={(e) => setInsiderTickerFilter(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs">
                <option>Tümü</option>
                {[...new Set(insiderTransactions.map((x) => x.ticker))].map((t) => <option key={t}>{t}</option>)}
              </select>
              <select value={insiderTypeFilter} onChange={(e) => setInsiderTypeFilter(e.target.value as "Tümü" | "Alım" | "Satım" | "Geri Alım")} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs">
                <option>Tümü</option><option>Alım</option><option>Satım</option><option>Geri Alım</option>
              </select>
            </div>
            <InsiderFlowChart data={insiderFlow} />
            <div className="mt-2 max-h-[220px] space-y-2 overflow-auto pr-1 text-xs">
              {filteredInsider.map((tx) => (
                <article key={tx.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
                  <div className="mb-1 flex items-center justify-between"><strong>{tx.company} ({tx.ticker})</strong>
                    <span className={`rounded-full px-2 py-0.5 ${tx.type === "Alım" ? "bg-emerald-700/40 text-emerald-300" : tx.type === "Satım" ? "bg-rose-700/40 text-rose-300" : "bg-sky-700/40 text-sky-300"}`}>{tx.type}</span>
                  </div>
                  <p>{tx.actor} · {formatNumber(tx.shares, 0)} lot · ≈ {formatCurrency(tx.approxValue)}</p>
                  <p className="text-slate-400">{tx.date} · {tx.source}</p>
                </article>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">Not: Bu bölümdeki kayıtlar örnek/temsili veri olarak hazırlanmıştır.</p>
          </div>
        </div>
      </section>

      <section id="getiri" className="section-card mb-6">
        <SectionTitle eyebrow="Amiral Araç" title="Gelişmiş Getiri ve ABD-TÜFE Reel Kazanç Hesaplayıcı" description="Tüm hesaplamalar yalnızca tarayıcı içinde yapılır. Sunucuda ağır işleme yoktur." />
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs">Başlangıç tutarı
            <input type="number" value={initialAmount} onChange={(e) => setInitialAmount(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs">Para birimi
            <select value={currency} onChange={(e) => setCurrency(e.target.value as "TL" | "USD")} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"><option>TL</option><option>USD</option></select>
          </label>
          <label className="text-xs">Başlangıç yılı
            <select value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm">{years.map((y) => <option key={y}>{y}</option>)}</select>
          </label>
          <label className="text-xs">Bitiş yılı
            <select value={endYear} onChange={(e) => setEndYear(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm">{years.filter((y) => y >= startYear).map((y) => <option key={y}>{y}</option>)}</select>
          </label>
          <label className="text-xs md:col-span-2">Varlık
            <select value={asset} onChange={(e) => setAsset(e.target.value as (typeof assetList)[number])} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm">
              {assetList.map((a) => <option key={a} value={a}>{toAssetLabel(a)}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs md:col-span-1"><input type="checkbox" checked={drip} onChange={(e) => setDrip(e.target.checked)} /> Temettü Yeniden Yatırımı (DRIP)</label>
          <label className="flex items-center gap-2 text-xs md:col-span-1"><input type="checkbox" checked={usCpiAdjusted} onChange={(e) => setUsCpiAdjusted(e.target.checked)} /> ABD Doları Enflasyonundan Arındırılmış Reel Getiri</label>
        </div>

        <AdSlot label="Hesaplayıcı Altı Inline" width={300} height={250} className="my-4" />

        {currentReturn.message ? <p className="mb-3 rounded-lg border border-amber-700 bg-amber-900/20 p-3 text-sm text-amber-300">{currentReturn.message}</p> : null}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><p className="text-xs text-slate-400">Nihai nominal değer</p><p className="text-lg font-bold">{formatCurrency(currentReturn.finalNominal)}</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><p className="text-xs text-slate-400">Toplam getiri</p><p className={`text-lg font-bold ${currentReturn.gainPct >= 0 ? "text-emerald-300" : "text-rose-300"}`}>%{formatNumber(currentReturn.gainPct)}</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><p className="text-xs text-slate-400">CAGR</p><p className="text-lg font-bold">%{formatNumber(currentReturn.cagr)}</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><p className="text-xs text-slate-400">Reel değer (TL)</p><p className="text-lg font-bold">{formatCurrency(currentReturn.realTl)}</p></div>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><p className="text-xs text-slate-400">USD karşılığı</p><p className="text-lg font-bold">{formatCurrency(currentReturn.usdValue, "USD")}</p></div>
          {usCpiAdjusted ? <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><p className="text-xs text-slate-400">ABD TÜFE düzeltilmiş reel USD</p><p className="text-lg font-bold">{formatCurrency(currentReturn.realUsdAdjusted || 0, "USD")}</p><p className="text-xs text-slate-400">Nominal USD: {formatCurrency(currentReturn.nominalUsd || 0, "USD")}</p></div> : null}
        </div>

        <p className="mt-2 text-xs text-slate-400">DRIP açıkken temettüler her yıl tekrar ana pozisyona eklenir. Kapalıyken temettü nakit olarak ayrı birikir ({formatCurrency(currentReturn.dividendCash)}).</p>

        <div className="mt-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Çoklu Varlık Karşılaştırma Grafiği</h3>
          <button onClick={() => setChartScale((x) => (x === "linear" ? "log" : "linear"))} className="rounded-lg border border-slate-700 px-3 py-1 text-xs">{chartScale === "linear" ? "Log ölçeğe geç" : "Lineer ölçeğe geç"}</button>
        </div>
        <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <OverlayLineChart data={overlayData} keys={["BIST 100", "Gram Altın", "USD", "EUR", "TL Mevduat/PPF"]} logScale={chartScale === "log"} />
        </div>

        <h3 className="mt-4 text-lg font-semibold">Fırsat Maliyeti Karşılaştırması</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {opportunitySet.map((item) => (
            <article key={item.asset} className={`rounded-xl border p-3 ${item.asset === winner.asset ? "border-emerald-500 bg-emerald-900/15" : "border-slate-800 bg-slate-950/70"}`}>
              <p className="text-xs text-slate-400">{item.asset}</p>
              <p className="font-bold">{formatCurrency(item.value)}</p>
              <p className={`text-xs ${item.gain >= 0 ? "text-emerald-300" : "text-rose-300"}`}>%{formatNumber(item.gain)}</p>
            </article>
          ))}
        </div>

        <ShareCard
          title="Getiri Özeti"
          subtitle={`${startYear} → ${endYear} · ${toAssetLabel(asset)}`}
          metrics={[
            { label: "Nominal", value: formatCurrency(currentReturn.finalNominal) },
            { label: "Toplam Getiri", value: `%${formatNumber(currentReturn.gainPct)}` },
            { label: "CAGR", value: `%${formatNumber(currentReturn.cagr)}` },
            { label: "Reel TL", value: formatCurrency(currentReturn.realTl) },
          ]}
          shareText={`Piyasalab'da ${toAssetLabel(asset)} için getiri analizimi tamamladım.`}
        />

        <p className="mt-3 text-xs text-slate-400">Veri setleri yaklaşık/temsili olabilir. Bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.</p>
      </section>

      <section id="alim-gucu" className="section-card mb-6">
        <SectionTitle eyebrow="Simülatör" title="Alım Gücü, Nostalji ve Halka Arz Tavan Serisi" description="Geçmişteki satın alma gücünü bugüne taşır, gündelik ürün karşılıklarıyla anlaşılır hale getirir." />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <h3 className="mb-2 text-lg font-semibold"><Coins className="mr-1 inline h-4 w-4 text-amber-300" />Alım Gücü Hesaplayıcı</h3>
            <div className="mb-2 grid grid-cols-2 gap-2">
              <input type="number" value={powerAmount} onChange={(e) => setPowerAmount(Number(e.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" />
              <select value={powerYear} onChange={(e) => setPowerYear(Number(e.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm">{years.map((y) => <option key={y}>{y}</option>)}</select>
            </div>
            <p className="mb-2 rounded-lg border border-slate-800 bg-slate-900 p-2 text-sm">{powerYear} yılındaki {formatCurrency(powerAmount)} bugün yaklaşık <strong>{formatCurrency(nowPower)}</strong> satın alma gücüne denk gelir.</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-slate-800 p-2">Asgari ücret: {formatNumber(nostalgia.wagePast)} → {formatNumber(nostalgia.wageNow)}</div>
              <div className="rounded-lg border border-slate-800 p-2">Çeyrek altın: {formatNumber(nostalgia.quarterPast)} → {formatNumber(nostalgia.quarterNow)}</div>
              <div className="rounded-lg border border-slate-800 p-2">Big Mac: {formatNumber(nostalgia.bigMacPast)} → {formatNumber(nostalgia.bigMacNow)}</div>
              <div className="rounded-lg border border-slate-800 p-2">Gram altın: {formatNumber(nostalgia.gramPast)} → {formatNumber(nostalgia.gramNow)}</div>
            </div>
            <p className="mt-2 text-xs text-slate-400">Nostalji notu: O dönemde birikim yaparım dediğiniz para, bugün kahve + ulaşım + markette bambaşka bir hikâye yazıyor.</p>
            <SimpleBarChart
              data={[
                { etiket: `${powerYear} alım gücü`, deger: powerAmount },
                { etiket: "Bugünkü karşılık", deger: nowPower },
              ]}
              xKey="etiket"
              yKey="deger"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <h3 className="mb-2 text-lg font-semibold">Halka Arz (IPO) & Tavan Serisi</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <input type="number" value={ipoLot} onChange={(e) => setIpoLot(Number(e.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2" placeholder="Lot" />
              <input type="number" value={ipoPrice} onChange={(e) => setIpoPrice(Number(e.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2" placeholder="Fiyat" />
              <input type="number" value={tavanDays} onChange={(e) => setTavanDays(Number(e.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2" placeholder="Tavan gün" />
            </div>
            <p className="mt-2 text-sm">Final değer: <strong>{formatCurrency(ipoResult.finalValue)}</strong> · Toplam getiri: <strong className="text-emerald-300">%{ipoResult.gain}</strong></p>
            <p className="text-xs text-slate-400">Hedef fiyat örneği: {formatCurrency(100)} için yaklaşık {ipoResult.targetDays(100)} tavan günü gerekir.</p>
            <div className="mt-2 max-h-[220px] overflow-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900"><tr><th className="p-2">Gün</th><th className="p-2">Fiyat</th><th className="p-2">Portföy Değeri</th></tr></thead>
                <tbody>
                  {ipoResult.rows.map((row) => (
                    <tr key={row.gun} className="border-t border-slate-800"><td className="p-2">{row.gun}</td><td className="p-2">{formatCurrency(row.fiyat)}</td><td className="p-2">{formatCurrency(row.deger)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ShareCard
              title="IPO Tavan Serisi Sonucu"
              subtitle={`${ipoLot} lot · ${tavanDays} tavan günü`}
              metrics={[
                { label: "Başlangıç", value: formatCurrency(ipoLot * ipoPrice) },
                { label: "Final", value: formatCurrency(ipoResult.finalValue) },
                { label: "Toplam Getiri", value: `%${ipoResult.gain}` },
                { label: "Gün", value: String(tavanDays) },
              ]}
              shareText="Piyasalab IPO tavan serisi hesaplayıcısı ile senaryomu test ettim."
            />
          </div>
        </div>
      </section>

      <section id="oyunlar" className="section-card mb-6">
        <SectionTitle eyebrow="Viral Bölüm" title="Mini Oyunlar: Tarot, Pişmanlık, Düello ve Risk Quiz" description="Tamamı tarayıcı içinde çalışan, paylaşılabilir eğlenceli finans deneyimleri." />

        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <h3 className="mb-2 text-lg font-semibold"><Sparkles className="mr-1 inline h-4 w-4 text-fuchsia-300" />Borsa Tarot & Günlük Fal</h3>
            <div className="mb-2 flex gap-2 text-xs">
              <button onClick={() => setTarotMode("gunluk")} className={`rounded-lg border px-3 py-1 ${tarotMode === "gunluk" ? "border-emerald-400" : "border-slate-700"}`}>Günlük Fal</button>
              <button onClick={() => setTarotMode("serbest")} className={`rounded-lg border px-3 py-1 ${tarotMode === "serbest" ? "border-emerald-400" : "border-slate-700"}`}>Serbest Çekim</button>
              <button onClick={runTarot} className="rounded-lg bg-emerald-600 px-3 py-1">Karıştır & Aç</button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {tarotCards.map((idx, cardPos) => {
                const card = tarotDeck[idx];
                return (
                  <article key={`${idx}-${cardPos}`} className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs">
                    <p className={`mb-1 font-semibold ${card.effect === "pozitif" ? "text-emerald-300" : "text-rose-300"}`}>{card.title}</p>
                    <p className="text-slate-300">{card.text}</p>
                  </article>
                );
              })}
            </div>
            <ShareCard
              title="Günlük Borsa Falım"
              subtitle={tarotMode === "gunluk" ? "Günlük deterministik mod" : "Serbest mod"}
              metrics={tarotCards.map((idx) => ({ label: tarotDeck[idx].title, value: tarotDeck[idx].effect === "pozitif" ? "Pozitif" : "Negatif" }))}
              shareText="Piyasalab tarot bölümünde bugün kartlarımı açtım."
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <h3 className="mb-2 text-lg font-semibold">Piyasa Pişmanlık Ölçeri</h3>
            <select value={scenarioId} onChange={(e) => setScenarioId(e.target.value)} className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm">
              {regretScenarios.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <p className="mb-2 text-sm">Pişmanlık Skoru: <strong className="text-rose-300">{regretResult.regretScore}/100</strong></p>
            <p className="mb-2 text-xs text-slate-300">{regretResult.line}</p>
            <SimpleBarChart data={regretResult.points.map((p) => ({ varlik: p.varlik, deger: p.deger }))} xKey="varlik" yKey="deger" />
            <ShareCard
              title="Pişmanlık Ölçeri"
              subtitle={regretResult.scenario.label}
              metrics={[
                { label: "Skor", value: `${regretResult.regretScore}/100` },
                { label: "THYAO Senaryosu", value: formatCurrency(regretResult.points[0].deger) },
                { label: "BIST 100", value: formatCurrency(regretResult.points[1].deger) },
                { label: "Gram Altın", value: formatCurrency(regretResult.points[2].deger) },
              ]}
              shareText="Piyasalab'da pişmanlık skorumu ölçtüm, sonuç şaşırtıcı çıktı."
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <h3 className="mb-2 text-lg font-semibold"><Trophy className="mr-1 inline h-4 w-4 text-yellow-300" />Hisse Düellosu</h3>
            <div className="mb-2 grid grid-cols-3 gap-2 text-xs">
              <select value={duelStockA} onChange={(e) => setDuelStockA(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2">{popularStocks.map((s) => <option key={s}>{s}</option>)}</select>
              <select value={duelStockB} onChange={(e) => setDuelStockB(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2">{popularStocks.map((s) => <option key={s}>{s}</option>)}</select>
              <select value={duelPeriod} onChange={(e) => setDuelPeriod(Number(e.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2">{duelPeriods.map((p) => <option key={p.years} value={p.years}>{p.label}</option>)}</select>
            </div>
            <OverlayLineChart data={duelData as Array<Record<string, number>>} keys={[duelStockA, duelStockB]} />
            <p className="mt-2 text-xs">{duelStockA}: %{duelSummary.aReturn} · {duelStockB}: %{duelSummary.bReturn} · Kazanan: <strong className="text-emerald-300">{duelSummary.winnerStock}</strong></p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <h3 className="mb-2 text-lg font-semibold"><ShieldCheck className="mr-1 inline h-4 w-4 text-sky-300" />Quick Portfolio & Risk Score Quiz</h3>
            <div className="space-y-2 text-xs">
              <label className="block">Yatırım ufku
                <select value={quizHorizon} onChange={(e) => setQuizHorizon(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"><option>1 yıldan kısa</option><option>1-3 yıl</option><option>3-5 yıl</option><option>5+ yıl</option></select>
              </label>
              <label className="block">Risk toleransı
                <select value={quizRisk} onChange={(e) => setQuizRisk(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"><option>Düşük</option><option>Orta</option><option>Yüksek</option></select>
              </label>
              <label className="block">Piyasa tecrübesi
                <select value={quizExp} onChange={(e) => setQuizExp(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"><option>Yeni</option><option>Temel</option><option>İleri</option></select>
              </label>
            </div>
            <p className="mt-2 text-sm">Profil: <strong className="text-emerald-300">{quizResult.label}</strong> · Risk Skoru: <strong>{quizResult.score}/100</strong></p>
            <p className="text-xs text-slate-300">{quizResult.text}</p>
            <AllocationChart data={quizResult.allocation} />
          </div>
        </div>
      </section>

      <div className="mb-6 hidden lg:block">
        <AdSlot label="Yan Panel Banner" width={300} height={250} />
      </div>

      <section id="seo-makale" className="section-card">
        <h2 className="mb-4 text-2xl font-bold">Borsa İstanbul Getiri Hesaplama, Enflasyon ve Dolar Bazlı Reel Kazançlar</h2>
        <article className="space-y-4 text-sm leading-7 text-slate-200">
          <h3 className="text-lg font-semibold">Neden sadece nominal getiriye bakmak yanıltıcıdır?</h3>
          <p>
            Borsada bir yatırımın değerinin artması tek başına yeterli bir başarı ölçütü değildir. Çünkü yatırımcı için asıl önemli olan, parasının satın alma gücünü gerçekten artırıp artırmadığıdır. Nominal getiri, yalnızca rakamsal artışı gösterir; fakat arka plandaki enflasyon dinamiği hesaba katılmadığında ortaya eksik bir tablo çıkar. Örneğin bir yatırımın beş yılda %300 yükselmesi kulağa etkileyici gelebilir. Ancak aynı dönemde fiyatlar genel düzeyi de çok güçlü artmışsa, reel kazanç sanıldığından daha düşük olabilir. Piyasalab, bu farkı görünür kılmak için nominal ve reel sonuçları aynı ekran üzerinde sunar. Böylece kullanıcı yalnızca kaç lira oldu sorusuna değil, o para bugün gerçekten ne kadar güçlü sorusuna da net bir yanıt alır.
          </p>

          <h3 className="text-lg font-semibold">BIST 100 bileşik etkisi ve dönem seçiminin önemi</h3>
          <p>
            BIST 100 gibi endekslerde getiriyi değerlendirirken başlangıç yılı, yatırım süresi ve dalgalı dönemlerin dağılımı kritik rol oynar. Kısa dönemlerde sert yükseliş ya da düşüşler sonucu önemli ölçüde değiştirebilirken, daha uzun vadede bileşik getiri etkisi ön plana çıkar. Bileşik etki; kazancın da yeni kazanç üretmesiyle oluşur ve özellikle düzenli yatırım yapan kişiler için zamanla çarpan etkisi yaratır. Bu nedenle tek bir yılda ne oldu sorusundan çok, farklı dönemlerde nasıl bir profil oluşuyor yaklaşımı daha sağlıklıdır. Piyasalab’daki çoklu varlık grafiği, aynı başlangıç tutarının farklı araçlarda nasıl evrildiğini yıllara yayarak gösterir ve yatırımcının dönem etkisini daha şeffaf görmesini sağlar.
          </p>

          <h3 className="text-lg font-semibold">TÜFE ile enflasyon düzeltmesi nasıl okunmalı?</h3>
          <p>
            Enflasyon düzeltmesi yapılırken genellikle TÜFE endeksinin başlangıç ve bitiş dönemleri karşılaştırılır. Bu yöntemle geçmişteki bir tutarın bugünkü alım gücü karşılığı hesaplanabilir. Pratikte bu yaklaşım, yatırım getirilerinin reel analizinde güçlü bir referans sağlar. Ancak unutulmaması gereken önemli nokta, herkesin kişisel enflasyonunun farklı olduğudur. Örneğin kira ağırlığı yüksek bir bütçe ile gıda ağırlığı yüksek bir bütçenin hissedilen enflasyonu aynı olmayabilir. Dolayısıyla TÜFE, birebir kişisel yaşam maliyetini değil, genel fiyat seviyesini temsil eder. Piyasalab bu farkı açıkça belirterek kullanıcıyı bilinçli karar almaya yönlendirir ve verilerin bilgilendirme amaçlı olduğunu vurgular.
          </p>

          <h3 className="text-lg font-semibold">Dolar bazlı reel getiri neden ayrıca izlenir?</h3>
          <p>
            Yerel para birimiyle yüksek görünen bir performans, uluslararası ölçekte aynı güçte olmayabilir. Bu yüzden yatırımcılar zaman zaman sonuçları USD bazında inceler. Ancak yalnızca kur çevrimi yapmak da tam bir reel analiz sayılmaz; çünkü doların kendi enflasyonu da zaman içinde satın alma gücünü etkiler. ABD TÜFE ile düzeltilmiş reel USD getirisi, yatırımın küresel referansla ne kadar değer ürettiğini anlamak için daha doğru bir çerçeve sunar. Özellikle uzun vadeli birikim planlayanlar için bu metrik, yerelde kazanç var ama küreselde değer korunuyor mu sorusunu cevaplar. Piyasalab’daki ABD TÜFE anahtarı, nominal USD sonucu ve enflasyondan arındırılmış USD sonucu yan yana göstererek bu farkı görünür hale getirir.
          </p>

          <h3 className="text-lg font-semibold">DRIP (Temettü Yeniden Yatırımı) etkisi</h3>
          <p>
            Temettü ödeyen hisselerde uzun vadeli performansı belirleyen unsurlardan biri de temettünün nasıl değerlendirildiğidir. DRIP açık olduğunda, alınan temettü tekrar varlığa yatırılır ve ana pozisyon büyür. Bu da zaman içinde bileşik getiriyi anlamlı ölçüde artırabilir. DRIP kapalı olduğunda ise temettü nakit olarak ayrı birikir; bu yaklaşım daha muhafazakâr bir görüntü verir ve nakit akışını izlemeyi kolaylaştırır. Hangi yöntemin uygun olduğu yatırımcının hedeflerine bağlıdır: büyüme odaklı yaklaşımda DRIP sıklıkla avantaj sağlar, düzenli nakit akışı isteyen yatırımcı içinse temettünün ayrı tutulması tercih edilebilir. Piyasalab iki senaryoyu da aynı model içinde karşılaştırılabilir şekilde sunar.
          </p>

          <h3 className="text-lg font-semibold">Tavan serisi hesaplaması: heyecan ve gerçeklik</h3>
          <p>
            Halka arz dönemlerinde en çok konuşulan konulardan biri art arda tavan günleriyle oluşan teorik getirilerdir. Matematiksel olarak %10’luk günlük artışın bileşik etkisi kısa sürede çarpıcı seviyelere ulaşabilir. Ancak gerçek piyasada likidite koşulları, emir derinliği, lot dağılımı, tavan bozulma riski ve yatırımcı davranışı sonucu ciddi şekilde değiştirebilir. Bu nedenle tavan serisi hesaplayıcıları bir olasılık laboratuvarı olarak görülmelidir; kesin sonuç üretmez. Piyasalab bu aracı eğitim odaklı bir simülasyon olarak konumlandırır ve gün gün tabloyla kullanıcıya bileşik matematiğin nasıl işlediğini anlatır. Böylece heyecan odaklı söylemler yerine sayısal farkındalık gelişir.
          </p>

          <h3 className="text-lg font-semibold">Alım gücü simülatörü neden önemlidir?</h3>
          <p>
            Finansal planlama yalnızca yatırım getirisiyle değil, yaşam maliyetindeki dönüşümle birlikte düşünülmelidir. Geçmişteki bir tutarın bugünkü karşılığını görmek, bireysel bütçe kararlarında güçlü bir içgörü sağlar. Asgari ücret, çeyrek altın, Big Mac ya da günlük sepet gibi somut karşılıklar, soyut enflasyon kavramını günlük hayata taşır. Özellikle genç yatırımcılar için bu yaklaşım paranın zaman değeri kavramını daha anlaşılır kılar. Piyasalab’ın nostalji simülatörü bu nedenle sadece eğlenceli bir bölüm değil, aynı zamanda davranışsal finans açısından öğretici bir araçtır. Kullanıcı geçmişe bakarak bugünkü tüketim ve birikim dengesini daha bilinçli kurabilir.
          </p>

          <h3 className="text-lg font-semibold">Forum, sentiment ve hype göstergeleri nasıl kullanılmalı?</h3>
          <p>
            Topluluk verisi yatırım kararlarında destekleyici bir sinyal olabilir; ancak tek başına yeterli değildir. Forum mesaj yoğunluğu, emoji reaksiyonları, boğa/ayı oyları ve hype skorları piyasadaki duygu durumunu yansıtır. Bu sinyaller kısa vadeli volatiliteyi tahmin etmede yardımcı olabilir, fakat temel analiz ve risk yönetimi olmadan kullanıldığında yanıltıcı sonuçlara da yol açabilir. Piyasalab’da sentiment bölümü özellikle kalabalığın yönünü göstermek için tasarlanmıştır; nihai karar mekanizması olarak sunulmaz. En sağlıklı yaklaşım, bu topluluk sinyallerini bilanço, değerleme ve makro görünümle birlikte çok katmanlı bir analiz içinde değerlendirmektir.
          </p>

          <h3 className="text-lg font-semibold">Sık sorulan sorular (FAQ)</h3>
          <ol className="list-decimal space-y-2 pl-5">
            <li><strong>BIST verisi neden 1986 sonrası?</strong> Çünkü BIST 100 endeks serisi bu dönemden itibaren düzenli referans sunar; daha eski dönemler için doğrudan karşılaştırma sınırlıdır.</li>
            <li><strong>Reel getiri negatif çıkarsa ne anlama gelir?</strong> Nominal kazanç olsa bile enflasyon etkisi nedeniyle satın alma gücü artmamış olabilir.</li>
            <li><strong>DRIP kapalıyken temettü nereye gider?</strong> Sistem temettüyü nakit birikim olarak ayrı izler ve toplam tabloda ayrıca gösterir.</li>
            <li><strong>USD reel hesapta ABD TÜFE neden kullanılır?</strong> Doların kendi enflasyonunu temizleyerek uluslararası alım gücü etkisini daha doğru görmek için.</li>
            <li><strong>Tavan serisi sonucu kesin mi?</strong> Hayır. Bu araç, teorik bileşik artış simülasyonu sağlar; piyasa koşulları sonucu değiştirebilir.</li>
            <li><strong>Forum verisi yatırım tavsiyesi midir?</strong> Değildir. Topluluk duyarlılığı göstergesi olarak değerlendirilmelidir.</li>
          </ol>

          <p>
            Sonuç olarak sağlıklı bir yatırım değerlendirmesi; nominal getiri, reel getiri, döviz bazlı kıyas, enflasyon etkisi, temettü yaklaşımı ve davranışsal göstergeleri birlikte okumayı gerektirir. Piyasalab bu çok katmanlı yaklaşımı tek bir ekranda birleştirerek kullanıcının hem analitik hem pratik karar sürecini desteklemeyi amaçlar. Buradaki tüm araçlar bilgilendirme odaklıdır ve kişiye özel yatırım danışmanlığı yerine geçmez. Nihai yatırım kararlarında risk profili, likidite ihtiyacı ve profesyonel görüş birlikte değerlendirilmelidir.
          </p>
        </article>
      </section>
    </main>
  );
}
