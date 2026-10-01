import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

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
    .from("kap_notifications")
    .select("id, title, summary, kap_url, related_symbols, category, publish_date")
    .order("publish_date", { ascending: false });
  query = symbols.length === 1
    ? query.contains("related_symbols", symbols)
    : query.overlaps("related_symbols", symbols);
  const { data, error } = await query.limit(symbols.length === 1 ? 20 : 120);
  if (error) return NextResponse.json({ data: [], error: "KAP bildirimleri alınamadı." }, { status: 500 });
  return NextResponse.json({ data: data ?? [] }, { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=60" } });
}
