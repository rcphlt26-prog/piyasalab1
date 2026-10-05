import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdSenseConsent } from "@/components/AdSenseConsent";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MarketSidebar } from "@/components/MarketSidebar";
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
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-7925528729215112";

  return (
    <html lang="tr" className={`h-full antialiased ${spaceGrotesk.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="app-text min-h-full">
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      </body>
    </html>
  );
}