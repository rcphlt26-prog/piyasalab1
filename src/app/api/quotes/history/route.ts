import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { marketSymbolByCode } from "@/data/marketSymbols";

export const revalidate = 300;
export const runtime = "nodejs";
export const maxDuration = 30;

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("symbol")?.trim().toUpperCase();
  const market = code ? marketSymbolByCode.get(code) : undefined;

  if (!market) {
    return NextResponse.json({ data: [], error: "Geçersiz piyasa sembolü." }, { status: 400 });
  }

  try {
    const period1 = new Date();
    period1.setUTCDate(period1.getUTCDate() - 365);
    const result = await yahooFinance.chart(market.yahooSymbol, {
      period1,
      interval: "1d",
      includePrePost: false,
    });

    const data = result.quotes
      .filter((point) => point.close !== null && Number.isFinite(point.close))
      .map((point) => ({
        time: point.date.toISOString().slice(0, 10),
        value: point.close as number,
      }))
      .sort((left, right) => left.time.localeCompare(right.time));

    return NextResponse.json({
      code,
      symbol: market.yahooSymbol,
      source: "Yahoo Finance",
      data,
      meta: {
        currency: result.meta.currency,
        previousClose: result.meta.previousClose ?? null,
        regularMarketPrice: result.meta.regularMarketPrice ?? null,
      },
    });
  } catch {
    return NextResponse.json({ data: [], error: "Tarihsel piyasa verisi alınamadı." }, { status: 503 });
  }
}