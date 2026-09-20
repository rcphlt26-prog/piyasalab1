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
  metadataBase: new URL("https://veriakis.com"),
  title: {
    default: "Veri Akış | Canlı Borsa, Piyasa ve Portföy Takip Platformu",
    template: "%s | VeriAkış",
  },
  description:
    "Veri Akış (veriakis.com) ile borsa, hisse senetleri, döviz ve piyasa verilerini canlı takip edin. Portföyünüzü ücretsiz yönetin.",
  keywords: [
    "veri akış", "veri akışı", "veriakis", "veriakis.com", "borsa takip", "canlı piyasa", "portföy yönetimi",
  ],
  authors: [{ name: "VeriAkış" }],
  creator: "VeriAkış",
  publisher: "VeriAkış",
  alternates: { canonical: "https://veriakis.com" },
  icons: {
    icon: "/gemini-svg.svg",
    shortcut: "/gemini-svg.svg",
    apple: "/gemini-svg.svg",
  },
  openGraph: {
    title: "VeriAkış | Canlı BIST100 ve Finans Analizi",
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
    description: "Canlı BIST100, portföy takibi, KAP haberleri ve finans araçları.",
    images: ["/gemini-svg.svg"],
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VeriAkış",
  url: "https://veriakis.com",
  logo: "https://veriakis.com/gemini-svg.svg",
  email: "rcphlt26@gmail.com",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Veri Akış",
  alternateName: ["VeriAkis", "veriakis.com", "Veri Akışı"],
  url: "https://veriakis.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://veriakis.com/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-7925528729215112";

  return (
    <html lang="tr" className={`h-full antialiased ${spaceGrotesk.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="app-text min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <Script
          id="adsense-loader"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
        />
        <AdSenseConsent client={adsenseClient} />
        <Script id="jsonld-webapp" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
        <Script id="jsonld-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <Script id="jsonld-article" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <Script id="jsonld-organization" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <Script id="jsonld-website" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      </body>
    </html>
  );
}