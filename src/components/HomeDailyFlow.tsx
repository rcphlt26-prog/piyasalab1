"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Coins, FileText } from "lucide-react";
import { BIST30_FUNDAMENTALS } from "@/data/fallbackData";

type KapItem = { id: string; title: string; summary: string | null; kap_url: string; category: string | null; publish_date: string; symbols: string[] };
type Statement = { symbol: string; year: number; quarter: number; net_profit: number; revenue: number; updated_at: string };
const trackedSymbols = ["THYAO", "ASELS", "GARAN", "AKBNK", "EREGL", "TUPRS"];
const fmt = (value: number) => value.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Supabase'den finansal tablo gelmediğinde gösterilen BIST 30 temel göstergeler özeti
function Bist30FundamentalsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] tabular-nums">
        <caption className="app-muted mb-2 text-left text-[10px]">BIST 30 seçili şirketler · son açıklanan dönem özeti</caption>
        <thead>
          <tr className="app-muted app-border border-b text-left">
            <th scope="col" className="py-1 pr-2 font-medium">Şirket</th>
            <th scope="col" className="py-1 pr-2 text-right font-medium">F/K</th>
            <th scope="col" className="py-1 pr-2 text-right font-medium">PD/DD</th>
            <th scope="col" className="py-1 pr-2 text-right font-medium" title="Özsermaye Kârlılığı (%)">ÖK (%)</th>
            <th scope="col" className="py-1 text-right font-medium" title="Temettü Verimi (%)">Temettü (%)</th>
          </tr>
        </thead>
        <tbody>
          {BIST30_FUNDAMENTALS.map((row) => (
            <tr key={row.symbol} className="app-border border-b last:border-0">
              <th scope="row" className="py-1.5 pr-2 text-left font-semibold"><Link href={`/varlik/${row.symbol}`} className="app-text hover:text-primary" title={row.name}>{row.symbol}</Link></th>
              <td className="app-text py-1.5 pr-2 text-right">{fmt(row.fk)}</td>
              <td className="app-text py-1.5 pr-2 text-right">{fmt(row.pddd)}</td>
              <td className="app-text py-1.5 pr-2 text-right">{fmt(row.ok)}</td>
              <td className="app-text py-1.5 text-right">{fmt(row.temettü)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HomeDailyFlow() {
  const [kap, setKap] = useState<KapItem[]>([]);
  const [statements, setStatements] = useState<Statement[]>([]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch(`/api/kap?symbols=${trackedSymbols.join(",")}`).then((response) => response.json()).catch(() => ({ data: [] })),
      fetch(`/api/financial-statements?symbols=${trackedSymbols.join(",")}`).then((response) => response.json()).catch(() => ({ data: [] })),
    ]).then(([kapPayload, statementPayload]) => {
      if (cancelled) return;
      const kapItems = (kapPayload.data ?? []) as KapItem[];
      const statementItems = (statementPayload.data ?? []) as Statement[];
      setKap(Array.from(new Map(kapItems.map((item) => [item.id, item])).values()).sort((a, b) => b.publish_date.localeCompare(a.publish_date)).slice(0, 6));
      setStatements(statementItems.sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 6));
    });
    return () => { cancelled = true; };
  }, []);

  const dividendRows: Array<{ symbol: string; message: string }> = [];

  return <section className="section-card"><div className="mb-4"><p className="app-muted text-xs font-semibold uppercase tracking-wide">Bugünün akışı</p><h2 className="app-text mt-1 text-2xl font-bold">Şirket haberleri ve temel göstergeler</h2></div><div className="grid gap-4 lg:grid-cols-3"><div className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /><h3 className="app-text text-sm font-semibold">Finansal tablolar</h3></div>{statements.length ? statements.map((item) => <Link key={`${item.symbol}-${item.year}-${item.quarter}`} href={`/varlik/${item.symbol}`} className="app-border mb-2 block border-b pb-2 last:mb-0 last:border-0 last:pb-0"><div className="flex items-center justify-between"><span className="app-text text-xs font-semibold">{item.symbol}</span><span className="app-muted text-[10px]">{item.year} / {item.quarter}. ay</span></div><p className="app-muted mt-1 text-[11px]">Ciro: {item.revenue} · Net kâr: {item.net_profit}</p></Link>) : <Bist30FundamentalsTable />}</div><div className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-3 flex items-center gap-2"><Coins className="h-4 w-4 text-gold" /><h3 className="app-text text-sm font-semibold">Temettü bildirimleri</h3></div>{dividendRows.length ? dividendRows.map((item) => <p key={item.symbol} className="app-text border-b py-2 text-xs">{item.symbol} · {item.message}</p>) : <ul className="space-y-1.5">{[...BIST30_FUNDAMENTALS].sort((a, b) => b.temettü - a.temettü).map((row) => <li key={row.symbol} className="app-border flex items-center justify-between border-b pb-1.5 text-xs last:border-0"><Link href={`/varlik/${row.symbol}`} className="app-text font-semibold hover:text-primary">{row.symbol} <span className="app-muted font-normal">· {row.name}</span></Link><span className="font-semibold tabular-nums text-gold">%{fmt(row.temettü)}</span></li>)}<li className="app-muted pt-1 text-[10px]">Temettü verimi, son dağıtılan brüt temettüye göre hesaplanmıştır.</li></ul>}</div><div className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><h3 className="app-text text-sm font-semibold">KAP bildirimleri</h3></div>{kap.length ? kap.map((item) => <a key={item.id} href={item.kap_url} target="_blank" rel="noreferrer" className="app-border mb-2 block border-b pb-2 last:mb-0 last:border-0 last:pb-0"><p className="app-text text-xs font-semibold">{item.title}</p><p className="app-muted mt-1 text-[11px]">{item.category ?? "KAP"} · {new Date(item.publish_date).toLocaleDateString("tr-TR")}</p></a>) : <ul className="space-y-1.5">{trackedSymbols.map((symbol) => <li key={symbol}><Link href={`/varlik/${symbol}`} className="app-border flex items-center justify-between border-b pb-1.5 text-xs last:border-0 hover:text-primary"><span className="app-text font-semibold">{symbol}</span><span className="app-muted text-[11px]">Şirket sayfası ve bildirimler →</span></Link></li>)}</ul>}</div></div></section>;
}
