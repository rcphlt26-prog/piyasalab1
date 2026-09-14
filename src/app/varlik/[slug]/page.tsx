import type { Metadata } from "next";
import { AssetDetailClient } from "@/components/AssetDetailClient";
import { SpkBanner } from "@/components/SpkBanner";
import { Footer } from "@/components/Footer";
import { stockByTicker } from "@/data/marketSymbols";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ticker = decodeURIComponent(slug).toUpperCase();
  const entry = stockByTicker.get(ticker);
  const name = entry?.name ?? ticker;
  return {
    title: `${ticker} - ${name} | Piyasalab`,
    description: `${ticker} (${name}) için grafik, temel bilgiler, hisse karnesi ve güncel haberler. Bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.`,
  };
}

export default async function AssetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ticker = decodeURIComponent(slug).toUpperCase();
  const entry = stockByTicker.get(ticker) ?? null;

  return (
    <main className="app-bg min-h-screen">
      <SpkBanner />
      <AssetDetailClient ticker={ticker} entry={entry} />
      <Footer />
    </main>
  );
}
