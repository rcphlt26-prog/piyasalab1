import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { AssetDetailClient } from "@/components/AssetDetailClient";
import { SpkBanner } from "@/components/SpkBanner";
import { Footer } from "@/components/Footer";
import { stockByTicker, marketSymbolByCode } from "@/data/marketSymbols";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ticker = decodeURIComponent(slug).toUpperCase();
  const entry = stockByTicker.get(ticker);
  const market = marketSymbolByCode.get(ticker);
  const name = market?.label ?? entry?.name ?? ticker;
  return {
    title: `${ticker} Canlı Fiyatı, Bilanço & KAP Haberleri`,
    description: `${ticker} hisse senedi güncel fiyatı, F/K, PD/DD rasyoları, son çeyrek bilanço analizi ve güncel KAP bildirimleri.`,
    alternates: { canonical: `https://piyasalab.com.tr/hisse/${encodeURIComponent(ticker)}` },
    openGraph: { title: `${ticker} Canlı Fiyatı, Bilanço & KAP Haberleri`, description: `${ticker} (${name}) için canlı fiyat, bilanço ve KAP analizleri.`, type: "article", url: `https://piyasalab.com.tr/hisse/${encodeURIComponent(ticker)}` },
    twitter: { card: "summary", title: `${ticker} Canlı Fiyatı, Bilanço & KAP Haberleri`, description: `${ticker} için canlı piyasa ve finansal analiz.` },
  };
}

export default async function AssetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ticker = decodeURIComponent(slug).toUpperCase();
  const entry = stockByTicker.get(ticker) ?? null;
  const market = marketSymbolByCode.get(ticker) ?? null;

  if (!entry && !market) notFound();

  const jsonLd = { "@context": "https://schema.org", "@type": "FinancialProduct", name: market?.label ?? entry?.name ?? ticker, tickerSymbol: ticker, category: "Borsa İstanbul", url: `https://piyasalab.com.tr/hisse/${encodeURIComponent(ticker)}` };

  return (
    <main className="app-bg min-h-screen">
      <Script id={`financial-product-${ticker}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SpkBanner />
      <AssetDetailClient ticker={ticker} entry={entry} market={market} />
      <Footer />
    </main>
  );
}
