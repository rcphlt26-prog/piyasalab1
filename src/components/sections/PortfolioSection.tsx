"use client";

import dynamic from "next/dynamic";
import { startTransition, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Check, Plus, RefreshCw, Search, X } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { scorecardData } from "@/data/scorecardData";
import { getMarketPriceMeta, marketSymbolByCode, marketSymbols } from "@/data/marketSymbols";

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
type DisplayCurrency = "TRY" | "USD" | "EUR" | "GBP";

const formatMoney = (value: number) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(value);
const convertValueToTry = (value: number, currency: "TRY" | "USD" | "POINT", usdTry: number) => currency === "USD" ? value * usdTry : value;
const displayCurrencies: Array<{ code: DisplayCurrency; label: string; symbol: string }> = [
  { code: "TRY", label: "Türk Lirası", symbol: "TL" },
  { code: "USD", label: "ABD Doları", symbol: "USD" },
  { code: "EUR", label: "Euro", symbol: "EUR" },
  { code: "GBP", label: "Sterlin", symbol: "GBP" },
];
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
  const [assetSearch, setAssetSearch] = useState("");
  const [assetSearchOpen, setAssetSearchOpen] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>("TRY");
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

  const historySymbols = useMemo(() => Array.from(new Set([...holdings.map((holding) => holding.symbol), "XU100", "GRAMALTIN", "USDTRY", "EURTRY", "GBPTRY"])), [holdings]);
  const historyKey = historySymbols.join(",");

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void Promise.all(historySymbols.map(async (code) => {
        try {
          const range = ["USDTRY", "EURTRY", "GBPTRY"].includes(code) ? "MAX" : "1Y";
          const response = await fetch(`/api/quotes/history?symbol=${encodeURIComponent(code)}&range=${range}`);
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
  const exchangeRates = useMemo(() => ({
    TRY: 1,
    USD: quoteMap.get("USDTRY")?.price ?? 1,
    EUR: quoteMap.get("EURTRY")?.price ?? 1,
    GBP: quoteMap.get("GBPTRY")?.price ?? 1,
  }), [quoteMap]);
  const toDisplayCurrency = (valueInTry: number) => valueInTry / (exchangeRates[displayCurrency] || 1);
  const currencySymbol = displayCurrencies.find((item) => item.code === displayCurrency)?.symbol ?? "TL";
  const formatDisplayMoney = (valueInTry: number) => `${formatMoney(toDisplayCurrency(valueInTry))} ${currencySymbol}`;
  const filteredAssets = useMemo(() => {
    const term = assetSearch.trim().toLocaleLowerCase("tr-TR");
    const list = term
      ? marketSymbols.filter((item) => `${item.code} ${item.label} ${item.category}`.toLocaleLowerCase("tr-TR").includes(term))
      : marketSymbols.filter((item) => ["THYAO", "ASELS", "GARAN", "GRAMALTIN", "BTCUSD", "ETHUSD", "USDTRY"].includes(item.code));
    return list.slice(0, 40);
  }, [assetSearch]);
  const costBySymbol = useMemo(() => {
    const costs = new Map<string, number>();
    for (const transaction of transactions) {
      const meta = getMarketPriceMeta(marketSymbolByCode.get(transaction.symbol));
      const date = transaction.transaction_date.slice(0, 10);
      const historicalRate = meta.currency === "USD"
        ? valueAt(history.USDTRY, date)
        : meta.currency === "TRY" ? 1 : 1;
      const rate = meta.currency === "USD" ? historicalRate || exchangeRates.USD : 1;
      const sign = transaction.type === "SELL" ? -1 : 1;
      costs.set(transaction.symbol, (costs.get(transaction.symbol) ?? 0) + sign * transaction.buy_price * transaction.quantity * rate);
    }
    return costs;
  }, [transactions, history.USDTRY, exchangeRates.USD]);
  const holdingRows = useMemo(() => holdings.map((holding) => {
    const quote = quoteMap.get(holding.symbol);
    const meta = getMarketPriceMeta(marketSymbolByCode.get(holding.symbol));
    const currentPrice = quote?.price ?? holding.cost / holding.quantity;
    const rate = meta.currency === "USD" ? exchangeRates.USD : 1;
    const marketValue = convertValueToTry(currentPrice * holding.quantity, meta.currency, exchangeRates.USD);
    const costTry = costBySymbol.get(holding.symbol) ?? convertValueToTry(holding.cost, meta.currency, exchangeRates.USD);
    return { ...holding, quote, meta, currentPrice, currentPriceTry: currentPrice * rate, marketValue, costTry, pnl: marketValue - costTry };
  }), [holdings, quoteMap, exchangeRates.USD, costBySymbol]);
  const invested = holdingRows.reduce((sum, row) => sum + row.costTry, 0);
  const marketValue = holdingRows.reduce((sum, row) => sum + row.marketValue, 0);
  const dividendIncome = transactions.reduce((sum, transaction) => {
    if (transaction.type !== "BUY" || transaction.asset_type !== "STOCK") return sum;
    const yieldRate = scorecardData[transaction.symbol]?.dividendYield ?? 0;
    const elapsedYears = Math.max(0, (nowMs - new Date(transaction.transaction_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const meta = getMarketPriceMeta(marketSymbolByCode.get(transaction.symbol));
    const rate = meta.currency === "USD" ? exchangeRates.USD : 1;
    return sum + transaction.buy_price * transaction.quantity * rate * (yieldRate / 100) * elapsedYears;
  }, 0);
  const totalValue = marketValue + dividendIncome;
  const pnl = totalValue - invested;
  const pnlPct = invested ? (pnl / invested) * 100 : 0;
  const dailyPnl = holdingRows.reduce((sum, row) => sum + row.marketValue * ((row.quote?.changePct ?? 0) / 100), 0);
  const monthlyPnl = holdingRows.reduce((sum, row) => {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const date = monthAgo.toISOString().slice(0, 10);
    const oldPrice = valueAt(history[row.symbol], date);
    const oldFx = row.meta.currency === "USD" ? valueAt(history.USDTRY, date) || exchangeRates.USD : 1;
    return sum + (oldPrice ? row.marketValue - oldPrice * row.quantity * oldFx : 0);
  }, 0);

  const allocation = holdingRows.map((row) => ({ ad: row.symbol, oran: marketValue ? (row.marketValue / marketValue) * 100 : 0 }));
  const comparisonData = useMemo(() => {
    const dates = Array.from(new Set(Object.values(history).flatMap((series) => series.map((point) => point.time)))).sort();
    if (!dates.length) return [];
    const raw = dates.map((date) => {
      const portfolio = holdingRows.reduce((sum, row) => {
        const price = valueAt(history[row.symbol], date);
        const historicalUsdTry = row.meta.currency === "USD" ? valueAt(history.USDTRY, date) || exchangeRates.USD : 1;
        return sum + convertValueToTry(price * row.quantity, row.meta.currency, historicalUsdTry);
      }, 0);
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
  }, [history, holdingRows, exchangeRates.USD]);

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

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="app-muted text-xs">Tüm pozisyonlar ortak kur verileriyle çevrilir.</p>
        <label className="app-text-secondary flex items-center gap-2 text-xs">Gösterim para birimi
          <select value={displayCurrency} onChange={(event) => setDisplayCurrency(event.target.value as DisplayCurrency)} className="app-surface-2 app-border app-text rounded-lg border px-2.5 py-2 text-sm" aria-label="Portföy gösterim para birimi">
            {displayCurrencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.label} ({currency.symbol})</option>)}
          </select>
        </label>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Güncel değer</p><p className="app-text text-xl font-bold">{formatDisplayMoney(totalValue)}</p><p className="app-muted text-[10px]">Temettü dahil tahmini</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Toplam kâr / zarar</p><p className={`text-xl font-bold ${pnl >= 0 ? "text-bull" : "text-bear"}`}>{formatDisplayMoney(pnl)}</p><p className={`text-xs ${pnlPct >= 0 ? "text-bull" : "text-bear"}`}>{formatPercent(pnlPct)}</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Günlük performans</p><p className={`text-xl font-bold ${dailyPnl >= 0 ? "text-bull" : "text-bear"}`}>{formatDisplayMoney(dailyPnl)}</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Son 30 gün</p><p className={`text-xl font-bold ${monthlyPnl >= 0 ? "text-bull" : "text-bear"}`}>{formatDisplayMoney(monthlyPnl)}</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Birikmiş temettü</p><p className="text-xl font-bold text-gold">{formatDisplayMoney(dividendIncome)}</p></div>
        <div className="app-surface-2 app-border rounded-xl border p-3"><p className="app-muted text-xs">Pozisyon</p><p className="app-text text-xl font-bold">{holdingRows.length}</p></div>
      </div>

      <form onSubmit={addTransaction} className="app-surface-2 app-border mb-4 rounded-xl border p-4">
        <div className="mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /><h2 className="app-text text-sm font-semibold">Portföye varlık ekle</h2></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_minmax(140px,.8fr)_minmax(140px,.8fr)_minmax(120px,.7fr)_auto]">
          <div className="relative min-w-0">
            <label htmlFor="portfolio-asset-search" className="app-text-secondary mb-1 block text-xs font-medium">Hisse, kripto, döviz veya emtia ara</label>
            <div className="app-surface app-border flex items-center gap-2 rounded-lg border px-3">
              <Search className="app-muted h-4 w-4 shrink-0" />
              <input
                id="portfolio-asset-search"
                role="combobox"
                aria-label="Portföye eklenecek varlığı ara"
                aria-expanded={assetSearchOpen}
                aria-controls="portfolio-asset-results"
                aria-autocomplete="list"
                autoComplete="off"
                value={assetSearch}
                onFocus={() => setAssetSearchOpen(true)}
                onChange={(event) => { setAssetSearch(event.target.value); setAssetSearchOpen(true); }}
                onKeyDown={(event) => { if (event.key === "Escape") setAssetSearchOpen(false); }}
                placeholder="Örn. THYAO, Bitcoin, Ethereum..."
                className="app-text min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:opacity-60"
              />
              {assetSearch ? <button type="button" onClick={() => { setAssetSearch(""); setAssetSearchOpen(true); }} aria-label="Aramayı temizle" className="app-muted"><X className="h-4 w-4" /></button> : null}
            </div>
            {assetSearchOpen ? (
              <div id="portfolio-asset-results" role="listbox" aria-label="Varlık arama sonuçları" className="app-surface app-border absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border p-1.5 shadow-xl">
                <p className="app-muted px-2 py-1 text-[11px]">{assetSearch.trim() ? `${filteredAssets.length} eşleşen varlık` : "Öne çıkan varlıklar · tümünü görmek için arayın"}</p>
                {filteredAssets.length ? filteredAssets.map((item) => {
                  const meta = getMarketPriceMeta(item);
                  const quote = quoteMap.get(item.code);
                  return <button key={item.code} type="button" role="option" aria-selected={symbol === item.code} onClick={() => { selectAsset(item.code); setAssetSearch(""); setAssetSearchOpen(false); }} className="app-text hover:app-surface-2 flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left">
                    <span className="app-surface-2 app-border flex h-9 w-12 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold">{item.code.slice(0, 5)}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.label}</span><span className="app-muted block text-[11px]">{item.code} · {meta.unitLabel} · {meta.currencyLabel}</span></span>
                    <span className="text-right"><span className="app-text block text-xs font-semibold">{quote ? `${formatMoney(quote.price)} ${meta.currencyLabel}` : "Fiyat bekleniyor"}</span>{symbol === item.code ? <Check className="ml-auto mt-0.5 h-3.5 w-3.5 text-bull" /> : null}</span>
                  </button>;
                }) : <p className="app-muted px-2 py-4 text-center text-sm">Bu aramayla eşleşen varlık bulunamadı.</p>}
              </div>
            ) : null}
          </div>
          <label className="app-text-secondary text-xs">Varlık türü
            <span className="app-surface app-border app-text mt-1 flex min-h-10 items-center rounded-lg border px-3 text-sm">{assetType === "GOLD" ? "Emtia" : assetType === "CURRENCY" ? "Döviz" : assetType === "CRYPTO" ? "Kripto" : "Hisse / Endeks"}</span>
          </label>
          <label className="app-text-secondary text-xs">Alış fiyatı ({symbol ? getMarketPriceMeta(marketSymbolByCode.get(symbol)).currencyLabel : "birim"})
            <input required type="number" min="0" step="any" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Fiyat" className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2.5 text-sm outline-none" />
          </label>
          <label className="app-text-secondary text-xs">Adet / miktar
            <input required type="number" min="0" step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="Örn. 0,5" className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2.5 text-sm outline-none" />
          </label>
          <div className="flex items-end gap-2">
            <select aria-label="İşlem türü" value={type} onChange={(event) => setType(event.target.value as "BUY" | "SELL")} className="app-surface app-border app-text min-w-0 flex-1 rounded-lg border px-2 py-2.5 text-sm"><option value="BUY">Alış</option><option value="SELL">Satış</option></select>
            <button type="submit" disabled={!symbol || !price || !quantity} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4" /> Ekle</button>
          </div>
        </div>
        {symbol ? <p className="app-muted mt-3 text-xs">Seçili: <span className="app-text font-semibold">{symbol}</span> · Canlı fiyat varsa alış fiyatı otomatik doldurulur. Portföy toplamı seçtiğiniz gösterim para biriminde hesaplanır.</p> : <p className="app-muted mt-3 text-xs">Arama kutusunda sembolü veya varlık adını arayın; fiyatı bulunan varlıklar otomatik fiyatla gelir.</p>}
      </form>

      {loading ? <p className="app-muted py-8 text-center text-sm">Portföy yükleniyor...</p> : null}
      {!loading && message ? <div className="rounded-xl border border-[var(--color-gold)] bg-[var(--color-gold)]/10 p-4 text-sm text-gold">{message}</div> : null}
      {!loading && !message && holdingRows.length === 0 ? <div className="app-surface-2 app-border rounded-xl border p-8 text-center"><p className="app-text font-semibold">Portföyün henüz boş</p><p className="app-muted mt-1 text-sm">İlk hisse, altın veya döviz işlemini ekleyerek takip ekranını başlat.</p></div> : null}

      {!loading && !message && holdingRows.length > 0 ? <>
        <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_320px]"><div className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-2 flex items-center justify-between"><h2 className="app-text text-sm font-semibold">Portföyüm vs piyasa</h2><span className="app-muted text-xs">Başlangıç = 100</span></div><PortfolioComparisonChart data={comparisonData} /></div><div className="app-surface-2 app-border rounded-xl border p-4"><h2 className="app-text text-sm font-semibold">Varlık dağılımı</h2><AllocationChart data={allocation} /></div></div>
        <div className="app-surface-2 app-border overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead className="app-muted border-b text-xs"><tr><th className="px-3 py-2">Varlık</th><th className="px-3 py-2">Miktar</th><th className="px-3 py-2">Güncel fiyat ({currencySymbol})</th><th className="px-3 py-2">Değer ({currencySymbol})</th><th className="px-3 py-2">K/Z ({currencySymbol})</th></tr></thead><tbody>{holdingRows.map((row) => <tr key={row.symbol} className="app-border border-b"><td className="app-text px-3 py-2 font-semibold">{row.symbol}<span className="app-muted ml-1 text-[10px]">{row.meta.currencyLabel}</span></td><td className="app-text px-3 py-2">{formatMoney(row.quantity)}</td><td className="app-text px-3 py-2">{formatMoney(toDisplayCurrency(row.currentPriceTry))} {currencySymbol}</td><td className="app-text px-3 py-2">{formatDisplayMoney(row.marketValue)}</td><td className={`px-3 py-2 font-semibold ${row.pnl >= 0 ? "text-bull" : "text-bear"}`}>{formatDisplayMoney(row.pnl)}</td></tr>)}</tbody></table></div>
        <p className="app-muted mt-2 text-[11px]">USD bazlı geçmiş işlem maliyetleri, işlem tarihindeki USD/TRY verisiyle çevrilir. Geçmiş kur bulunamadığında güncel kur kullanılır; sonuç yaklaşık kâr/zarar göstergesidir.</p>
      </> : null}
    </section>
  );
}
