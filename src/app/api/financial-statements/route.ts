import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 300;

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const symbols = Array.from(new Set((searchParams.get("symbols") ?? searchParams.get("symbol") ?? "")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)));
  if (!symbols.length) return NextResponse.json({ data: [], error: "symbol veya symbols gerekli." }, { status: 400 });
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ data: [], error: "Supabase yapılandırılmamış." }, { status: 503 });

  let query = supabase
    .from("financial_statements")
    .select("id, symbol, year, quarter, net_profit, revenue, ebitda, total_debt, pe_ratio, pb_ratio, updated_at");
  query = symbols.length === 1
    ? query.eq("symbol", symbols[0])
      .order("year", { ascending: true })
      .order("quarter", { ascending: true })
    : query.in("symbol", symbols).order("updated_at", { ascending: false });
  const { data, error } = await query.limit(symbols.length === 1 ? 40 : 240);
  if (error) return NextResponse.json({ data: [], error: "Finansal tablolar alınamadı." }, { status: 500 });
  return NextResponse.json({ data: data ?? [] }, { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=300" } });
}
