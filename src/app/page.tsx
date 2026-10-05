"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { LineChart, Calculator, ClipboardList, MessagesSquare, Gamepad2, Newspaper, Info, Menu, X, BriefcaseBusiness, Star, ChevronDown } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SpkBanner } from "@/components/SpkBanner";
import { Footer } from "@/components/Footer";
import { OnlineUsers } from "@/components/OnlineUsers";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthPanel } from "@/components/AuthPanel";
import { HomeHero, HomeMarketSummary } from "@/components/HomeHero";
import { ParamNeOlurdu } from "@/components/ParamNeOlurdu";
import { Skeleton } from "@/components/ui/Skeleton";
import { HomePersonalPanel } from "@/components/HomePersonalPanel";
import { HomeDailyFlow } from "@/components/HomeDailyFlow";
import { HomeTools } from "@/components/HomeTools";
import { HomeStockCards, HomeNewsList } from "@/components/HomeTickerRail";

// Dynamic Import (Lazy Loading) - CPU Optimizasyonu İçin
const LoadingBox = () => (
  <div className="section-card space-y-3" aria-busy="true" aria-label="Bölüm yükleniyor">
    <Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-40 w-full" />
  </div>
);

const MarketSection = dynamic(() => import("@/components/sections/MarketSection").then(m => m.MarketSection), { loading: LoadingBox });
const CalculatorSection = dynamic(() => import("@/components/sections/CalculatorSection").then(m => m.CalculatorSection), { loading: LoadingBox });
const ForumSection = dynamic(() => import("@/components/sections/ForumSection").then(m => m.ForumSection), { loading: LoadingBox });
const GamesSection = dynamic(() => import("@/components/sections/GamesSection").then(m => m.GamesSection), { loading: LoadingBox });
const NewsSection = dynamic(() => import("@/components/sections/NewsSection").then(m => m.NewsSection), { loading: LoadingBox });
const AboutSection = dynamic(() => import("@/components/sections/AboutSection").then(m => m.AboutSection), { loading: LoadingBox });
const PortfolioSection = dynamic(() => import("@/components/sections/PortfolioSection").then(m => m.PortfolioSection), { loading: LoadingBox });
const WatchlistSection = dynamic(() => import("@/components/sections/WatchlistSection").then(m => m.WatchlistSection), { loading: LoadingBox });

type TabId = "piyasa" | "hesaplayici" | "hisseler" | "portfoy" | "izleme" | "forum" | "oyunlar" | "haberler" | "hakkinda";

const tabs: Array<{ id: TabId; label: string; icon: typeof LineChart }> = [
  { id: "piyasa", label: "Piyasa", icon: LineChart },
  { id: "hisseler", label: "Hisseler", icon: ClipboardList },
  { id: "hesaplayici", label: "Hesapla", icon: Calculator },
  { id: "portfoy", label: "Portföy", icon: BriefcaseBusiness },
  { id: "haberler", label: "Haberler", icon: Newspaper },
  { id: "izleme", label: "İzleme Listem", icon: Star },
  { id: "forum", label: "Forum", icon: MessagesSquare },
  { id: "oyunlar", label: "Oyunlar", icon: Gamepad2 },
  { id: "hakkinda", label: "Hakkında", icon: Info },
];

const primaryTabs = tabs.slice(0, 4);
const exploreTabs = tabs.slice(4);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("piyasa");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const supabase = getSupabaseBrowserClient();

  function handleNavigate(tab: string) {
    // Hisseler, ana sayfadaki hisse kartlarına kaydırır ("karne" eski adıdır).
    if (tab === "hisseler" || tab === "karne") {
      setActiveTab("piyasa");
      setMobileOpen(false);
      setExploreOpen(false);
      window.setTimeout(() => document.getElementById("hisseler")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      return;
    }
    const match = tabs.find((t) => t.id === tab);
    if (match) {
      setActiveTab(match.id);
      setMobileOpen(false);
      setExploreOpen(false);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <main className="app-bg min-h-screen">
      <SpkBanner />

      {/* Header */}
      <header className="app-surface app-border sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <button
            onClick={() => handleNavigate("piyasa")}
            className="flex shrink-0 items-center gap-2"
            aria-label="VeriAkış ana sayfa"
          >
            <Image src="/gemini-svg.svg" alt="" width={32} height={32} className="rounded-lg" priority />
            <span className="app-text text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
              VeriAkış
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
            {primaryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleNavigate(tab.id)}
                aria-current={tab.id === activeTab ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${tab.id === activeTab ? "bg-[var(--color-primary-dark)] text-white" : "app-text-secondary hover:app-surface-3"}`}
              >
                {tab.label}
              </button>
            ))}
            <div className="relative">
              <button
                onClick={() => setExploreOpen((value) => !value)}
                aria-expanded={exploreOpen}
                aria-haspopup="menu"
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${exploreTabs.some((tab) => tab.id === activeTab) ? "bg-[var(--color-primary-dark)] text-white" : "app-text-secondary hover:app-surface-3"}`}
              >
                Keşfet <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
              {exploreOpen ? (
                <>
                  <button type="button" aria-label="Menüyü kapat" className="fixed inset-0 z-40 cursor-default" onClick={() => setExploreOpen(false)} />
                  <div role="menu" className="app-surface app-border absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border p-1.5 shadow-lg">
                    {exploreTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button key={tab.id} role="menuitem" onClick={() => handleNavigate(tab.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${tab.id === activeTab ? "app-surface-3 app-text font-semibold" : "app-text-secondary hover:app-surface-3"}`}>
                          <Icon className="h-4 w-4" aria-hidden="true" /> {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </nav>

          <div className="ml-auto hidden w-64 md:block xl:w-80">
            <SearchBar onNavigateTab={handleNavigate} />
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <div className="hidden xl:block"><OnlineUsers supabase={supabase} /></div>
            <AuthPanel />
            <div className="max-[400px]:hidden"><ThemeToggle /></div>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="app-border app-text inline-flex h-10 w-10 items-center justify-center rounded-lg border lg:hidden"
              aria-label="Menüyü aç/kapat"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <nav className="app-surface app-border max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t px-4 py-3 lg:hidden" aria-label="Mobil menü">
            <div className="mb-3 flex items-center justify-between min-[400px]:hidden">
              <span className="app-muted text-xs">Tema</span>
              <ThemeToggle />
            </div>
            <div className="mb-3 md:hidden">
              <SearchBar onNavigateTab={handleNavigate} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigate(tab.id)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium transition ${
                      active ? "bg-[var(--color-primary-dark)] text-white" : "app-surface-2 app-text-secondary"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" /> {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>
        ) : null}
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {activeTab === "piyasa" ? (
          <div className="space-y-10">
            <HomeHero />
            <HomeMarketSummary />
            <ParamNeOlurdu />
            <HomeStockCards />
            <HomeNewsList onNavigate={handleNavigate} />
            <div id="piyasalar" className="scroll-mt-24"><MarketSection /></div>
            <HomePersonalPanel />
            <HomeDailyFlow />
            <HomeTools onNavigate={handleNavigate} />
            <section className="rounded-2xl bg-[var(--color-primary-dark)] px-5 py-8 text-center text-white sm:py-10">
              <h2 className="text-2xl font-bold">Yatırım yapmadan önce araştır.</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">Geçmiş yatırımını hesapla, hisseleri karşılaştır ve portföyünü tek yerden takip et.</p>
              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <a href="#param-ne-olurdu" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[var(--color-primary-dark)]">Geçmiş yatırımını hesapla</a>
                <button type="button" onClick={() => handleNavigate("portfoy")} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/40 px-5 text-sm font-semibold text-white">Portföyünü oluştur</button>
              </div>
            </section>
          </div>
        ) : null}

        <div className="space-y-6">
          {activeTab === "hesaplayici" ? <CalculatorSection /> : null}
          {activeTab === "portfoy" ? <PortfolioSection /> : null}
          {activeTab === "izleme" ? <WatchlistSection /> : null}
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