import type { MetadataRoute } from "next";
import { marketSymbols, stockDirectory } from "@/data/marketSymbols";
import { guideArticles } from "@/data/guideArticles";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://veriakis.com";
  const lastModified = new Date();
  const calculatorPaths = [
    "hesaplayicilar/bilesik-getiri",
    "hesaplayicilar/temettu-getirisi",
    "hesaplayicilar/maliyet-ortalamasi",
    "hesaplayicilar/hisse-vs-altin",
  ];

  const symbols = Array.from(new Set([
    ...marketSymbols.map((item) => item.code),
    ...stockDirectory.map((item) => item.ticker),
  ]));

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...["hesaplayicilar", "iletisim", "gizlilik", "gizlilik-politikasi", "cerezler", "kullanim-sartlari", "sorumluluk-reddi", "yasal-uyari", "rehber"].map((path) => ({
      url: `${siteUrl}/${path}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...calculatorPaths.map((path) => ({
      url: `${siteUrl}/${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...guideArticles.map((article) => ({
      url: `${siteUrl}/rehber/${article.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...symbols.map((symbol) => ({
      url: `${siteUrl}/hisse/${encodeURIComponent(symbol)}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
