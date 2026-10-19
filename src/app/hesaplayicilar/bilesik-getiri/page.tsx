import type { Metadata } from "next";
import { SeoCalculator } from "@/components/calculators/SeoCalculator";

export const metadata: Metadata = {
  title: "Bileşik Getiri Hesaplama",
  description: "Başlangıç paranızın BIST 100 ve farklı dönemlerde bileşik getiriyle bugün ne kadar olacağını hesaplayın.",
  alternates: { canonical: "https://veriakis.com/hesaplayicilar/bilesik-getiri" },
  openGraph: {
    title: "Bileşik Getiri Hesaplama | VeriAkış",
    description: "Başlangıç paranızın BIST 100 ve farklı dönemlerde bileşik getiriyle bugün ne kadar olacağını hesaplayın.",
    url: "https://veriakis.com/hesaplayicilar/bilesik-getiri",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Bileşik Getiri Hesaplama" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bileşik Getiri Hesaplama | VeriAkış",
    description: "Başlangıç paranızın BIST 100 ve farklı dönemlerde bileşik getiriyle bugün ne kadar olacağını hesaplayın.",
    images: ["/api/og"],
  },
};

export default function CompoundReturnPage() {
  return <main className="app-bg min-h-screen px-4 py-10"><SeoCalculator mode="compound" title="Bileşik Getiri Hesaplama" intro="Başlangıç tutarı ve tarih aralığını seçin; tarihsel BIST 100 performansına göre paranızın yaklaşık bugünkü değerini görün." /></main>;
}
