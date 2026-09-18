import type { Metadata } from "next";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { AuthSuccessToast } from "@/components/AuthSuccessToast";

export const metadata: Metadata = {
  title: "Portföyüm | VeriAkış",
  description: "Kişisel portföyünüzü ve canlı performansınızı takip edin.",
};

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ auth?: string }> }) {
  const params = await searchParams;
  return (
    <main className="app-bg min-h-screen px-4 py-8">
      {params.auth === "verified" ? <AuthSuccessToast /> : null}
      <PortfolioSection />
    </main>
  );
}
