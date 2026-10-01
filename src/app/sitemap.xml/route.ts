import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const baseUrl = "https://veriakis.com";
  const lastModified = new Date().toISOString();
  const urls = [
    "",
    "/rehber",
    "/gizlilik-politikasi",
    "/kullanim-kosullari",
    "/sorumluluk-reddi",
    "/iletisim",
    "/rehber/temettu-emekliligi-ve-birikim-stratejileri",
    "/rehber/reel-kazanc-nedir-enflasyondan-korunma",
    "/rehber/fk-ve-pddd-oranlari-nasil-yorumlanir",
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map((url) => `
    <url>
      <loc>${baseUrl}${url}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>${url === "" ? "daily" : "weekly"}</changefreq>
      <priority>${url === "" ? "1.0" : "0.8"}</priority>
    </url>
  `)
    .join("")}
</urlset>`;

  return new NextResponse(xml.trim(), {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}