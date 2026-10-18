import type { Metadata } from "next";
import { GamesSection } from "@/components/sections/GamesSection";
import { SpkBanner } from "@/components/SpkBanner";
import { Footer } from "@/components/Footer";

const canonical = "https://veriakis.com/oyunlar";
const title = "Finans Simülasyon Oyunları";
const description = "VeriAkış finans oyunları ile piyasa senaryolarını test edin: pişmanlık ölçeri, hisse düellosu, risk profili ve portföy simülatörü.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: {
    title: `${title} | VeriAkış`,
    description,
    url: canonical,
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "VeriAkış Finans Oyunları" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | VeriAkış`,
    description,
    images: ["/api/og"],
  },
};

export default function GamesPage() {
  return (
    <main className="app-bg min-h-screen">
      <SpkBanner />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <GamesSection />
      </div>
      <Footer />
    </main>
  );
}
