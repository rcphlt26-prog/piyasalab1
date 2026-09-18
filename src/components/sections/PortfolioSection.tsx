"use client";

import dynamic from "next/dynamic";
import { startTransition, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Plus, RefreshCw } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { scorecardData } from "@/data/scorecardData";
import { marketSymbols } from "@/data/marketSymbols";

const AllocationChart = dynamic(() => import("@/components/ClientCharts").then((module) => module.AllocationChart), { ssr: false });
const PortfolioComparisonChart = dynamic(() => import("@/components/ClientCharts").then((module) => module.PortfolioComparisonChart), { ssr: false });

type Transaction = {
  id: string;
  symbol: string;
  asset_type: string;
  buy_price: number;
  quantity: number;
  transaction_date: string;
  type: "BUY" | "SELL";
};

type Portfolio = {
  id: string;
  name: string;
  portfolio_transactions: Transaction[];
};

type HistoryPoint = { time: string; value: number };
type HistoryMap = Record<string, HistoryPoint[]>;
type Holding = { symbol: string; assetType: string; quantity: number; cost: number };

const formatMoney = (value: number) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(value);
const formatPercent = (value: number) => `${value >= 0 ? "+" : ""}${formatMoney(value)}%`;

function valueAt(series: HistoryPoint[] | undefined, date: string) {
  if (!series?.length) return 0;
  let result = 0;
  for (const point of series) {
    if (point.time > date) break;
    result = point.value;
  }
  return result || series[0].value;
}

export function PortfolioSection() {
  const { quotes } = useLiveQuotes();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [history, setHistory] = useState<HistoryMap>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [symbol, setSymbol] = useState("");
  const [assetType, setAssetType] = useState("STOCK");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [nowMs] = useState(() => Date.now());

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/account/portfolio", { cache: "no-store" });
      const payload = (await response.json()) as { data?: Portfolio[]; error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Portföy yüklenemedi.");
        return;
      }
      startTransition(() => {
        setPortfolios(payload.data ?? []);
        setMessage(null);
      });
    } catch {
      setMessage("Portföy servisine ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const transactions = useMemo(() => portfolios.flatMap((portfolio) => portfolio.portfolio_transactions), [portfolios]);
  const holdings = useMemo(() => {
    const map = new Map<string, Holding>();
    transactions.forEach((transaction) => {
      const current = map.get(transaction.symbol) ?? { symbol: transaction.symbol, assetType: transaction.asset_type, quantity: 0, cost: 0 };
      const direction = transaction.type === "SELL" ? -1 : 1;
      current.quantity += direction * transaction.quantity;
      current.cost += direction * transaction.buy_price * transaction.quantity;
      map.set(transaction.symbol, current);
    });
    return Array.from(map.values()).filter((holding) => holding.quantity > 0);
  }, [transactions]);

  const historySymbols = useMemo(() => Array.from(new Set([...holdings.map((holding) => holding.symbol), "XU100", "GRAMALTIN", "USDTRY"])), [holdings]);
  const historyKey = historySymbols.join(",");

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void Promise.all(historySymbols.map(async (code) => {
        try {
          const response = await fetch(`/api/quotes/history?symbol=${encodeURIComponent(code)}&range=1Y`, { cache: "no-store" });
          const payload = (await response.json()) as { data?: HistoryPoint[] };
          return [code, payload.data ?? []] as const;
        } catch {
          return [code, []] as const;
        }
      })).then((entries) => {
        if (!cancelled) startTransition(() => setHistory(Object.fromEntries(entries)));
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [historyKey, historySymbols]);

  const quoteMap = useMemo(() => new Map(quotes.map((quote) => [quote.code, quote])), [quotes]);
  const assetGroups = useMemo(() => [
    { label: "Endeks ve Hisseler", category: "hisse", items: marketSymbols.filter((item) => item.category === "endeks" || item.category === "hisse") },
    { label: "Döviz", category: "doviz", items: marketSymbols.filter((item) => item.category === "doviz") },
    { label: "Emtia", category: "emtia", items: marketSymbols.filter((item) => item.category === "emtia") },
    { label: "Kripto", category: "kripto", items: marketSymbols.filter((item) => item.category === "kripto") },
  ], []);
  const holdingRows = useMemo(() => holdings.map((holding) => {
    const quote = quoteMap.get(holding.symbol);
    const currentPrice = quote?.price ?? holding.cost / holding.quantity;
    const marketValue = currentPrice * holding.quantity;
    return { ...holding, quote, currentPrice, marketValue, pnl: marketValue - holding.cost };
  }), [holdings, quoteMap]);
  const invested = holdingRows.reduce((sum, row) => sum + row.cost, 0);
  const marketValue = holdingRows.reduce((sum, row) => sum + row.marketValue, 0);
  const dividendIncome = transactions.reduce((sum, transaction) => {
    if (transaction.type !== "BUY" || transaction.asset_type !== "STOCK") return sum;
    const yieldRate = scorecardData[transaction.symbol]?.dividendYield ?? 0;
    const elapsedYears = Math.max(0, (nowMs - new Date(transaction.transaction_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return sum + transaction.buy_price * transaction.quantity * (yieldRate / 100) * elapsedYears;
  }, 0);
  const totalValue = marketValue + dividendIncome;
  const pnl = totalValue - invested;
  const pnlPct = invested ? (pnl / invested) * 100 : 0;
  const dailyPnl = holdingRows.reduce((sum, row) => sum + row.marketValue * ((row.quote?.changePct ?? 0) / 100), 0);
  const monthlyPnl = holdingRows.reduce((sum, row) => {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const oldPrice = valueAt(history[row.symbol], monthAgo.toISOString().slice(0, 10));
    return sum + (oldPrice ? (row.currentPrice - oldPrice) * row.quantity : 0);
  }, 0);

  const allocation = holdingRows.map((row) => ({ ad: row.symbol, oran: marketValue ? (row.marketValue / marketValue) * 100 : 0 }));
  const comparisonData = useMemo(() => {
    const dates = Array.from(new Set(Object.values(history).flatMap((series) => series.map((point) => point.time)))).sort();
    if (!dates.length) return [];
    const raw = dates.map((date) => {
      const portfolio = holdingRows.reduce((sum, row) => sum + valueAt(history[row.symbol], date) * row.quantity, 0);
      return {
        date: date.slice(0, 7),
        portfolio,
        bist: valueAt(history.XU100, date),
        gold: valueAt(history.GRAMALTIN, date),
        dollar: valueAt(history.USDTRY, date),
      };
    });
    const first = raw[0];
    return raw.filter((_, index) => index % Math.max(1, Math.ceil(raw.length / 80)) === 0 || index === raw.length - 1).map((point) => ({
      date: point.date,
      "Portföyüm": first.portfolio ? (point.portfolio / first.portfolio) * 100 : 100,
      "BIST 100": first.bist ? (point.bist / first.bist) * 100 : 100,
      "Gram Altın": first.gold ? (point.gold / first.gold) * 100 : 100,
      Dolar: first.dollar ? (point.dollar / first.dollar) * 100 : 100,
    }));
  }, [history, holdingRows]);

  async function addTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const response = await fetch("/api/account/portfolio", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ symbol, assetType, buyPrice: Number(price), quantity: Number(quantity), type }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "İşlem kaydedilemedi.");
      return;
    }
    setSymbol("");
    setPrice("");
    setQuantity("");
    await load();
  }

  function selectAsset(nextSymbol: string) {
    setSymbol(nextSymbol);
    const selected = marketSymbols.find((item) => item.code === nextSymbol);
    const quote = quoteMap.get(nextSymbol);
    if (quote) setPrice(String(quote.price));
    if (selected?.category === "emtia") setAssetType("GOLD");
    else if (selected?.category === "doviz") setAssetType("CURRENCY");
    else if (selected?.category === "kripto") setAssetType("CRYPTO");
    else setAssetType("STOCK");
  }

  return (
    <section className="section-card fade-in">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3"><span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white"><BriefcaseBusiness className="h-5 w-5" /></span><div><p className="app-muted text-xs font-semibold uppercase tracking-wide">Kişisel Finans Merkezi</p><h1 className="app-text text-2xl font-bold">Portföyüm</h1><p className="app-text-secondary mt-1 text-sm">Anlık değerini, risk dağılımını ve piyasa kıyasını tek ekranda izle.</p></div></div>
        <button type="button" onClick={() => void load()} className="app-border app-text-secondary rounded-lg border p-2" title="Yenile"><RefreshCw className="h-4 w-4" /></button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Güncel değer</p><p className="app-text text-xl font-bold">{formatMoney(totalValue)} TL</p><p className="app-muted text-[10px]">Temettü dahil tahmini</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Toplam kâr / zarar</p><p className={`text-xl font-bold ${pnl >= 0 ? "text-bull" : "text-bear"}`}>{formatMoney(pnl)} TL</p><p className={`text-xs ${pnlPct >= 0 ? "text-bull" : "text-bear"}`}>{formatPercent(pnlPct)}</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Günlük performans</p><p className={`text-xl font-bold ${dailyPnl >= 0 ? "text-bull" : "text-bear"}`}>{formatMoney(dailyPnl)} TL</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Son 30 gün</p><p className={`text-xl font-bold ${monthlyPnl >= 0 ? "text-bull" : "text-bear"}`}>{formatMoney(monthlyPnl)} TL</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Birikmiş temettü</p><p className="text-xl font-bold text-gold">{formatMoney(dividendIncome)} TL</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Pozisyon</p><p className="app-text text-xl font-bold">{holdingRows.length}</p></div>
      </div>

      <form onSubmit={addTransaction} className="app-surface-2 app-border mb-4 rounded-xl border p-4"><div className="mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /><h2 className="app-text text-sm font-semibold">Varlık ekle</h2><span className="app-muted ml-auto text-[11px]">Canlı fiyat seçince dolar</span></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"><select required value={symbol} onChange={(event) => selectAsset(event.target.value)} className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm outline-none"><option value="">Varlık seçin</option>{assetGroups.map((group) => <optgroup key={group.category} label={group.label}>{group.items.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.label}</option>)}</optgroup>)}</select><div className="app-surface app-border app-text flex items-center rounded-lg border px-3 py-2 text-sm"><span className="app-muted mr-2 text-xs">Tür</span>{assetType === "GOLD" ? "Emtia" : assetType === "CURRENCY" ? "Döviz" : assetType === "CRYPTO" ? "Kripto" : "Hisse / Endeks"}</div><input required type="number" min="0" step="any" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Alış fiyatı" className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm outline-none" /><input required type="number" min="0" step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="Lot / miktar" className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm outline-none" /><div className="flex gap-2"><select value={type} onChange={(event) => setType(event.target.value as "BUY" | "SELL")} className="app-surface app-border app-text min-w-0 flex-1 rounded-lg border px-2 py-2 text-sm"><option value="BUY">Alış</option><option value="SELL">Satış</option></select><button type="submit" className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white">Ekle</button></div></div></form>

      {loading ? <p className="app-muted py-8 text-center text-sm">Portföy yükleniyor...</p> : null}
      {!loading && message ? <div className="rounded-xl border border-[var(--color-gold)] bg-[var(--color-gold)]/10 p-4 text-sm text-gold">{message}</div> : null}
      {!loading && !message && holdingRows.length === 0 ? <div className="app-surface-2 app-border rounded-xl border p-8 text-center"><p className="app-text font-semibold">Portföyün henüz boş</p><p className="app-muted mt-1 text-sm">İlk hisse, altın veya döviz işlemini ekleyerek takip ekranını başlat.</p></div> : null}

      {!loading && !message && holdingRows.length > 0 ? <>
        <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_320px]"><div className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-2 flex items-center justify-between"><h2 className="app-text text-sm font-semibold">Portföyüm vs piyasa</h2><span className="app-muted text-xs">Başlangıç = 100</span></div><PortfolioComparisonChart data={comparisonData} /></div><div className="app-surface-2 app-border rounded-xl border p-4"><h2 className="app-text text-sm font-semibold">Varlık dağılımı</h2><AllocationChart data={allocation} /></div></div>
        <div className="app-surface-2 app-border overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead className="app-muted border-b text-xs"><tr><th className="px-3 py-2">Varlık</th><th className="px-3 py-2">Miktar</th><th className="px-3 py-2">Güncel fiyat</th><th className="px-3 py-2">Değer</th><th className="px-3 py-2">K/Z</th></tr></thead><tbody>{holdingRows.map((row) => <tr key={row.symbol} className="app-border border-b"><td className="app-text px-3 py-2 font-semibold">{row.symbol}</td><td className="app-text px-3 py-2">{formatMoney(row.quantity)}</td><td className="app-text px-3 py-2">{formatMoney(row.currentPrice)}</td><td className="app-text px-3 py-2">{formatMoney(row.marketValue)} TL</td><td className={`px-3 py-2 font-semibold ${row.pnl >= 0 ? "text-bull" : "text-bear"}`}>{formatMoney(row.pnl)} TL</td></tr>)}</tbody></table></div>
      </> : null}
    </section>
  );
}
