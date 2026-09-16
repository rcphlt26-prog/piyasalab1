import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { marketSymbols, marketSymbolByCode, demoQuotes } from "@/data/marketSymbols";

export const revalidate = 30;

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const GOLD_FACTORS: Record<string, number> = {
  GRAMALTIN: 1,
  CEYREKALTIN: 1.754,
  YARIMALTIN: 3.508,
  TAMALTIN: 7.016,
  ATAALTIN: 7.216,
  RESATALTIN: 7.216,
  BILEZIK22: 1,
};

type Quote = {
  code: string;
  label: string;
  price: number;
  changePct: number;
  source: string;
  timestamp: string;
};

const demoFor = (codes: string[]): Quote[] => {
  const demoByCode = new Map(demoQuotes.map((q) => [q.code, q]));
  return codes
    .map((code) => {
      const base = demoByCode.get(code);
      const meta = marketSymbolByCode.get(code);
      if (!base || !meta) return null;
      return {
        code,
        label: meta.label,
        price: Number((base.price * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)),
        changePct: base.changePct,
        source: "Demo veri",
        timestamp: new Date().toISOString(),
      } satisfies Quote;
    })
    .filter(Boolean) as Quote[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = (searchParams.get("symbols") || marketSymbols.map((s) => s.code).join(","))
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  // code -> MarketSymbol eşleme
  const selected = requested
    .map((code) => marketSymbolByCode.get(code))
    .filter(Boolean) as typeof marketSymbols;

  if (selected.length === 0) {
    return NextResponse.json({ demo: true, data: [] });
  }

  try {
    const needsGoldConversion = selected.some((s) => GOLD_FACTORS[s.code]);
    const yahooSymbols = [...new Set([
      ...selected.map((s) => s.yahooSymbol),
      ...(needsGoldConversion ? ["GC=F", "TRY=X"] : []),
    ])];
    const results = await yahooFinance.quote(yahooSymbols);
    const list = Array.isArray(results) ? results : [results];
    const bySymbol = new Map(list.map((r) => [r.symbol, r]));
    const ounceGold = Number(bySymbol.get("GC=F")?.regularMarketPrice ?? 0);
    const usdTry = Number(bySymbol.get("TRY=X")?.regularMarketPrice ?? 0);

    const data: Quote[] = selected.map((item) => {
      const r = bySymbol.get(item.yahooSymbol);
      const convertedGold = GOLD_FACTORS[item.code]
        ? (ounceGold * usdTry * GOLD_FACTORS[item.code]) / 31.1035 * (item.code === "BILEZIK22" ? 0.9167 : 1)
        : 0;
      const price = convertedGold || Number(r?.regularMarketPrice ?? 0);
      const changePct = Number(r?.regularMarketChangePercent ?? 0);
      return {
        code: item.code,
        label: item.label,
        price: Number(price.toFixed(price >= 100 ? 2 : 4)),
        changePct: Number(changePct.toFixed(2)),
        source: "Yahoo Finance",
        timestamp: new Date().toISOString(),
      };
    });

    const hasLive = data.some((d) => d.price > 0);
    if (!hasLive) {
      return NextResponse.json({ demo: true, data: demoFor(requested) });
    }

    // Fiyatı gelmeyen sembolleri demo ile tamamla
    const filled = data.map((d) =>
      d.price > 0
        ? d
        : demoFor([d.code])[0] ?? d,
    );

    return NextResponse.json({ demo: false, data: filled });
  } catch {
    return NextResponse.json({ demo: true, data: demoFor(requested) });
  }
}
