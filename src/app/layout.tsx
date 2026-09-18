import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdSenseConsent } from "@/components/AdSenseConsent";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VeriAkış | Borsa Getiri Hesaplama ve Enflasyon Araçları",
  description:
    "Borsa getiri hesaplama, enflasyon hesaplama, dolar bazlı reel getiri analizi, alım gücü simülatörü ve canlı piyasa forumu.",
  keywords: [
    "borsa getiri hesaplama",
    "enflasyon hesaplama",
    "dolar bazlı reel getiri",
    "alım gücü hesaplama",
    "BIST 100",
    "temettü yeniden yatırım",
    "piyasa sentiment",
  ],
  alternates: { canonical: "https://veriakis.com" },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "VeriAkış - Borsa, Enflasyon ve Reel Getiri Platformu",
    description:
      "Canlı BIST akışı, reel getiri araçları, nostalji simülatörü, viral mini oyunlar ve topluluk forumu.",
    type: "website",
    locale: "tr_TR",
    url: "https://veriakis.com",
    siteName: "VeriAkış",
  },
  twitter: {
    card: "summary_large_image",
    title: "VeriAkış",
    description: "Borsa ve enflasyon odaklı interaktif finans platformu.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const faqData = [
  {
    question: "BIST getiri hesaplama nasıl yapılır?",
    answer:
      "Başlangıç tutarı ve yıl seçilir, ardından BIST 100 seçeneğiyle dönem sonu değer, bileşik getiri ve enflasyondan arındırılmış sonuçlar hesaplanır.",
  },
  {
    question: "DRIP açıkken ne değişir?",
    answer:
      "DRIP açıldığında temettüler pozisyona tekrar eklenir ve bileşik etki güçlenir. Kapalıyken temettü nakit olarak ayrı izlenir.",
  },
  {
    question: "Dolar bazlı reel getiri neyi gösterir?",
    answer:
      "Nominal USD getirisinden ABD TÜFE etkisi düşülerek uluslararası alım gücü açısından daha gerçekçi bir performans sunulur.",
  },
];

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "VeriAkış",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: "https://veriakis.com",
  description:
    "Borsa İstanbul getiri hesaplama, enflasyon düzeltme, dolar bazlı reel kazanç ve topluluk sentiment araçları.",
  inLanguage: "tr-TR",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Borsa İstanbul Getiri Hesaplama, Enflasyon ve Dolar Bazlı Reel Kazançlar",
  author: { "@type": "Organization", name: "VeriAkış" },
  publisher: { "@type": "Organization", name: "VeriAkış" },
  inLanguage: "tr-TR",
  mainEntityOfPage: "https://veriakis.com",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang="tr" className={`h-full antialiased ${spaceGrotesk.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="app-text min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
      <AdSenseConsent client={adsenseClient} />
      <Script id="jsonld-webapp" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <Script id="jsonld-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="jsonld-article" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
    </html>
  );
}