import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getKapFallback } from "@/data/kapFeedData";

type KapItem = {
  id: string;
  title: string;
  summary: string | null;
  kap_url: string;
  related_symbols: string[];
  category: string | null;
  publish_date: string;
  source: "kap.org.tr" | "supabase" | "cache";
};

const KAP_HEADERS = {
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0 (compatible; VeriAkisBot/1.0)",
  Referer: "https://www.kap.org.tr/",
};

function dedupeAndSort(data: KapItem[], limit: number) {
  return data
    .reduce<KapItem[]>((acc, item) => {
      const key = item.id || `${item.title}-${item.publish_date}-${item.related_symbols.join(",")}`;
      if (acc.some((row) => (row.id || `${row.title}-${row.publish_date}-${row.related_symbols.join(",")}`) === key)) return acc;
      acc.push(item);
      return acc;
    }, [])
    .sort((a, b) => b.publish_date.localeCompare(a.publish_date))
    .slice(0, limit);
}

function toIsoDate(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function normalizeKapPayload(payload: unknown, symbols: string[], limit: number): KapItem[] {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] })?.data)
      ? (payload as { data: unknown[] }).data
      : Array.isArray((payload as { items?: unknown[] })?.items)
        ? (payload as { items: unknown[] }).items
        : [];

  const normalized = list.reduce<KapItem[]>((acc, raw) => {
    const item = raw as Record<string, unknown>;
    const code = String(
      item.companyCode ?? item.stockCode ?? item.symbol ?? item.ticker ?? "",
    ).trim().toUpperCase();

    if (symbols.length && code && !symbols.includes(code)) return acc;

    const disclosureId = String(item.disclosureIndex ?? item.id ?? item.oid ?? item.uuid ?? "").trim();
    const title = String(item.title ?? item.headline ?? item.subject ?? "KAP bildirimi").trim();
    if (!title) return acc;

    const publishDate = toIsoDate(item.publishDate ?? item.date ?? item.createdAt ?? item.createdDate);
    const kapUrl = String(item.url ?? item.disclosureUrl ?? "").trim() || (disclosureId ? `https://www.kap.org.tr/tr/Bildirim/${disclosureId}` : "https://www.kap.org.tr/tr/bildirim-sorgu");

    acc.push({
      id: disclosureId || `${code || "GEN"}-${title}-${publishDate}`,
      title,
      summary: typeof item.summary === "string"
        ? item.summary
        : typeof item.description === "string"
          ? item.description
          : null,
      kap_url: kapUrl,
      related_symbols: code ? [code] : symbols,
      category: typeof item.category === "string"
        ? item.category
        : typeof item.disclosureClass === "string"
          ? item.disclosureClass
          : null,
      publish_date: publishDate,
      source: "kap.org.tr",
    });

    return acc;
  }, []);

  return dedupeAndSort(normalized, limit);
}

async function fetchKapOrgDisclosures(symbols: string[], limit: number) {
  const stockCodes = symbols.join(",");
  const urls = [
    `https://www.kap.org.tr/tr/api/disclosures/index?stockCodes=${encodeURIComponent(stockCodes)}`,
    `https://www.kap.org.tr/tr/api/disclosures?stockCodes=${encodeURIComponent(stockCodes)}`,
    "https://www.kap.org.tr/tr/api/disclosures/index",
    "https://www.kap.org.tr/tr/api/disclosures",
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: KAP_HEADERS,
        cache: "no-store",
      });

      if (!response.ok) continue;

      const payload = await response.json();
      const normalized = normalizeKapPayload(payload, symbols, limit);
      if (normalized.length) return normalized;
    } catch {
      // bir sonraki endpoint denenecek
    }
  }

  return null;
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const symbols = Array.from(new Set((searchParams.get("symbols") ?? searchParams.get("symbol") ?? "")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)));

  if (!symbols.length) {
    return NextResponse.json({ data: [], error: "symbol veya symbols gerekli." }, { status: 400 });
  }

  const limit = symbols.length === 1 ? 20 : 120;

  const kapOrgData = await fetchKapOrgDisclosures(symbols, limit);
  if (kapOrgData && kapOrgData.length) {
    return NextResponse.json(
      { data: kapOrgData },
      { headers: { "Cache-Control": "no-store, no-cache, max-age=0" } },
    );
  }

  const fallback = getKapFallback(symbols, limit).map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    kap_url: item.kapUrl,
    related_symbols: [item.symbol],
    category: item.category,
    publish_date: item.publishDate,
    source: "cache" as const,
  }));

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { data: fallback },
      { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" } },
    );
  }

  let query = supabase
    .from("kap_notifications")
    .select("id, title, summary, kap_url, related_symbols, category, publish_date")
    .order("publish_date", { ascending: false });

  query = symbols.length === 1
    ? query.contains("related_symbols", symbols)
    : query.overlaps("related_symbols", symbols);

  const { data, error } = await query.limit(limit);
  if (error) {
    return NextResponse.json(
      { data: fallback },
      { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" } },
    );
  }

  const supabaseData: KapItem[] = (data ?? []).map((item) => ({
    id: String(item.id),
    title: item.title,
    summary: item.summary,
    kap_url: item.kap_url,
    related_symbols: item.related_symbols,
    category: item.category,
    publish_date: item.publish_date,
    source: "supabase",
  }));

  const merged = dedupeAndSort([...supabaseData, ...fallback], limit);

  return NextResponse.json(
    { data: merged },
    { headers: { "Cache-Control": "private, max-age=120, stale-while-revalidate=300" } },
  );
}
