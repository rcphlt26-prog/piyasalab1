"use client";

import { useState } from "react";
import { LineChart, Calculator, ClipboardList, MessagesSquare, Gamepad2, Newspaper, Info, TrendingUp, Menu, X } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SpkBanner } from "@/components/SpkBanner";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { MarketSection } from "@/components/sections/MarketSection";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { ScorecardSection } from "@/components/sections/ScorecardSection";
import { ForumSection } from "@/components/sections/ForumSection";
import { GamesSection } from "@/components/sections/GamesSection";
import { NewsSection } from "@/components/sections/NewsSection";
import { AboutSection } from "@/components/sections/AboutSection";

type TabId = "piyasa" | "hesaplayici" | "karne" | "forum" | "oyunlar" | "haberler" | "hakkinda";

const tabs: Array<{ id: TabId; label: string; icon: typeof LineChart }> = [
  { id: "piyasa", label: "Piyasa", icon: LineChart },
  { id: "hesaplayici", label: "Hesaplayıcı", icon: Calculator },
  { id: "karne", label: "Hisse Karnesi", icon: ClipboardList },
  { id: "forum", label: "Forum", icon: MessagesSquare },
  { id: "oyunlar", label: "Oyunlar", icon: Gamepad2 },
  { id: "haberler", label: "Haberler", icon: Newspaper },
  { id: "hakkinda", label: "Hakkında", icon: Info },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("piyasa");
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNavigate(tab: string) {
    const match = tabs.find((t) => t.id === tab);
    if (match) {
      setActiveTab(match.id);
      setMobileOpen(false);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <main className="app-bg min-h-screen">
      <SpkBanner />

      {/* Header */}
      <header className="app-surface app-border sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center gap-3">
            <button
              onClick={() => handleNavigate("piyasa")}
              className="flex shrink-0 items-center gap-2"
              aria-label="Piyasalab ana sayfa"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
                <TrendingUp className="h-5 w-5" />
              </span>
              <span className="brand-gradient text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                Piyasalab
              </span>
            </button>

            <div className="mx-auto hidden max-w-md flex-1 md:block">
              <SearchBar onNavigateTab={handleNavigate} />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="app-border app-text rounded-lg border p-2 md:hidden"
                aria-label="Menüyü aç/kapat"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobil arama */}
          <div className="pb-3 md:hidden">
            <SearchBar onNavigateTab={handleNavigate} />
          </div>

          {/* Sekmeler - masaüstü */}
          <nav className="no-scrollbar hidden gap-1 overflow-x-auto pb-2 md:flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavigate(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active ? "bg-[var(--color-primary)] text-white" : "app-text-secondary hover:app-surface-2"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sekmeler - mobil açılır */}
        {mobileOpen ? (
          <nav className="app-surface app-border border-t px-4 py-2 md:hidden">
            <div className="grid grid-cols-2 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigate(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active ? "bg-[var(--color-primary)] text-white" : "app-text-secondary hover:app-surface-2"
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>
        ) : null}
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <AdSlot label="Üst Leaderboard" width={728} height={90} className="mb-4" />

        <div className="space-y-6">
          {activeTab === "piyasa" ? <MarketSection /> : null}
          {activeTab === "hesaplayici" ? <CalculatorSection /> : null}
          {activeTab === "karne" ? <ScorecardSection /> : null}
          {activeTab === "forum" ? <ForumSection /> : null}
          {activeTab === "oyunlar" ? <GamesSection /> : null}
          {activeTab === "haberler" ? <NewsSection /> : null}
          {activeTab === "hakkinda" ? <AboutSection /> : null}
        </div>
      </div>

      <Footer />
    </main>
  );
}
