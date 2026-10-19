import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStatementFallback } from "@/data/kapFeedData";

export const revalidate = 300;

const quarterFromPeriod = (period: string) => {
  if (period.endsWith("/03")) return 1;
  if (period.endsWith("/06")) return 2;
  if (period.endsWith("/09")) return 3;
  return 4;
};

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const symbols = Array.from(new Set((searchParams.get("symbols") ?? searchParams.get("symbol") ?? "")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)));
  if (!symbols.length) return NextResponse.json({ data: [], error: "symbol veya symbols gerekli." }, { status: 400 });

  const fallback = getStatementFallback(symbols, symbols.length === 1 ? 40 : 240).map((item) => ({
    id: item.id,
    symbol: item.symbol,
    year: Number(item.period.split("/")[0]) || 2026,
    quarter: quarterFromPeriod(item.period),
    net_profit: item.netProfit,
    revenue: item.revenue,
    ebitda: Math.round(item.revenue * 0.18),
    total_debt: Math.round(item.equity * 0.62),
    pe_ratio: null,
    pb_ratio: null,
    equity: item.equity,
    updated_at: item.publishDate,
    source: "cache",
  }));

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ data: fallback }, { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" } });
  }

  let query = supabase
    .from("financial_statements")
    .select("id, symbol, year, quarter, net_profit, revenue, ebitda, total_debt, pe_ratio, pb_ratio, updated_at");
  query = symbols.length === 1
    ? query.eq("symbol", symbols[0])
      .order("year", { ascending: true })
      .order("quarter", { ascending: true })
    : query.in("symbol", symbols).order("updated_at", { ascending: false });

  const { data, error } = await query.limit(symbols.length === 1 ? 40 : 240);
  if (error) {
    return NextResponse.json({ data: fallback }, { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" } });
  }

  const merged = [...(data ?? []), ...fallback]
    .reduce<Array<{ id: string; symbol: string; year: number; quarter: number; net_profit: number; revenue: number; ebitda: number | null; total_debt: number | null; pe_ratio: number | null; pb_ratio: number | null; equity?: number; updated_at: string; source?: string }>>((acc, item) => {
      const key = `${item.symbol}-${item.year}-${item.quarter}`;
      if (acc.some((row) => `${row.symbol}-${row.year}-${row.quarter}` === key)) return acc;
      acc.push(item as { id: string; symbol: string; year: number; quarter: number; net_profit: number; revenue: number; ebitda: number | null; total_debt: number | null; pe_ratio: number | null; pb_ratio: number | null; equity?: number; updated_at: string; source?: string });
      return acc;
    }, [])
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, symbols.length === 1 ? 40 : 240);

  return NextResponse.json({ data: merged }, { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" } });
}
