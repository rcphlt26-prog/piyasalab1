import type { Metadata } from "next";
import { SeoCalculator } from "@/components/calculators/SeoCalculator";

export const metadata: Metadata = {
  title: "Bileşik Getiri Hesaplama",
  description: "Başlangıç paranızın BIST 100 ve farklı dönemlerde bileşik getiriyle bugün ne kadar olacağını hesaplayın.",
  alternates: { canonical: "https://veriakis.com/hesaplayicilar/bilesik-getiri" },
};

export default function CompoundReturnPage() {
  return <main className="app-bg min-h-screen px-4 py-10"><SeoCalculator mode="compound" title="Bileşik Getiri Hesaplama" intro="Başlangıç tutarı ve tarih aralığını seçin; tarihsel BIST 100 performansına göre paranızın yaklaşık bugünkü değerini görün." /></main>;
}
