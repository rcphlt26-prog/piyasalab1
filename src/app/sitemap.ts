import type { MetadataRoute } from "next";
import { marketSymbols, stockDirectory } from "@/data/marketSymbols";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://veriakis.com";
  const lastModified = new Date("2026-09-19T00:00:00.000Z");
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
    ...["hesaplayicilar", "iletisim", "gizlilik", "cerezler", "kullanim-sartlari", "yasal-uyari"].map((path) => ({
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
    ...symbols.map((symbol) => ({
      url: `${siteUrl}/hisse/${encodeURIComponent(symbol)}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
