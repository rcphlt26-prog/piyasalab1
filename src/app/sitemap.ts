import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://veriakis.com";
  const lastModified = new Date();
  const staticPaths = [
    "",
    "rehber",
    "gizlilik-politikasi",
    "kullanim-kosullari",
    "sorumluluk-reddi",
    "iletisim",
  ];
  const guideSlugs = [
    "temettu-emekliligi-ve-birikim-stratejileri",
    "reel-kazanc-nedir-enflasyondan-korunma",
    "fk-ve-pddd-oranlari-nasil-yorumlanir",
  ];
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: path ? `${siteUrl}/${path}` : `${siteUrl}/`,
    lastModified,
    changeFrequency: path ? "monthly" : "daily",
    priority: path ? 0.7 : 1,
  }));
  const guideEntries: MetadataRoute.Sitemap = guideSlugs.map((slug) => ({
    url: `${siteUrl}/rehber/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  return [
    ...staticEntries,
    ...guideEntries,
  ];
}
