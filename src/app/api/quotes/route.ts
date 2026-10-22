import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { marketSymbols, marketSymbolByCode } from "@/data/marketSymbols";

export const dynamic = "force-dynamic";
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

type YahooQuote = {
  symbol: string;
  regularMarketPrice?: number | null;
  regularMarketChangePercent?: number | null;
};

const chunk = <T,>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );

function resolveYahooSymbol(code: string, defaultSymbol: string) {
  if (code === "XU100") return "XU100.IS";
  if (code === "XU030") return "XU030.IS";
  return defaultSymbol;
}

async function fetchYahooQuotes(symbols: string[]) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const settled = await Promise.allSettled(
        chunk(symbols, 20).map((group) => yahooFinance.quote(group)),
      );

      const list = settled.flatMap((result) => {
        if (result.status === "rejected") return [];
        return Array.isArray(result.value) ? result.value : [result.value];
      }) as YahooQuote[];

      if (list.length > 0) return list;
    } catch (error) {
      lastError = error;
    }

    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  if (lastError) throw lastError;
  return [];
}

async function fetchXu100FromStooq() {
  try {
    const response = await fetch("https://stooq.com/q/l/?s=xu100.is&f=sd2t2ohlcv&h&e=csv", {
      cache: "no-store",
      headers: {
        Accept: "text/csv,text/plain,*/*",
        "User-Agent": "Mozilla/5.0 (compatible; VeriAkisQuotesBot/1.0)",
      },
    });
    if (!response.ok) return null;

    const raw = (await response.text()).trim();
    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;

    const values = lines[1].split(",");
    // Symbol,Date,Time,Open,High,Low,Close,Volume
    const close = Number(values[6]);
    if (!Number.isFinite(close) || close <= 0) return null;

    return {
      price: close,
      changePct: 0,
      source: "Stooq",
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = (searchParams.get("symbols") || marketSymbols.map((symbol) => symbol.code).join(","))
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);

  const selected = requested
    .map((code) => marketSymbolByCode.get(code))
    .filter(Boolean) as typeof marketSymbols;

  if (!selected.length) {
    return NextResponse.json({ data: [] }, { headers: { "Cache-Control": "no-store, no-cache, max-age=0" } });
  }

  try {
    const needsMetalConversion = selected.some((symbol) =>
      GRAM_METALS.has(symbol.code) || GOLD_FACTORS[symbol.code],
    );

    const yahooSymbols = [
      ...new Set([
        ...selected.map((symbol) => resolveYahooSymbol(symbol.code, symbol.yahooSymbol)),
        ...(needsMetalConversion ? ["GC=F", "SI=F", "TRY=X"] : []),
      ]),
    ];

    const quoteRows = await fetchYahooQuotes(yahooSymbols);
    const bySymbol = new Map(quoteRows.map((row) => [row.symbol, row]));

    const ounceGold = Number(bySymbol.get("GC=F")?.regularMarketPrice ?? 0);
    const ounceSilver = Number(bySymbol.get("SI=F")?.regularMarketPrice ?? 0);
    const usdTry = Number(bySymbol.get("TRY=X")?.regularMarketPrice ?? 0);

    const timestamp = new Date().toISOString();
    const baseData: Quote[] = selected.map((item) => {
      const quote = bySymbol.get(resolveYahooSymbol(item.code, item.yahooSymbol));
      const convertedMetal = item.code === "GRAMGUMUS"
        ? (ounceSilver * usdTry) / 31.1035
        : GOLD_FACTORS[item.code]
          ? ((ounceGold * usdTry * GOLD_FACTORS[item.code]) / 31.1035) * (item.code === "BILEZIK22" ? 0.9167 : 1)
          : 0;

      const price = convertedMetal || Number(quote?.regularMarketPrice ?? 0);
      const changePct = Number(quote?.regularMarketChangePercent ?? 0);

      return {
        code: item.code,
        label: item.label,
        price: item.category === "kripto"
          ? Number(price.toPrecision(8))
          : Number(price.toFixed(price >= 100 ? 2 : 4)),
        changePct: Number(changePct.toFixed(2)),
        source: "Yahoo Finance",
        timestamp,
      };
    });

    if (requested.includes("XU100")) {
      const xu100 = baseData.find((item) => item.code === "XU100");
      if (!xu100 || !(xu100.price > 0)) {
        const stooq = await fetchXu100FromStooq();
        if (stooq) {
          const next = baseData.filter((item) => item.code !== "XU100");
          next.push({
            code: "XU100",
            label: marketSymbolByCode.get("XU100")?.label ?? "BIST 100",
            price: stooq.price,
            changePct: stooq.changePct,
            source: stooq.source,
            timestamp,
          });
          return NextResponse.json(
            { data: next.filter((item) => item.price > 0) },
            { headers: { "Cache-Control": "no-store, no-cache, max-age=0" } },
          );
        }
      }
    }

    return NextResponse.json(
      { data: baseData.filter((item) => item.price > 0) },
      { headers: { "Cache-Control": "no-store, no-cache, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      { data: [], error: "Canlı piyasa verisi alınamadı." },
      { status: 503, headers: { "Cache-Control": "no-store, no-cache, max-age=0" } },
    );
  }
}
