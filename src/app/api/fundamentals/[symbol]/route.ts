import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ symbol: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  const { symbol: rawSymbol } = await context.params;
  const symbol = rawSymbol.toUpperCase();
  const yahooSymbol = symbol.endsWith(".IS") ? symbol : `${symbol}.IS`;

  try {
    const quote = (await yahooFinance.quote(yahooSymbol)) as Record<string, number | string | null | undefined>;

    const data = {
      symbol,
      fk: typeof quote.trailingPE === "number" ? quote.trailingPE : null,
      pddd: typeof quote.priceToBook === "number" ? quote.priceToBook : null,
      roe: typeof quote.returnOnEquity === "number" ? +(quote.returnOnEquity * 100).toFixed(2) : null,
      temettuVerimi: typeof quote.dividendYield === "number" ? +(quote.dividendYield * 100).toFixed(2) : null,
      piyasaDegeri: typeof quote.marketCap === "number" ? quote.marketCap : null,
      hisseBasinaKazanc: typeof quote.trailingEps === "number" ? quote.trailingEps : null,
      defterdegerPerShare: typeof quote.bookValue === "number" ? quote.bookValue : null,
      guncelFiyat: typeof quote.regularMarketPrice === "number" ? quote.regularMarketPrice : null,
      degisimYuzde: typeof quote.regularMarketChangePercent === "number" ? quote.regularMarketChangePercent : null,
      kaynakTarih: new Date().toISOString(),
      kaynakTip: "canli" as const,
    };

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, no-cache, max-age=0" },
    });
  } catch (error) {
    console.error(`Yahoo Finance hatası [${yahooSymbol}]:`, error);
    const { getFundamentals } = await import("@/data/fundamentalData");
    const fallback = getFundamentals(symbol);

    return NextResponse.json(
      { ...fallback, symbol, kaynakTip: "onbellek", kaynakTarih: new Date().toISOString() },
      { status: 200, headers: { "Cache-Control": "s-maxage=60" } },
    );
  }
}
