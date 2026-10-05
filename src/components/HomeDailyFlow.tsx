"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Coins, FileText } from "lucide-react";

type KapItem = { id: string; title: string; summary: string | null; kap_url: string; category: string | null; publish_date: string; symbols: string[] };
type Statement = { symbol: string; year: number; quarter: number; net_profit: number; revenue: number; updated_at: string };
const trackedSymbols = ["THYAO", "ASELS", "GARAN", "AKBNK", "EREGL", "TUPRS"];

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

  return <section className="section-card"><div className="mb-4"><p className="app-muted text-xs font-semibold uppercase tracking-wide">Bugünün akışı</p><h2 className="app-text mt-1 text-2xl font-bold">Gerçek veri akışı</h2><p className="app-muted mt-1 text-xs">KAP bildirimleri ve finansal tablolar Supabase veri katmanından gelir. Veri yoksa kartlar boş gösterilir; temsili içerik kullanılmaz.</p></div><div className="grid gap-4 lg:grid-cols-3"><div className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /><h3 className="app-text text-sm font-semibold">Finansal tablolar</h3></div>{statements.length ? statements.map((item) => <Link key={`${item.symbol}-${item.year}-${item.quarter}`} href={`/varlik/${item.symbol}`} className="app-border mb-2 block border-b pb-2 last:mb-0 last:border-0 last:pb-0"><div className="flex items-center justify-between"><span className="app-text text-xs font-semibold">{item.symbol}</span><span className="app-muted text-[10px]">{item.year} / {item.quarter}. ay</span></div><p className="app-muted mt-1 text-[11px]">Ciro: {item.revenue} · Net kâr: {item.net_profit}</p></Link>) : <p className="app-muted py-6 text-center text-xs">Henüz gerçek finansal tablo kaydı yok.</p>}</div><div className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-3 flex items-center gap-2"><Coins className="h-4 w-4 text-gold" /><h3 className="app-text text-sm font-semibold">Temettü bildirimleri</h3></div>{dividendRows.length ? dividendRows.map((item) => <p key={item.symbol} className="app-text border-b py-2 text-xs">{item.symbol} · {item.message}</p>) : <p className="app-muted py-6 text-center text-xs">Veri mevcut değil.</p>}</div><div className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><h3 className="app-text text-sm font-semibold">KAP bildirimleri</h3></div>{kap.length ? kap.map((item) => <a key={item.id} href={item.kap_url} target="_blank" rel="noreferrer" className="app-border mb-2 block border-b pb-2 last:mb-0 last:border-0 last:pb-0"><p className="app-text text-xs font-semibold">{item.title}</p><p className="app-muted mt-1 text-[11px]">{item.category ?? "KAP"} · {new Date(item.publish_date).toLocaleDateString("tr-TR")}</p></a>) : <p className="app-muted py-6 text-center text-xs">Henüz KAP bildirimi alınmadı.</p>}</div></div></section>;
}
