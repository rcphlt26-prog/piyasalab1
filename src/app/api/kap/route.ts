import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getKapFallback } from "@/data/kapFeedData";

export const revalidate = 60;

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const symbols = Array.from(new Set((searchParams.get("symbols") ?? searchParams.get("symbol") ?? "")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)));
  if (!symbols.length) return NextResponse.json({ data: [], error: "symbol veya symbols gerekli." }, { status: 400 });

  const fallback = getKapFallback(symbols, symbols.length === 1 ? 20 : 120).map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    kap_url: item.kapUrl,
    related_symbols: [item.symbol],
    category: item.category,
    publish_date: item.publishDate,
    source: "cache",
  }));

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ data: fallback }, { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" } });
  }

  let query = supabase
    .from("kap_notifications")
    .select("id, title, summary, kap_url, related_symbols, category, publish_date")
    .order("publish_date", { ascending: false });
  query = symbols.length === 1
    ? query.contains("related_symbols", symbols)
    : query.overlaps("related_symbols", symbols);

  const { data, error } = await query.limit(symbols.length === 1 ? 20 : 120);
  if (error) {
    return NextResponse.json({ data: fallback }, { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" } });
  }

  const merged = [...(data ?? []), ...fallback]
    .reduce<Array<{ id: string; title: string; summary: string | null; kap_url: string; related_symbols: string[]; category: string | null; publish_date: string; source?: string }>>((acc, item) => {
      const key = `${item.title}-${item.publish_date}`;
      if (acc.some((row) => `${row.title}-${row.publish_date}` === key)) return acc;
      acc.push(item as { id: string; title: string; summary: string | null; kap_url: string; related_symbols: string[]; category: string | null; publish_date: string; source?: string });
      return acc;
    }, [])
    .sort((a, b) => b.publish_date.localeCompare(a.publish_date))
    .slice(0, symbols.length === 1 ? 20 : 120);

  return NextResponse.json({ data: merged }, { headers: { "Cache-Control": "private, max-age=120, stale-while-revalidate=300" } });
}
