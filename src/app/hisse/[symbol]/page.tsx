import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { AssetDetailClient } from "@/components/AssetDetailClient";
import { SpkBanner } from "@/components/SpkBanner";
import { Footer } from "@/components/Footer";
import { marketSymbolByCode, stockByTicker } from "@/data/marketSymbols";

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }): Promise<Metadata> {
  const { symbol } = await params;
  const ticker = decodeURIComponent(symbol).toUpperCase();
  const description = `${ticker} hisse senedi güncel fiyatı, F/K, PD/DD rasyoları, son çeyrek bilanço analizi ve güncel KAP bildirimleri.`;
  return {
    title: `${ticker} Canlı Fiyatı, Bilanço & KAP Haberleri`,
    description,
    alternates: { canonical: `https://piyasalab.com.tr/hisse/${encodeURIComponent(ticker)}` },
    openGraph: { title: `${ticker} Canlı Fiyatı, Bilanço & KAP Haberleri`, description, type: "article", url: `https://piyasalab.com.tr/hisse/${encodeURIComponent(ticker)}` },
    twitter: { card: "summary", title: `${ticker} Canlı Fiyatı, Bilanço & KAP Haberleri`, description },
  };
}

export default async function StockPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const ticker = decodeURIComponent(symbol).toUpperCase();
  const entry = stockByTicker.get(ticker) ?? null;
  const market = marketSymbolByCode.get(ticker) ?? null;
  if (!entry && !market) notFound();

  const jsonLd = { "@context": "https://schema.org", "@type": "FinancialProduct", name: market?.label ?? entry?.name ?? ticker, tickerSymbol: ticker, category: "Borsa İstanbul", url: `https://piyasalab.com.tr/hisse/${encodeURIComponent(ticker)}` };
  return <main className="app-bg min-h-screen"><Script id={`financial-product-${ticker}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><SpkBanner /><AssetDetailClient ticker={ticker} entry={entry} market={market} /><Footer /></main>;
}
