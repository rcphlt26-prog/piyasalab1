import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssetDetailClient } from "@/components/AssetDetailClient";
import { SpkBanner } from "@/components/SpkBanner";
import { Footer } from "@/components/Footer";
import { stockByTicker, marketSymbolByCode, getMarketPriceMeta } from "@/data/marketSymbols";

const isStockAsset = (ticker: string) => {
  const market = marketSymbolByCode.get(ticker);
  return market ? market.category === "hisse" : stockByTicker.has(ticker);
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ticker = decodeURIComponent(slug).toUpperCase();
  const name = stockByTicker.get(ticker)?.name ?? marketSymbolByCode.get(ticker)?.label ?? ticker;
  const stock = isStockAsset(ticker);
  // Hisseler /hisse/ adresinde kanonikleşir; diğer varlıklar kendi /varlik/ adresinde kalır.
  const canonical = `https://veriakis.com/${stock ? "hisse" : "varlik"}/${encodeURIComponent(ticker)}`;
  const title = stock ? `${ticker} Hisse Fiyatı, Grafik ve Finansal Tablolar` : `${name} Canlı Fiyatı ve Grafik`;
  const socialTitle = `${title} | VeriAkış`;
  const description = stock
    ? `${name} (${ticker}) hisse fiyatı, tarihsel fiyat grafiği, finansal tablo verileri ve KAP bildirimleri VeriAkış'ta. Yatırım yapmadan önce araştır.`
    : `${name} (${ticker}) güncel fiyatı ve tarihsel fiyat grafiği VeriAkış'ta. Yatırım yapmadan önce araştır.`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: socialTitle, description, type: "article", url: canonical, images: [{ url: `/api/og?ticker=${encodeURIComponent(ticker)}`, width: 1200, height: 630, alt: `${ticker} VeriAkış piyasa kartı` }] },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [`/api/og?ticker=${encodeURIComponent(ticker)}`] },
  };
}

export default async function AssetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ticker = decodeURIComponent(slug).toUpperCase();
  const entry = stockByTicker.get(ticker) ?? null;
  const market = marketSymbolByCode.get(ticker) ?? null;

  if (!entry && !market) notFound();

  const stock = isStockAsset(ticker);
  const category = stock && getMarketPriceMeta(market).currency === "TRY" ? "Borsa İstanbul" : stock ? "Hisse Senedi" : "Piyasa Varlığı";
  const jsonLd = { "@context": "https://schema.org", "@type": "FinancialProduct", name: market?.label ?? entry?.name ?? ticker, tickerSymbol: ticker, category, url: `https://veriakis.com/${stock ? "hisse" : "varlik"}/${encodeURIComponent(ticker)}` };

  return (
    <main className="app-bg min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SpkBanner />
      <AssetDetailClient ticker={ticker} entry={entry} market={market} />
      <Footer />
    </main>
  );
}
