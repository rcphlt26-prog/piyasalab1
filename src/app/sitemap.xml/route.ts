import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { guideArticles } from "@/data/guideArticles";
import { marketSymbols, stockByTicker } from "@/data/marketSymbols";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const BASE_URL = "https://veriakis.com";

type SitemapEntry = {
  url: string;
  lastModified?: string;
  changeFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const urls: SitemapEntry[] = [
    { url: "", changeFrequency: "daily", priority: 1.0 },
    { url: "/rehber", changeFrequency: "weekly", priority: 0.8 },
    { url: "/hesaplayicilar/bilesik-getiri", changeFrequency: "monthly", priority: 0.7 },
    { url: "/hesaplayicilar/hisse-vs-altin", changeFrequency: "monthly", priority: 0.7 },
    { url: "/hesaplayicilar/maliyet-ortalamasi", changeFrequency: "monthly", priority: 0.7 },
    { url: "/hesaplayicilar/temettu-getirisi", changeFrequency: "monthly", priority: 0.7 },
    { url: "/gizlilik-politikasi", changeFrequency: "yearly", priority: 0.3 },
    { url: "/kullanim-kosullari", changeFrequency: "yearly", priority: 0.3 },
    { url: "/sorumluluk-reddi", changeFrequency: "yearly", priority: 0.3 },
    { url: "/iletisim", changeFrequency: "yearly", priority: 0.4 },
  ];

  // 1. Rehber yazıları
  for (const article of guideArticles) {
    if (!article.slug) continue;
    urls.push({
      url: `/rehber/${encodeURIComponent(article.slug)}`,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // 2. Hisse ve varlık sayfaları
  for (const asset of marketSymbols) {
    const code = asset.code?.trim();
    if (!code || code.includes(" ")) continue;

    const isStock = stockByTicker.has(code);
    urls.push({
      url: `/${isStock ? "hisse" : "varlik"}/${encodeURIComponent(code)}`,
      changeFrequency: "daily",
      priority: isStock ? 0.9 : 0.7,
    });
  }

  // 3. Haber sayfaları (Güvenli limit)
  try {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase
        .from("news")
        .select("slug, news_date")
        .not("slug", "is", null)
        .order("news_date", { ascending: false })
        .limit(1000);

      for (const news of data ?? []) {
        if (!news.slug) continue;
        urls.push({
          url: `/haber/${encodeURIComponent(news.slug)}`,
          lastModified: news.news_date ? new Date(news.news_date).toISOString() : undefined,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    }
  } catch {
    // Hata durumunda sitemap'in çökmesini engelle
  }

  // Aynı URL'lerin mükerrer eklenmesini önle
  const uniqueUrls = Array.from(
    new Map(urls.map((item) => [item.url, item])).values()
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls
  .map(
    (item) => `  <url>
    <loc>${escapeXml(`${BASE_URL}${item.url}`)}</loc>
    ${item.lastModified ? `<lastmod>${item.lastModified}</lastmod>` : ""}
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority?.toFixed(1) ?? "0.7"}</priority>
  </url>`
  )
  .join("")}
</urlset>`;

  return new NextResponse(xml.trim(), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}