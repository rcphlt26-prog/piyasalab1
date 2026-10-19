import type { Metadata } from "next";
import { SeoCalculator } from "@/components/calculators/SeoCalculator";

export const metadata: Metadata = {
  title: "Hisse vs Altın Hesaplama: 100.000 TL 5 Yıl Önce Ne Oldu?",
  description: "100.000 TL'nin BIST 100 veya Gram Altın yatırımında yaklaşık bugün ne kadar olacağını karşılaştırın.",
  alternates: { canonical: "https://veriakis.com/hesaplayicilar/hisse-vs-altin" },
  openGraph: {
    title: "Hisse vs Altın Hesaplama: 100.000 TL 5 Yıl Önce Ne Oldu? | VeriAkış",
    description: "100.000 TL'nin BIST 100 veya Gram Altın yatırımında yaklaşık bugün ne kadar olacağını karşılaştırın.",
    url: "https://veriakis.com/hesaplayicilar/hisse-vs-altin",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Hisse vs Altın Hesaplama: 100.000 TL 5 Yıl Önce Ne Oldu?" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hisse vs Altın Hesaplama: 100.000 TL 5 Yıl Önce Ne Oldu? | VeriAkış",
    description: "100.000 TL'nin BIST 100 veya Gram Altın yatırımında yaklaşık bugün ne kadar olacağını karşılaştırın.",
    images: ["/api/og"],
  },
};

export default function StockVsGoldPage() {
  return <main className="app-bg min-h-screen px-4 py-10"><SeoCalculator mode="stockGold" title="Hisse vs Altın: 100.000 TL 5 Yıl Önce Ne Oldu?" intro="Aynı başlangıç tutarını BIST 100 ve Gram Altın ile karşılaştırın; tarihsel performans farkını tek ekranda görün." /></main>;
}
