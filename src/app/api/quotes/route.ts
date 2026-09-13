import { NextResponse } from "next/server";
import { marketSymbols, demoQuotes } from "@/data/marketSymbols";

type Quote = {
  code: string;
  label: string;
  price: number;
  changePct: number;
  source: string;
  timestamp: string;
};

async function fetchYahoo(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`;
  const response = await fetch(url, { next: { revalidate: 3 } });
  if (!response.ok) throw new Error("Kaynak yanıt vermedi");
  const data = await response.json();
  const result = data?.chart?.result?.[0];
  const meta = result?.meta;
  const current = Number(meta?.regularMarketPrice ?? 0);
  const previousClose = Number(meta?.chartPreviousClose ?? meta?.previousClose ?? current);
  const changePct = previousClose ? ((current - previousClose) / previousClose) * 100 : 0;
  return {
    price: current,
    changePct,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = (searchParams.get("symbols") || marketSymbols.map((s) => s.code).join(",")).split(",");

  const selected = marketSymbols.filter((item) => symbols.includes(item.code));

  try {
    const entries = await Promise.all(
      selected.map(async (item) => {
        const quote = await fetchYahoo(item.yahooSymbol);
        return {
          code: item.code,
          label: item.label,
          price: quote.price,
          changePct: Number(quote.changePct.toFixed(2)),
          source: "Yahoo Finance",
          timestamp: new Date().toISOString(),
        } satisfies Quote;
      }),
    );

    return NextResponse.json(
      { demo: false, data: entries },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        demo: true,
        data: demoQuotes.map((item) => ({
          ...item,
          price: Number((item.price * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)),
          timestamp: new Date().toISOString(),
          source: "Demo veri",
        })),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3, stale-while-revalidate=30",
        },
      },
    );
  }
}
