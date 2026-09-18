import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export async function GET(request: Request) {
  const ticker = new URL(request.url).searchParams.get("symbol")?.trim().toUpperCase();
  if (!ticker) return NextResponse.json({ data: [], error: "symbol gerekli." }, { status: 400 });
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ data: [], error: "Supabase yapılandırılmamış." }, { status: 503 });

  const { data, error } = await supabase
    .from("kap_notifications")
    .select("id, title, summary, kap_url, related_symbols, category, publish_date")
    .contains("related_symbols", [ticker])
    .order("publish_date", { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ data: [], error: "KAP bildirimleri alınamadı." }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}
