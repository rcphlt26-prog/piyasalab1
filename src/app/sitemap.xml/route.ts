import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { guideArticles } from "@/data/guideArticles";
import {
  marketSymbols,
  stockByTicker,
} from "@/data/marketSymbols";

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

function entry({
  url,
  lastModified,
  changeFrequency = "weekly",
  priority = 0.7,
}: SitemapEntry) {
  return `
    <url>
      <loc>${escapeXml(`${BASE_URL}${url}`)}</loc>
      ${lastModified ? `<lastmod>${escapeXml(lastModified)}</lastmod>` : ""}
      <changefreq>${changeFrequency}</changefreq>
      <priority>${priority.toFixed(1)}</priority>
    </url>`;
}

export async function GET() {
  const urls: SitemapEntry[] = [
    {
      url: "/",
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: "/rehber",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "/hesaplayicilar/bilesik-getiri",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "/hesaplayicilar/hisse-vs-altin",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "/hesaplayicilar/maliyet-ortalamasi",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "/hesaplayicilar/temettu-getirisi",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "/gizlilik-politikasi",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "/kullanim-kosullari",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "/sorumluluk-reddi",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "/iletisim",
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  // Rehber yazıları
  for (const article of guideArticles) {
    urls.push({
      url: `/rehber/${encodeURIComponent(article.slug)}`,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // Hisse ve diğer finansal varlık sayfaları
  for (const asset of marketSymbols) {
    const code = asset.code?.trim();

    if (!code) continue;

    const isStock = stockByTicker.has(code);

    urls.push({
      url: `/${isStock ? "hisse" : "varlik"}/${encodeURIComponent(code)}`,
      changeFrequency: "daily",
      priority: isStock ? 0.9 : 0.7,
    });
  }

  // Haber sayfaları
  try {
    const supabase = await getSupabaseServerClient();

    if (supabase) {
      const { data } = await supabase
        .from("news")
        .select("slug, news_date")
        .not("slug", "is", null)
        .order("news_date", { ascending: false })
        .limit(5000);

      for (const news of data ?? []) {
        if (!news.slug) continue;

        urls.push({
          url: `/haber/${encodeURIComponent(news.slug)}`,
          lastModified: news.news_date
            ? new Date(news.news_date).toISOString()
            : undefined,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // Haber verisi alınamazsa sitemap'in geri kalanı yine oluşturulur.
  }

  // Aynı URL'nin birden fazla kez eklenmesini önle
  const uniqueUrls = Array.from(
    new Map(urls.map((item) => [item.url, item])).values(),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map((entry) => `
  <url>
    <loc>${entry.url}</loc>
    ${entry.lastModified ? `<lastmod>${entry.lastModified}</lastmod>` : ""}
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>
`).join("")}
</urlset>`;

  return new NextResponse(xml.trim(), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}