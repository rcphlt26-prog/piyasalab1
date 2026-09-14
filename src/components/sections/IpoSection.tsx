"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ipoData, type IpoItem } from "@/data/ipoData";
import { fetchIpos } from "@/lib/supabase/data";
import { ShareCard } from "@/components/ShareCard";

const SimpleBarChart = dynamic(() => import("@/components/ClientCharts").then((m) => m.SimpleBarChart), { ssr: false });

export function IpoSection() {
  const [lot, setLot] = useState(1000);
  const [price, setPrice] = useState(20);
  const [days, setDays] = useState(10);
  const [targetPrice, setTargetPrice] = useState(100);

  const [ipoList, setIpoList] = useState<IpoItem[]>(ipoData);
  const [ipoSource, setIpoSource] = useState<"loading" | "supabase" | "demo">("loading");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const remote = await fetchIpos();
      if (cancelled) return;
      if (remote && remote.length > 0) {
        setIpoList(remote);
        setIpoSource("supabase");
      } else {
        setIpoList(ipoData);
        setIpoSource("demo");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const result = useMemo(() => {
    let p = price;
    let prevTotal = price * lot;
    const rows = [{ gun: 0, fiyat: price, deger: price * lot, gunluk: 0, toplam: 0 }];
    for (let i = 1; i <= days; i += 1) {
      p = Number((p * 1.1).toFixed(4));
      const total = p * lot;
      rows.push({
        gun: i,
        fiyat: Number(p.toFixed(2)),
        deger: Number(total.toFixed(2)),
        gunluk: Number((total - prevTotal).toFixed(2)),
        toplam: Number((total - price * lot).toFixed(2)),
      });
      prevTotal = total;
    }
    const startValue = price * lot;
    const finalValue = rows[rows.length - 1].deger;
    return {
      rows,
      startValue,
      finalValue,
      gainPct: ((finalValue / startValue - 1) * 100).toFixed(2),
      totalGain: finalValue - startValue,
    };
  }, [lot, price, days]);

  const daysToTarget = useMemo(() => {
    if (targetPrice <= price) return 0;
    return Math.ceil(Math.log(targetPrice / price) / Math.log(1.1));
  }, [targetPrice, price]);

  const chartData = result.rows.map((r) => ({ etiket: `${r.gun}. gün`, deger: r.deger }));

  return (
    <section className="section-card fade-in">
      <SectionTitle
        eyebrow="Halka Arz"
        title="Halka Arz (IPO) Tavan Serisi Simülatörü"
        description="Ard arda %10'luk tavan günlerinin bileşik etkisini gün gün gösterir. Eğitim amaçlı bir olasılık laboratuvarıdır; kesin sonuç üretmez."
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="app-text-secondary text-xs">Lot adedi
          <input type="number" value={lot} onChange={(e) => setLot(Number(e.target.value))} className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="app-text-secondary text-xs">Halka arz fiyatı (₺)
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="app-text-secondary text-xs">Tavan günü sayısı
          <input type="number" value={days} onChange={(e) => setDays(Math.max(1, Math.min(40, Number(e.target.value))))} className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="app-text-secondary text-xs">Hedef fiyat (ters hesap)
          <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(Number(e.target.value))} className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Başlangıç değeri</p><p className="app-text text-lg font-bold">{formatCurrency(result.startValue)}</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Final değeri</p><p className="app-text text-lg font-bold">{formatCurrency(result.finalValue)}</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Toplam kazanç</p><p className="text-bull text-lg font-bold">{formatCurrency(result.totalGain)}</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Toplam getiri</p><p className="text-bull text-lg font-bold">%{result.gainPct}</p></div>
      </div>

      <p className="app-text-secondary mt-3 rounded-lg border app-border app-surface-2 p-2 text-sm">
        Ters hesaplama: {formatCurrency(targetPrice)} hedef fiyatına ulaşmak için yaklaşık <strong>{daysToTarget}</strong> tavan günü gerekir.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="app-surface-2 app-border max-h-[320px] overflow-auto rounded-xl border">
          <table className="w-full text-left text-xs">
            <thead className="app-surface-3 sticky top-0"><tr>
              <th className="p-2">Gün</th><th className="p-2">Fiyat</th><th className="p-2">Değer</th><th className="p-2">Günlük</th><th className="p-2">Toplam</th>
            </tr></thead>
            <tbody>
              {result.rows.map((r) => (
                <tr key={r.gun} className="app-border border-t">
                  <td className="p-2">{r.gun}</td>
                  <td className="p-2">{formatCurrency(r.fiyat)}</td>
                  <td className="p-2">{formatCurrency(r.deger)}</td>
                  <td className="p-2 text-bull">{r.gunluk ? "+" + formatNumber(r.gunluk, 0) : "-"}</td>
                  <td className="p-2 text-bull">{r.toplam ? "+" + formatNumber(r.toplam, 0) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="app-surface-2 app-border rounded-xl border p-3">
          <SimpleBarChart data={chartData} xKey="etiket" yKey="deger" />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="app-text text-lg font-semibold">Güncel & Yaklaşan Halka Arzlar</h3>
          {ipoSource === "supabase" ? (
            <span className="rounded-full bg-[var(--color-bull)]/15 px-2 py-0.5 text-[11px] font-semibold text-bull">Canlı veri</span>
          ) : ipoSource === "demo" ? (
            <span className="rounded-full bg-[var(--color-gold)]/15 px-2 py-0.5 text-[11px] font-semibold text-gold">Demo veri</span>
          ) : (
            <span className="app-muted text-[11px]">Yükleniyor…</span>
          )}
        </div>
        <div className="app-surface-2 app-border overflow-auto rounded-xl border">
          <table className="w-full text-left text-xs">
            <thead className="app-surface-3"><tr>
              <th className="p-2">Şirket</th><th className="p-2">Kod</th><th className="p-2">Sektör</th><th className="p-2">Fiyat Aralığı</th><th className="p-2">Tarih</th><th className="p-2">Durum</th>
            </tr></thead>
            <tbody>
              {ipoSource === "loading" ? (
                <tr><td colSpan={6} className="app-muted p-4 text-center">Halka arz verileri yükleniyor…</td></tr>
              ) : ipoList.map((ipo) => (
                <tr key={ipo.ticker} className="app-border border-t">
                  <td className="p-2">{ipo.company}</td>
                  <td className="p-2 font-semibold">{ipo.ticker}</td>
                  <td className="p-2">{ipo.sector}</td>
                  <td className="p-2">{formatCurrency(ipo.priceMin)} - {formatCurrency(ipo.priceMax)}</td>
                  <td className="p-2">{ipo.date ? new Date(ipo.date).toLocaleDateString("tr-TR") : "-"}</td>
                  <td className="p-2">
                    <span className={`rounded-full px-2 py-0.5 ${ipo.status === "Bekliyor" ? "bg-[var(--color-gold)]/15 text-gold" : "bg-[var(--color-bull)]/15 text-bull"}`}>{ipo.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <ShareCard
          template="tavan"
          title="IPO Tavan Serisi Sonucu"
          subtitle={`${lot} lot · ${days} tavan günü`}
          metrics={[
            { label: "Başlangıç", value: formatCurrency(result.startValue) },
            { label: "Final", value: formatCurrency(result.finalValue) },
            { label: "Toplam Getiri", value: `%${result.gainPct}` },
            { label: "Gün", value: String(days) },
          ]}
          shareText="Piyasalab IPO tavan serisi hesaplayıcısı ile senaryomu test ettim."
        />
      </div>
    </section>
  );
}
