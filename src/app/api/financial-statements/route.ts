import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 300;

export async function GET(request: Request) {
  const symbol = new URL(request.url).searchParams.get("symbol")?.trim().toUpperCase();
  if (!symbol) return NextResponse.json({ data: [], error: "symbol gerekli." }, { status: 400 });
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ data: [], error: "Supabase yapılandırılmamış." }, { status: 503 });

  const { data, error } = await supabase
    .from("financial_statements")
    .select("id, symbol, year, quarter, net_profit, revenue, ebitda, total_debt, pe_ratio, pb_ratio, updated_at")
    .eq("symbol", symbol)
    .order("year", { ascending: true })
    .order("quarter", { ascending: true })
    .limit(40);
  if (error) return NextResponse.json({ data: [], error: "Finansal tablolar alınamadı." }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}
