"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Building2, Coins, FileText } from "lucide-react";
import { getKapFallback, getStatementFallback, type KapFeedItem, type StatementFeedItem } from "@/data/kapFeedData";

type KapItem = { id: string; title: string; summary: string | null; kap_url: string; category: string | null; publish_date: string; symbols?: string[]; source?: string };
type Statement = { symbol: string; year: number; quarter: number; net_profit: number; revenue: number; updated_at: string; source?: string };
const trackedSymbols = ["THYAO", "ASELS", "GARAN", "AKBNK", "EREGL", "TUPRS", "FROTO", "TCELL", "KCHOL", "SISE"];

function mapKapFallback(items: KapFeedItem[]): KapItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    kap_url: item.kapUrl,
    category: item.category,
    publish_date: item.publishDate,
    symbols: [item.symbol],
    source: "cache",
  }));
}

function mapStatementFallback(items: StatementFeedItem[]): Statement[] {
  return items.map((item) => ({
    symbol: item.symbol,
    year: Number(item.period.split("/")[0]) || 2026,
    quarter: item.period.endsWith("/06") ? 2 : item.period.endsWith("/09") ? 3 : item.period.endsWith("/03") ? 1 : 4,
    net_profit: item.netProfit,
    revenue: item.revenue,
    updated_at: item.publishDate,
    source: "cache",
  }));
}

export function HomeDailyFlow() {
  const [kap, setKap] = useState<KapItem[]>(mapKapFallback(getKapFallback(trackedSymbols, 8)));
  const [statements, setStatements] = useState<Statement[]>(mapStatementFallback(getStatementFallback(trackedSymbols, 8)));

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch(`/api/kap?symbols=${trackedSymbols.join(",")}`).then((response) => response.json()).catch(() => ({ data: [] })),
      fetch(`/api/financial-statements?symbols=${trackedSymbols.join(",")}`).then((response) => response.json()).catch(() => ({ data: [] })),
    ]).then(([kapPayload, statementPayload]) => {
      if (cancelled) return;
      const fallbackKap = mapKapFallback(getKapFallback(trackedSymbols, 8));
      const fallbackStatements = mapStatementFallback(getStatementFallback(trackedSymbols, 8));

      const kapItems = [...((kapPayload.data ?? []) as KapItem[]), ...fallbackKap];
      const statementItems = [...((statementPayload.data ?? []) as Statement[]), ...fallbackStatements];

      setKap(Array.from(new Map(kapItems.map((item) => [item.id, item])).values()).sort((a, b) => b.publish_date.localeCompare(a.publish_date)).slice(0, 8));
      setStatements(Array.from(new Map(statementItems.map((item) => [`${item.symbol}-${item.year}-${item.quarter}`, item])).values()).sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 8));
    });
    return () => { cancelled = true; };
  }, []);

  const dividendRows = useMemo(() => {
    return kap
      .filter((item) => item.category?.toLowerCase().includes("temettü") || item.title.toLowerCase().includes("kâr payı"))
      .slice(0, 6)
      .map((item) => ({ symbol: item.symbols?.[0] ?? item.title.slice(0, 5), message: item.title, date: item.publish_date }));
  }, [kap]);

  return (
    <section className="section-card">
      <div className="mb-4">
        <p className="app-muted text-xs font-semibold uppercase tracking-wide">Bugünün akışı</p>
        <h2 className="app-text mt-1 text-2xl font-bold">KAP ve bilanço zaman çizelgesi</h2>
        <p className="app-muted mt-1 text-xs">Canlı kaynak güncellenirken son doğrulanan kayıtlar gösterilir; akış kesintisiz devam eder.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="app-surface-2 app-border rounded-xl border p-4">
          <div className="mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /><h3 className="app-text text-sm font-semibold">Dönemsel bilanço özeti</h3></div>
          <div className="space-y-2">
            {statements.slice(0, 6).map((item) => (
              <Link key={`${item.symbol}-${item.year}-${item.quarter}`} href={`/hisse/${item.symbol}`} className="app-border block border-b pb-2 last:border-0 last:pb-0">
                <div className="flex items-center justify-between"><span className="app-text text-xs font-semibold">{item.symbol}</span><span className="app-muted text-[10px]">{item.year} / {item.quarter}. çeyrek</span></div>
                <p className="app-muted mt-1 text-[11px]">Hasılat: {(item.revenue / 1_000_000_000).toFixed(1)} mlr TL · Net kâr: {(item.net_profit / 1_000_000_000).toFixed(1)} mlr TL</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="app-surface-2 app-border rounded-xl border p-4">
          <div className="mb-3 flex items-center gap-2"><Coins className="h-4 w-4 text-gold" /><h3 className="app-text text-sm font-semibold">Temettü ve genel kurul akışı</h3></div>
          <div className="space-y-2">
            {dividendRows.map((item) => (
              <p key={`${item.symbol}-${item.date}`} className="app-border app-text border-b pb-2 text-xs last:border-0 last:pb-0">
                <span className="font-semibold">{item.symbol}</span> · {item.message}
              </p>
            ))}
          </div>
        </div>

        <div className="app-surface-2 app-border rounded-xl border p-4">
          <div className="mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><h3 className="app-text text-sm font-semibold">KAP bildirimleri</h3></div>
          <ol className="relative ml-2 border-l border-[var(--border)] pl-3">
            {kap.slice(0, 6).map((item) => (
              <li key={item.id} className="relative pb-4 last:pb-0">
                <span className="absolute -left-[0.54rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
                <a href={item.kap_url} target="_blank" rel="noreferrer" className="block">
                  <p className="app-text text-xs font-semibold">{item.title}</p>
                  <p className="app-muted mt-1 text-[11px]">{item.category ?? "KAP"} · {new Date(item.publish_date).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
