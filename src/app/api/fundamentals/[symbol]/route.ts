import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ symbol: string }>;
};

type QuoteMap = Record<string, number | string | null | undefined>;

type FundamentalPayload = {
  symbol: string;
  fk: number | null;
  pddd: number | null;
  roe: number | null;
  temettuVerimi: number | null;
  piyasaDegeri: number | null;
  hisseBasinaKazanc: number | null;
  defterdegerPerShare: number | null;
  guncelFiyat: number | null;
  degisimYuzde: number | null;
  kaynakTarih: string;
  kaynakTip: "canli";
};

const LIVE_ERROR = "Canlı veri alınamadı, lütfen tekrar deneyin.";
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const asNumber = (value: number | string | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

function normalizeFromQuote(symbol: string, quote: QuoteMap): FundamentalPayload {
  return {
    symbol,
    fk: asNumber(quote.trailingPE),
    pddd: asNumber(quote.priceToBook),
    roe: asNumber(quote.returnOnEquity) !== null ? Number((Number(quote.returnOnEquity) * 100).toFixed(2)) : null,
    temettuVerimi: asNumber(quote.dividendYield) !== null ? Number((Number(quote.dividendYield) * 100).toFixed(2)) : null,
    piyasaDegeri: asNumber(quote.marketCap),
    hisseBasinaKazanc: asNumber(quote.trailingEps),
    defterdegerPerShare: asNumber(quote.bookValue),
    guncelFiyat: asNumber(quote.regularMarketPrice),
    degisimYuzde: asNumber(quote.regularMarketChangePercent),
    kaynakTarih: new Date().toISOString(),
    kaynakTip: "canli",
  };
}

function normalizeFromQuoteSummary(symbol: string, summary: Record<string, unknown>): FundamentalPayload {
  const price = (summary.price as Record<string, unknown> | undefined) ?? {};
  const stats = (summary.defaultKeyStatistics as Record<string, unknown> | undefined) ?? {};
  const financial = (summary.financialData as Record<string, unknown> | undefined) ?? {};
  const detail = (summary.summaryDetail as Record<string, unknown> | undefined) ?? {};

  return {
    symbol,
    fk: asNumber((stats.trailingPE as number | null | undefined) ?? (summary.trailingPE as number | null | undefined)),
    pddd: asNumber((stats.priceToBook as number | null | undefined) ?? (summary.priceToBook as number | null | undefined)),
    roe: asNumber(financial.returnOnEquity as number | null | undefined) !== null
      ? Number((Number(financial.returnOnEquity) * 100).toFixed(2))
      : null,
    temettuVerimi: asNumber(detail.dividendYield as number | null | undefined) !== null
      ? Number((Number(detail.dividendYield) * 100).toFixed(2))
      : null,
    piyasaDegeri: asNumber(price.marketCap as number | null | undefined),
    hisseBasinaKazanc: asNumber((stats.trailingEps as number | null | undefined) ?? (summary.trailingEps as number | null | undefined)),
    defterdegerPerShare: asNumber(stats.bookValue as number | null | undefined),
    guncelFiyat: asNumber(price.regularMarketPrice as number | null | undefined),
    degisimYuzde: asNumber(price.regularMarketChangePercent as number | null | undefined),
    kaynakTarih: new Date().toISOString(),
    kaynakTip: "canli",
  };
}

function hasCoreFields(payload: FundamentalPayload) {
  return payload.fk !== null || payload.pddd !== null || payload.piyasaDegeri !== null;
}

async function fetchQuoteWithRetry(yahooSymbol: string) {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return (await yahooFinance.quote(yahooSymbol)) as QuoteMap;
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
  }
  throw lastError ?? new Error("quote başarısız");
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { symbol: rawSymbol } = await context.params;
  const symbol = rawSymbol.toUpperCase();
  const yahooSymbol = symbol.endsWith(".IS") ? symbol : `${symbol}.IS`;

  try {
    const quote = await fetchQuoteWithRetry(yahooSymbol);
    const data = normalizeFromQuote(symbol, quote);

    if (hasCoreFields(data)) {
      return NextResponse.json(data, {
        headers: { "Cache-Control": "no-store, no-cache, max-age=0" },
      });
    }

    const quoteSummary = (await yahooFinance.quoteSummary(yahooSymbol, {
      modules: ["price", "defaultKeyStatistics", "financialData", "summaryDetail"],
    })) as unknown as Record<string, unknown>;

    const summaryData = normalizeFromQuoteSummary(symbol, quoteSummary ?? {});
    if (!hasCoreFields(summaryData)) {
      return NextResponse.json(
        { error: LIVE_ERROR, symbol, kaynakTip: "canli" },
        { status: 503, headers: { "Cache-Control": "no-store, no-cache, max-age=0" } },
      );
    }

    return NextResponse.json(summaryData, {
      headers: { "Cache-Control": "no-store, no-cache, max-age=0" },
    });
  } catch (error) {
    console.error(`Yahoo Finance hatası [${yahooSymbol}]:`, error);
    return NextResponse.json(
      { error: LIVE_ERROR, symbol, kaynakTip: "canli" },
      { status: 503, headers: { "Cache-Control": "no-store, no-cache, max-age=0" } },
    );
  }
}
