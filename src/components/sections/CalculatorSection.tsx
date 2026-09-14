"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Coins } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ShareCard } from "@/components/ShareCard";
import { AdSlot } from "@/components/AdSlot";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { assetList, calculateReturn, toAssetLabel } from "@/lib/finance";
import { bigMacSeries, dailyBasketSeries, gramGoldSeries, minimumWageSeries, quarterGoldSeries } from "@/data/historicalData";

const OverlayLineChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.OverlayLineChart), { ssr: false });
const SimpleBarChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.SimpleBarChart), { ssr: false });

const years = Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) => 1980 + i);

export function CalculatorSection() {
  const [initialAmount, setInitialAmount] = useState(100000);
  const [currency, setCurrency] = useState<"TL" | "USD">("TL");
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [asset, setAsset] = useState<(typeof assetList)[number]>("BIST100");
  const [drip, setDrip] = useState(true);
  const [usCpiAdjusted, setUsCpiAdjusted] = useState(false);
  const [chartScale, setChartScale] = useState<"linear" | "log">("linear");

  const [powerYear, setPowerYear] = useState(2005);
  const [powerAmount, setPowerAmount] = useState(10000);

  const currentReturn = useMemo(
    () => calculateReturn({ initial: initialAmount, currency, startYear, endYear, asset, drip, usCpiAdjusted }),
    [initialAmount, currency, startYear, endYear, asset, drip, usCpiAdjusted],
  );

  const opportunitySet = useMemo(() => assetList.map((a) => {
    const res = calculateReturn({ initial: initialAmount, currency, startYear, endYear, asset: a, drip, usCpiAdjusted });
    return { asset: toAssetLabel(a), value: res.finalNominal, gain: res.gainPct };
  }), [initialAmount, currency, startYear, endYear, drip, usCpiAdjusted]);

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
    const byYear = (series: { year: number; value: number }[]) => series.find((x) => x.year === powerYear)?.value || series[0].value;
    const byNow = (series: { year: number; value: number }[]) => series[series.length - 1].value;
    return {
      wagePast: powerAmount / byYear(minimumWageSeries), wageNow: nowPower / byNow(minimumWageSeries),
      quarterPast: powerAmount / byYear(quarterGoldSeries), quarterNow: nowPower / byNow(quarterGoldSeries),
      bigMacPast: powerAmount / byYear(bigMacSeries), bigMacNow: nowPower / byNow(bigMacSeries),
      gramPast: powerAmount / byYear(gramGoldSeries), gramNow: nowPower / byNow(gramGoldSeries),
    };
  }, [powerAmount, powerYear, nowPower]);

  return (
    <section className="section-card fade-in">
      <SectionTitle
        eyebrow="Amiral Araç"
        title="Gelişmiş Getiri ve ABD-TÜFE Reel Kazanç Hesaplayıcı"
        description="Tüm hesaplamalar yalnızca tarayıcı içinde yapılır. Sunucuda ağır işleme yoktur."
      />
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <label className="app-text-secondary text-xs">Başlangıç tutarı
          <input type="number" value={initialAmount} onChange={(e) => setInitialAmount(Number(e.target.value))} className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="app-text-secondary text-xs">Para birimi
          <select value={currency} onChange={(e) => setCurrency(e.target.value as "TL" | "USD")} className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm"><option>TL</option><option>USD</option></select>
        </label>
        <label className="app-text-secondary text-xs">Başlangıç yılı
          <select value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm">{years.map((y) => <option key={y}>{y}</option>)}</select>
        </label>
        <label className="app-text-secondary text-xs">Bitiş yılı
          <select value={endYear} onChange={(e) => setEndYear(Number(e.target.value))} className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm">{years.filter((y) => y >= startYear).map((y) => <option key={y}>{y}</option>)}</select>
        </label>
        <label className="app-text-secondary text-xs md:col-span-2">Varlık
          <select value={asset} onChange={(e) => setAsset(e.target.value as (typeof assetList)[number])} className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm">
            {assetList.map((a) => <option key={a} value={a}>{toAssetLabel(a)}</option>)}
          </select>
        </label>
        <label className="app-text-secondary flex items-center gap-2 text-xs"><input type="checkbox" checked={drip} onChange={(e) => setDrip(e.target.checked)} /> Temettü Yeniden Yatırımı (DRIP)</label>
        <label className="app-text-secondary flex items-center gap-2 text-xs"><input type="checkbox" checked={usCpiAdjusted} onChange={(e) => setUsCpiAdjusted(e.target.checked)} /> ABD Doları Enflasyonundan Arındırılmış Reel Getiri</label>
      </div>

      <AdSlot label="Hesaplayıcı Altı Inline" width={300} height={250} className="my-4" />

      {currentReturn.message ? <p className="mb-3 rounded-lg border border-[var(--color-gold)] bg-[var(--color-gold)]/10 p-3 text-sm text-gold">{currentReturn.message}</p> : null}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
          shareText={`Piyasalab'da ${toAssetLabel(asset)} için getiri analizimi tamamladım.`}
        />
      </div>

      <p className="mt-3 rounded-lg border border-[var(--color-gold)] bg-[var(--color-gold)]/10 p-2 text-xs text-gold">
        Hesaplama sonuçları tahmini olup yatırım tavsiyesi değildir.
      </p>

      {/* Alım Gücü */}
      <div className="app-surface-2 app-border mt-6 rounded-xl border p-3">
        <h3 className="app-text mb-2 text-lg font-semibold"><Coins className="text-gold mr-1 inline h-4 w-4" />Alım Gücü & Nostalji Simülatörü</h3>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <input type="number" value={powerAmount} onChange={(e) => setPowerAmount(Number(e.target.value))} className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm" />
          <select value={powerYear} onChange={(e) => setPowerYear(Number(e.target.value))} className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm">{years.map((y) => <option key={y}>{y}</option>)}</select>
        </div>
        <p className="app-surface app-border mb-2 rounded-lg border p-2 text-sm">{powerYear} yılındaki {formatCurrency(powerAmount)} bugün yaklaşık <strong>{formatCurrency(nowPower)}</strong> satın alma gücüne denk gelir.</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="app-border rounded-lg border p-2">Asgari ücret: {formatNumber(nostalgia.wagePast)} → {formatNumber(nostalgia.wageNow)}</div>
          <div className="app-border rounded-lg border p-2">Çeyrek altın: {formatNumber(nostalgia.quarterPast)} → {formatNumber(nostalgia.quarterNow)}</div>
          <div className="app-border rounded-lg border p-2">Big Mac: {formatNumber(nostalgia.bigMacPast)} → {formatNumber(nostalgia.bigMacNow)}</div>
          <div className="app-border rounded-lg border p-2">Gram altın: {formatNumber(nostalgia.gramPast)} → {formatNumber(nostalgia.gramNow)}</div>
        </div>
        <SimpleBarChart data={[{ etiket: `${powerYear} alım gücü`, deger: powerAmount }, { etiket: "Bugünkü karşılık", deger: nowPower }]} xKey="etiket" yKey="deger" />
      </div>
    </section>
  );
}
