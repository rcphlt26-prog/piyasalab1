import type { MetadataRoute } from "next";
import { marketSymbols, stockDirectory } from "@/data/marketSymbols";

export default function sitemap(): MetadataRoute.Sitemap {
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
      url: "https://piyasalab.com.tr",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...["gizlilik", "cerezler", "kullanim-sartlari", "yasal-uyari", "iletisim", "login", "register", "hesaplayicilar"].map((path) => ({
      url: `https://piyasalab.com.tr/${path}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...calculatorPaths.map((path) => ({
      url: `https://piyasalab.com.tr/${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...symbols.map((symbol) => ({
      url: `https://piyasalab.com.tr/hisse/${encodeURIComponent(symbol)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
