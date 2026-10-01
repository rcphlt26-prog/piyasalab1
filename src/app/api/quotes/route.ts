import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { marketSymbols, marketSymbolByCode } from "@/data/marketSymbols";

export const revalidate = 30;
export const runtime = "nodejs";
export const maxDuration = 30;

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
const GRAM_METALS = new Set(["GRAMALTIN", "GRAMGUMUS"]);

type Quote = {
  code: string;
  label: string;
  price: number;
  changePct: number;
  source: string;
  timestamp: string;
};

const chunk = <T,>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));

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
    return NextResponse.json({ demo: false, data: [] });
  }

  try {
    const needsMetalConversion = selected.some((s) => GRAM_METALS.has(s.code) || GOLD_FACTORS[s.code]);
    const yahooSymbols = [...new Set([
      ...selected.map((s) => s.yahooSymbol),
      ...(needsMetalConversion ? ["GC=F", "SI=F", "TRY=X"] : []),
    ])];
    const settled = await Promise.allSettled(
      chunk(yahooSymbols, 20).map((symbols) => yahooFinance.quote(symbols)),
    );
    const list = settled.flatMap((result) => {
      if (result.status === "rejected") return [];
      return Array.isArray(result.value) ? result.value : [result.value];
    });
    const bySymbol = new Map(list.map((r) => [r.symbol, r]));
    const ounceGold = Number(bySymbol.get("GC=F")?.regularMarketPrice ?? 0);
    const ounceSilver = Number(bySymbol.get("SI=F")?.regularMarketPrice ?? 0);
    const usdTry = Number(bySymbol.get("TRY=X")?.regularMarketPrice ?? 0);

    const data: Quote[] = selected.map((item) => {
      const r = bySymbol.get(item.yahooSymbol);
      const convertedMetal = item.code === "GRAMGUMUS"
        ? (ounceSilver * usdTry) / 31.1035
        : GOLD_FACTORS[item.code]
          ? (ounceGold * usdTry * GOLD_FACTORS[item.code]) / 31.1035 * (item.code === "BILEZIK22" ? 0.9167 : 1)
          : 0;
      const price = convertedMetal || Number(r?.regularMarketPrice ?? 0);
      const changePct = Number(r?.regularMarketChangePercent ?? 0);
      return {
        code: item.code,
        label: item.label,
        price: item.category === "kripto" ? Number(price.toPrecision(8)) : Number(price.toFixed(price >= 100 ? 2 : 4)),
        changePct: Number(changePct.toFixed(2)),
        source: "Yahoo Finance",
        timestamp: new Date().toISOString(),
      };
    });

    const hasLive = data.some((d) => d.price > 0);
    return NextResponse.json(
      { demo: false, data: hasLive ? data.filter((item) => item.price > 0) : [] },
      { headers: { "Cache-Control": hasLive ? "public, s-maxage=30, stale-while-revalidate=60" : "no-store" } },
    );
  } catch {
    return NextResponse.json({ demo: false, data: [], error: "Canlı piyasa verisi alınamadı." }, { status: 503 });
  }
}
