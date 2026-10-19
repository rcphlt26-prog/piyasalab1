import type { Metadata } from "next";
import { SeoCalculator } from "@/components/calculators/SeoCalculator";

export const metadata: Metadata = {
  title: "Temettü Getirisi Hesaplama",
  description: "Temettü verimi ve yeniden yatırım etkisini kullanarak yatırımınızın yaklaşık değerini hesaplayın.",
  alternates: { canonical: "https://veriakis.com/hesaplayicilar/temettu-getirisi" },
  openGraph: {
    title: "Temettü Getirisi Hesaplama | VeriAkış",
    description: "Temettü verimi ve yeniden yatırım etkisini kullanarak yatırımınızın yaklaşık değerini hesaplayın.",
    url: "https://veriakis.com/hesaplayicilar/temettu-getirisi",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Temettü Getirisi Hesaplama" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Temettü Getirisi Hesaplama | VeriAkış",
    description: "Temettü verimi ve yeniden yatırım etkisini kullanarak yatırımınızın yaklaşık değerini hesaplayın.",
    images: ["/api/og"],
  },
};

export default function DividendReturnPage() {
  return <main className="app-bg min-h-screen px-4 py-10"><SeoCalculator mode="dividend" title="Temettü Getirisi Hesaplama" intro="Yıllık temettü verimi ve yeniden yatırım etkisini hesaba katarak uzun vadeli getiriyi sade biçimde inceleyin." /></main>;
}
