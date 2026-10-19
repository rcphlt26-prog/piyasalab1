import type { Metadata } from "next";
import { SeoCalculator } from "@/components/calculators/SeoCalculator";

export const metadata: Metadata = {
  title: "Maliyet Ortalaması Hesaplama",
  description: "Düzenli alımlarda toplam yatırımınızı ve yaklaşık ortalama maliyetinizi hesaplayın.",
  alternates: { canonical: "https://veriakis.com/hesaplayicilar/maliyet-ortalamasi" },
  openGraph: {
    title: "Maliyet Ortalaması Hesaplama | VeriAkış",
    description: "Düzenli alımlarda toplam yatırımınızı ve yaklaşık ortalama maliyetinizi hesaplayın.",
    url: "https://veriakis.com/hesaplayicilar/maliyet-ortalamasi",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Maliyet Ortalaması Hesaplama" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maliyet Ortalaması Hesaplama | VeriAkış",
    description: "Düzenli alımlarda toplam yatırımınızı ve yaklaşık ortalama maliyetinizi hesaplayın.",
    images: ["/api/og"],
  },
};

export default function AverageCostPage() {
  return <main className="app-bg min-h-screen px-4 py-10"><SeoCalculator mode="average" title="Maliyet Ortalaması Hesaplama" intro="Aylık yatırım tutarınızı ve alış fiyatınızı girerek düzenli alım planınızın yaklaşık maliyetini görün." /></main>;
}
