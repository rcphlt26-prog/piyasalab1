import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdSenseConsent } from "@/components/AdSenseConsent";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MarketSidebar } from "@/components/MarketSidebar";
import { siteFaqItems } from "@/data/faqs";
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
  alternates: { canonical: "./" },
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
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "VeriAkış | Canlı Finans Merkezi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VeriAkış",
    description: "Canlı BIST100, portföy takibi, KAP haberleri ve finans araçları.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VeriAkış",
  url: "https://veriakis.com",
  description: "Canlı piyasa akışı, finansal okuryazarlık rehberleri ve hesaplama araçları sunan bilgilendirme platformu.",
  inLanguage: "tr-TR",
};

const financialServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "VeriAkış",
  url: "https://veriakis.com",
  areaServed: "TR",
  serviceType: "Finansal okuryazarlık içerikleri, piyasa veri görselleştirme ve yatırım hesaplama araçları",
  description: "VeriAkış içerikleri bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.",
  publisher: {
    "@type": "Organization",
    name: "VeriAkış",
    url: "https://veriakis.com",
  },
};

const faqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: siteFaqItems.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-7925528729215112";

  return (
    <html lang="tr" className={`antialiased ${spaceGrotesk.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="app-text min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
        <MarketSidebar />
        <Analytics />
        <SpeedInsights />
        <Script
          id="adsense-loader"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
        />
        <AdSenseConsent client={adsenseClient} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(financialServiceJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }} />
      </body>
    </html>
  );
}