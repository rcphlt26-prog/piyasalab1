import type { Metadata } from "next";
import { PortfolioSection } from "@/components/sections/PortfolioSection";

export const metadata: Metadata = {
  title: "Portföyüm | VeriAkış",
  description: "Kişisel portföyünüzü ve canlı performansınızı takip edin.",
};

export default function PortfolioPage() {
  return (
    <main className="app-bg min-h-screen px-4 py-8">
      <PortfolioSection />
    </main>
  );
}
