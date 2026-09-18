import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const calculatorPaths = [
    "hesaplayicilar/bilesik-getiri",
    "hesaplayicilar/temettu-getirisi",
    "hesaplayicilar/maliyet-ortalamasi",
    "hesaplayicilar/hisse-vs-altin",
  ];

  return [
    {
      url: "https://veriakis.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...["gizlilik", "cerezler", "kullanim-sartlari", "yasal-uyari", "iletisim"].map((path) => ({
      url: `https://veriakis.com/${path}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...calculatorPaths.map((path) => ({
      url: `https://veriakis.com/${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
