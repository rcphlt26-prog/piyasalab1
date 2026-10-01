"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { Coins, Sparkles } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ShareCard } from "@/components/ShareCard";
import { LiveCurrencyConverter } from "@/components/LiveCurrencyConverter";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { assetList, calculateReturn, toAssetLabel, type CurrencyCode } from "@/lib/finance";
import { bigMacSeries, dailyBasketSeries, gramGoldSeries, minimumWageSeries, quarterGoldSeries, breadSeries, milkSeries } from "@/data/historicalData";
import { CalculatorGuideText } from "@/components/FinancialGuideText";

const OverlayLineChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.OverlayLineChart), { ssr: false });
const SimpleBarChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.SimpleBarChart), { ssr: false });

const years = Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) => 1980 + i);
const currencies: Array<{ code: CurrencyCode; label: string }> = [
  { code: "TL", label: "Türk Lirası (TRY)" }, { code: "USD", label: "ABD Doları (USD)" },
  { code: "EUR", label: "Euro (EUR)" }, { code: "GBP", label: "İngiliz Sterlini (GBP)" },
  { code: "CHF", label: "İsviçre Frangı (CHF)" }, { code: "JPY", label: "Japon Yeni (JPY)" },
  { code: "CAD", label: "Kanada Doları (CAD)" }, { code: "AUD", label: "Avustralya Doları (AUD)" },
  { code: "RUB", label: "Rus Rublesi (RUB)" }, { code: "SAR", label: "Suudi Riyali (SAR)" },
  { code: "CNY", label: "Çin Yuanı (CNY)" }, { code: "SEK", label: "İsveç Kronu (SEK)" },
  { code: "NOK", label: "Norveç Kronu (NOK)" }, { code: "DKK", label: "Danimarka Kronu (DKK)" },
  { code: "PLN", label: "Polonya Zlotisi (PLN)" }, { code: "AED", label: "BAE Dirhemi (AED)" },
  { code: "KWD", label: "Kuveyt Dinarı (KWD)" }, { code: "QAR", label: "Katar Riyali (QAR)" },
  { code: "KRW", label: "Güney Kore Wonu (KRW)" }, { code: "INR", label: "Hindistan Rupisi (INR)" },
];

const quickAssets: Array<{ asset: (typeof assetList)[number]; label: string; amount: number }> = [
  { asset: "BIST100", label: "BIST 100", amount: 100000 },
  { asset: "GRAM_ALTIN", label: "Gram Altın", amount: 50000 },
  { asset: "USD", label: "Dolar", amount: 50000 },
  { asset: "MEVDUAT", label: "Mevduat", amount: 100000 },
];

type CalculationInput = {
  initial: number;
  currency: CurrencyCode;
  startYear: number;
  endYear: number;
  asset: (typeof assetList)[number];
  drip: boolean;
  usCpiAdjusted: boolean;
};

export function CalculatorSection() {
  const [initialAmount, setInitialAmount] = useState(100000);
  const [currency, setCurrency] = useState<CurrencyCode>("TL");
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [asset, setAsset] = useState<(typeof assetList)[number]>("BIST100");
  const [drip, setDrip] = useState(true);
  const [usCpiAdjusted, setUsCpiAdjusted] = useState(false);
  const [chartScale, setChartScale] = useState<"linear" | "log">("linear");
  const resultsRef = useRef<HTMLDivElement>(null);

  const [powerYear, setPowerYear] = useState(2005);
  const [powerAmount, setPowerAmount] = useState(10000);
  const [submittedInput, setSubmittedInput] = useState<CalculationInput>({
    initial: 100000, currency: "TL", startYear: 2015, endYear: new Date().getFullYear(), asset: "BIST100", drip: true, usCpiAdjusted: false,
  });

  const currentReturn = useMemo(
    () => calculateReturn(submittedInput),
    [submittedInput],
  );

  const opportunitySet = useMemo(() => assetList.map((a) => {
    const res = calculateReturn({ ...submittedInput, asset: a });
    return { asset: toAssetLabel(a), value: res.finalNominal, gain: res.gainPct };
  }), [submittedInput]);

  const winner = opportunitySet.reduce((max, cur) => (cur.value > max.value ? cur : max), opportunitySet[0]);

  const overlayData = useMemo(() => {
    const selectedAssets = ["BIST100", "GRAM_ALTIN", "USD", "EUR", "MEVDUAT"] as const;
    const tracks = selectedAssets.map((a) => ({
      key: toAssetLabel(a),
      track: calculateReturn({ initial: initialAmount, currency, startYear, endYear, asset: a, drip, usCpiAdjusted: false }).yearlyTrack,
    }));
    return tracks[0].track.map((point, idx) => {
      const row: Record<string, number> = { year: point.year };
      tracks.forEach((t) => { row[t.key] = t.track[idx]?.value ?? 0; });
      return row;
    });
  }, [initialAmount, currency, startYear, endYear, drip]);

  const nowPower = useMemo(() => {
    const cpiPast = dailyBasketSeries.find((x) => x.year === powerYear)?.value || 1;
    const cpiNow = dailyBasketSeries[dailyBasketSeries.length - 1].value;
    return powerAmount * (cpiNow / cpiPast);
  }, [powerAmount, powerYear]);

  const nostalgia = useMemo(() => {
    const byYear = (series: { year: number; value: number }[] | undefined) => series?.find((x) => x.year === powerYear)?.value || series?.[0]?.value || 1;
    const byNow = (series: { year: number; value: number }[] | undefined) => series?.[series.length - 1]?.value || 1;
    return {
      wagePast: powerAmount / byYear(minimumWageSeries), wageNow: nowPower / byNow(minimumWageSeries),
      quarterPast: powerAmount / byYear(quarterGoldSeries), quarterNow: nowPower / byNow(quarterGoldSeries),
      bigMacPast: powerAmount / byYear(bigMacSeries), bigMacNow: nowPower / byNow(bigMacSeries),
      gramPast: powerAmount / byYear(gramGoldSeries), gramNow: nowPower / byNow(gramGoldSeries),
      breadPast: powerAmount / byYear(breadSeries), breadNow: nowPower / byNow(breadSeries),
      milkPast: powerAmount / byYear(milkSeries), milkNow: nowPower / byNow(milkSeries),
    };
  }, [powerAmount, powerYear, nowPower]);

  function focusResults() {
    setSubmittedInput({ initial: initialAmount, currency, startYear, endYear, asset, drip, usCpiAdjusted });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="section-card fade-in">
      <SectionTitle
        eyebrow="Amiral Araç"
        title="Paran bugün ne kadar olurdu?"
        description="Bir tutar seç, geçmişteki karşılığını saniyeler içinde gör. Detaylı seçenekler aşağıda."
      />
      
      <div className="mb-4 rounded-2xl border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/15 via-[var(--surface-2)] to-[var(--color-bull)]/10 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white"><Sparkles className="h-4 w-4" /></span>
          <div>
            <p className="app-text text-sm font-bold">Hızlı başlangıç</p>
            <p className="app-muted text-xs">Merak ettiğin yatırımı seç, rakamları birlikte dolduralım.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickAssets.map((item) => (
            <button
              key={item.asset}
              type="button"
              onClick={() => {
                setAsset(item.asset);
                setInitialAmount(item.amount);
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${asset === item.asset ? "border-transparent bg-[var(--color-primary)] text-white" : "app-border app-surface app-text-secondary hover:border-[var(--color-primary-light)]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="app-surface-2 app-border mb-4 rounded-xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="app-text text-sm font-semibold">Hesabını oluştur</h3>
          <span className="app-muted text-[11px]">Tahmini simülasyon</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="app-text-secondary text-xs">Başlangıç tutarı
            <input type="number" value={initialAmount} onChange={(e) => setInitialAmount(Number(e.target.value))} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none" />
          </label>
          <label className="app-text-secondary text-xs">Para birimi
            <select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none">{currencies.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select>
          </label>
          <label className="app-text-secondary text-xs">Başlangıç yılı
            <select value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none">{years.map((y) => <option key={y}>{y}</option>)}</select>
          </label>
          <label className="app-text-secondary text-xs">Bitiş yılı
            <select value={endYear} onChange={(e) => setEndYear(Number(e.target.value))} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none">{years.filter((y) => y >= startYear).map((y) => <option key={y}>{y}</option>)}</select>
          </label>
          <label className="app-text-secondary text-xs md:col-span-2">Varlık
            <select value={asset} onChange={(e) => setAsset(e.target.value as (typeof assetList)[number])} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none">
              {assetList.map((a) => <option key={a} value={a}>{toAssetLabel(a)}</option>)}
            </select>
          </label>
          <div className="flex flex-col justify-end gap-1.5 md:col-span-2">
            <label className="app-text-secondary flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={drip} onChange={(e) => setDrip(e.target.checked)} className="rounded" /> Temettü Yeniden Yatırımı (DRIP)
            </label>
            <label className="app-text-secondary flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={usCpiAdjusted} onChange={(e) => setUsCpiAdjusted(e.target.checked)} className="rounded" /> ABD Doları Enflasyonundan Arındırılmış Reel Getiri
            </label>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button 
            type="button" 
            onClick={focusResults} 
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Sonucu gör
          </button>
        </div>
      </div>

      <LiveCurrencyConverter />

      {currentReturn.message ? <p className="mb-3 rounded-lg border border-[var(--color-gold)] bg-[var(--color-gold)]/10 p-3 text-sm text-gold">{currentReturn.message}</p> : null}
      <div ref={resultsRef} className="scroll-mt-24 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Nihai nominal değer</p><p className="app-text text-lg font-bold">{formatCurrency(currentReturn.finalNominal)}</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Toplam getiri</p><p className={`text-lg font-bold ${currentReturn.gainPct >= 0 ? "text-bull" : "text-bear"}`}>%{formatNumber(currentReturn.gainPct)}</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">CAGR</p><p className="app-text text-lg font-bold">%{formatNumber(currentReturn.cagr)}</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Reel değer (TL)</p><p className="app-text text-lg font-bold">{formatCurrency(currentReturn.realTl)}</p></div>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">USD karşılığı</p><p className="app-text text-lg font-bold">{formatCurrency(currentReturn.usdValue, "USD")}</p></div>
        {usCpiAdjusted ? <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">ABD TÜFE düzeltilmiş reel USD</p><p className="app-text text-lg font-bold">{formatCurrency(currentReturn.realUsdAdjusted || 0, "USD")}</p><p className="app-muted text-xs">Nominal USD: {formatCurrency(currentReturn.nominalUsd || 0, "USD")}</p></div> : null}
      </div>

      <p className="app-muted mt-2 text-xs">DRIP açıkken temettüler her yıl tekrar ana pozisyona eklenir. Kapalıyken temettü nakit olarak ayrı birikir ({formatCurrency(currentReturn.dividendCash)}).</p>

      <div className="mt-4 flex items-center justify-between">
        <h3 className="app-text text-lg font-semibold">Çoklu Varlık Karşılaştırma Grafiği</h3>
        <button onClick={() => setChartScale((x) => (x === "linear" ? "log" : "linear"))} className="app-border app-text rounded-lg border px-3 py-1 text-xs">{chartScale === "linear" ? "Log ölçeğe geç" : "Lineer ölçeğe geç"}</button>
      </div>
      <div className="app-surface-2 app-border mt-2 rounded-xl border p-3">
        <OverlayLineChart data={overlayData} keys={["BIST 100", "Gram Altın", "USD", "EUR", "TL Mevduat/PPF"]} logScale={chartScale === "log"} />
      </div>

      <h3 className="app-text mt-4 text-lg font-semibold">Fırsat Maliyeti Karşılaştırması</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {opportunitySet.map((item) => (
          <article key={item.asset} className={`rounded-xl border p-3 ${item.asset === winner.asset ? "border-[var(--color-bull)] bg-[var(--color-bull)]/10" : "app-surface-2 app-border"}`}>
            <p className="app-muted text-xs">{item.asset}</p>
            <p className="app-text font-bold">{formatCurrency(item.value)}</p>
            <p className={`text-xs ${item.gain >= 0 ? "text-bull" : "text-bear"}`}>%{formatNumber(item.gain)}</p>
          </article>
        ))}
      </div>

      <div className="mt-4">
        <ShareCard
          template="getiri"
          title="Getiri Özeti"
          subtitle={`${startYear} → ${endYear} · ${toAssetLabel(asset)}`}
          highlight={{ label: "Toplam Getiri", value: `%${formatNumber(currentReturn.gainPct)}` }}
          metrics={[
            { label: "Nominal", value: formatCurrency(currentReturn.finalNominal) },
            { label: "CAGR", value: `%${formatNumber(currentReturn.cagr)}` },
            { label: "Reel TL", value: formatCurrency(currentReturn.realTl) },
            { label: "USD", value: formatCurrency(currentReturn.usdValue, "USD") },
          ]}
          shareText={`VeriAkış'da ${toAssetLabel(asset)} için getiri analizimi tamamladım.`}
        />
      </div>

      <p className="mt-3 rounded-lg border border-[var(--color-gold)] bg-[var(--color-gold)]/10 p-2 text-xs text-gold">
        Hesaplama sonuçları tahmini olup yatırım tavsiyesi değildir.
      </p>

      {/* Alım Gücü & Ekmek/Süt/Temel İhtiyaç Karşılaştırması */}
      <div className="app-surface-2 app-border mt-6 rounded-xl border p-3">
        <h3 className="app-text mb-2 text-lg font-semibold"><Coins className="text-gold mr-1 inline h-4 w-4" />Alım Gücü & Temel Gıda Simülatörü</h3>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <input type="number" value={powerAmount} onChange={(e) => setPowerAmount(Number(e.target.value))} className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm" />
          <select value={powerYear} onChange={(e) => setPowerYear(Number(e.target.value))} className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm">{years.map((y) => <option key={y}>{y}</option>)}</select>
        </div>
        <p className="app-surface app-border mb-2 rounded-lg border p-2 text-sm">{powerYear} yılındaki {formatCurrency(powerAmount)} bugün yaklaşık <strong>{formatCurrency(nowPower)}</strong> satın alma gücüne denk gelir.</p>
        
        {/* Ekmek, Süt ve diğer temel gıda/ihtiyaç karşılaştırmaları */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
          <div className="app-border rounded-lg border p-2.5">
            <span className="app-muted block mb-0.5">🍞 Ekmek</span>
            <span className="font-bold text-sm">{formatNumber(nostalgia.breadPast, 0)} → {formatNumber(nostalgia.breadNow, 0)} adet</span>
          </div>
          <div className="app-border rounded-lg border p-2.5">
            <span className="app-muted block mb-0.5">🥛 1L Süt</span>
            <span className="font-bold text-sm">{formatNumber(nostalgia.milkPast, 0)} → {formatNumber(nostalgia.milkNow, 0)} litre</span>
          </div>
          <div className="app-border rounded-lg border p-2.5">
            <span className="app-muted block mb-0.5">👷 Asgari Ücret</span>
            <span className="font-bold text-sm">{formatNumber(nostalgia.wagePast, 1)} → {formatNumber(nostalgia.wageNow, 1)} adet</span>
          </div>
          <div className="app-border rounded-lg border p-2.5">
            <span className="app-muted block mb-0.5">🥇 Çeyrek Altın</span>
            <span className="font-bold text-sm">{formatNumber(nostalgia.quarterPast, 1)} → {formatNumber(nostalgia.quarterNow, 1)} adet</span>
          </div>
          <div className="app-border rounded-lg border p-2.5">
            <span className="app-muted block mb-0.5">🍔 Big Mac</span>
            <span className="font-bold text-sm">{formatNumber(nostalgia.bigMacPast, 0)} → {formatNumber(nostalgia.bigMacNow, 0)} adet</span>
          </div>
          <div className="app-border rounded-lg border p-2.5">
            <span className="app-muted block mb-0.5">✨ Gram Altın</span>
            <span className="font-bold text-sm">{formatNumber(nostalgia.gramPast, 1)} → {formatNumber(nostalgia.gramNow, 1)} gram</span>
          </div>
        </div>
        <SimpleBarChart data={[{ etiket: `${powerYear} alım gücü`, deger: powerAmount }, { etiket: "Bugünkü karşılık", deger: nowPower }]} xKey="etiket" yKey="deger" />
      </div>
      <CalculatorGuideText />
    </section>
  );
}