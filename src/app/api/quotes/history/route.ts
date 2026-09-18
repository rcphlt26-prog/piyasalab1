import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { marketSymbolByCode } from "@/data/marketSymbols";

export const revalidate = 300;
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

type DailyPoint = { time: string; value: number };

async function loadDailySeries(symbol: string, period1: Date): Promise<DailyPoint[]> {
  const result = await yahooFinance.chart(symbol, {
    period1,
    interval: "1d",
    includePrePost: false,
  });

  return result.quotes
    .filter((point) => point.close !== null && Number.isFinite(point.close))
    .map((point) => ({ time: point.date.toISOString().slice(0, 10), value: point.close as number }))
    .sort((left, right) => left.time.localeCompare(right.time));
}

function convertMetalSeries(metal: DailyPoint[], fx: DailyPoint[], factor = 1): DailyPoint[] {
  let fxIndex = 0;
  let latestFx = 0;
  return metal.flatMap((point) => {
    while (fxIndex < fx.length && fx[fxIndex].time <= point.time) {
      latestFx = fx[fxIndex].value;
      fxIndex += 1;
    }
    if (!latestFx) return [];
    return [{ time: point.time, value: (point.value * latestFx * factor) / 31.1035 }];
  });
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const code = searchParams.get("symbol")?.trim().toUpperCase();
  const range = searchParams.get("range")?.trim().toUpperCase() ?? "MAX";
  const market = code ? marketSymbolByCode.get(code) : undefined;

  if (!market) {
    return NextResponse.json({ data: [], error: "Geçersiz piyasa sembolü." }, { status: 400 });
  }

  try {
    const period1 = new Date();
    const days = range === "1Y" ? 365 : range === "5Y" ? 365 * 5 : 365 * 10;
    period1.setUTCDate(period1.getUTCDate() - days);

    const isGramMetal = code === "GRAMALTIN" || code === "GRAMGUMUS";
    const isBistIndex = code === "XU100" || code === "XU030";
    let symbol = market.yahooSymbol;
    let data: DailyPoint[] = [];

    if (isGramMetal) {
      const metalSymbol = code === "GRAMGUMUS" ? "SI=F" : "GC=F";
      const [metal, fx] = await Promise.all([
        loadDailySeries(metalSymbol, period1),
        loadDailySeries("TRY=X", period1),
      ]);
      data = convertMetalSeries(metal, fx);
      symbol = `${metalSymbol} + TRY=X`;
    } else {
      const candidates = isBistIndex
        ? [market.yahooSymbol, code === "XU030" ? "XU030.IS" : "XU100.IS"]
        : [market.yahooSymbol];
      for (const candidate of candidates) {
        try {
          const candidateData = await loadDailySeries(candidate, period1);
          if (candidateData.length > 0) {
            data = candidateData;
            symbol = candidate;
            break;
          }
        } catch {
          // Try the provider's alternate index symbol before returning an empty chart.
        }
      }
    }

    if (GOLD_FACTORS[code ?? ""] && !isGramMetal) {
      const [gold, fx] = await Promise.all([
        loadDailySeries("GC=F", period1),
        loadDailySeries("TRY=X", period1),
      ]);
      data = convertMetalSeries(gold, fx, GOLD_FACTORS[code ?? ""]);
      symbol = "GC=F + TRY=X";
    }

    return NextResponse.json({
      code,
      symbol,
      source: "Yahoo Finance",
      data,
      meta: {
        currency: isGramMetal || GOLD_FACTORS[code ?? ""] ? "TRY" : "TRY",
        unit: isGramMetal || GOLD_FACTORS[code ?? ""] ? "TL/gram" : undefined,
      },
    });
  } catch {
    return NextResponse.json({ data: [], error: "Tarihsel piyasa verisi alınamadı." }, { status: 503 });
  }
}