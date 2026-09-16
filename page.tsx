import type { Metadata } from "next";
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
    title: `${ticker} - ${name} | VeriAkış`,
    description: `${ticker} (${name}) için canlı grafik, temel bilgiler ve güncel haberler. Bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.`,
  };
}

export default async function AssetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ticker = decodeURIComponent(slug).toUpperCase();
  const entry = stockByTicker.get(ticker) ?? null;
  const market = marketSymbolByCode.get(ticker) ?? null;

  return (
    <main className="app-bg min-h-screen">
      <SpkBanner />
      <AssetDetailClient ticker={ticker} entry={entry} market={market} />
      <Footer />
    </main>
  );
}
