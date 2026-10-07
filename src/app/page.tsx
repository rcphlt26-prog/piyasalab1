"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { 
  LineChart, 
  Calculator, 
  ClipboardList, 
  MessagesSquare, 
  Gamepad2, 
  Newspaper, 
  Info, 
  Menu, 
  X, 
  BriefcaseBusiness, 
  Star, 
  ChevronDown,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
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

interface TabItem {
  id: TabId;
  label: string;
  icon: typeof LineChart;
}

const mainNavTabs: TabItem[] = [
  { id: "piyasa", label: "Piyasalar", icon: TrendingUp },
  { id: "hisseler", label: "Hisse Karnesi", icon: ClipboardList },
  { id: "hesaplayici", label: "Analiz & Hesapla", icon: Calculator },
];

const portfolioTabs: TabItem[] = [
  { id: "portfoy", label: "Portföyüm", icon: BriefcaseBusiness },
  { id: "izleme", label: "İzleme Listesi", icon: Star },
];

const exploreTabs: TabItem[] = [
  { id: "haberler", label: "Finans Haberleri", icon: Newspaper },
  { id: "forum", label: "Yatırımcı Forumu", icon: MessagesSquare },
  { id: "oyunlar", label: "Simülasyon Oyunları", icon: Gamepad2 },
  { id: "hakkinda", label: "Hakkımızda", icon: Info },
];

const allTabs: TabItem[] = [...mainNavTabs, ...portfolioTabs, ...exploreTabs];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("piyasa");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [exploreOpen, setExploreOpen] = useState<boolean>(false);
  const [portfolioOpen, setPortfolioOpen] = useState<boolean>(false);
  const supabase = getSupabaseBrowserClient();

  function handleNavigate(tab: string) {
    if (typeof window === "undefined") return;

    if (tab === "hisseler" || tab === "karne") {
      setActiveTab("piyasa");
      setMobileOpen(false);
      setExploreOpen(false);
      setPortfolioOpen(false);
      window.setTimeout(() => {
        document.getElementById("hisseler")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return;
    }

    const match = allTabs.find((t) => t.id === tab);
    if (match) {
      setActiveTab(match.id);
      setMobileOpen(false);
      setExploreOpen(false);
      setPortfolioOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <main className="app-bg min-h-screen tabular-nums">
      <SpkBanner />

      {/* Header - Sabitlenme (sticky) kaldırıldı, artık sayfa ile kayacak */}
      <header className="app-surface app-border border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          
          {/* Logo */}
          <button
            onClick={() => handleNavigate("piyasa")}
            className="flex shrink-0 items-center gap-2.5 transition opacity-90 hover:opacity-100 cursor-pointer"
            aria-label="VeriAkış ana sayfa"
          >
            <Image src="/gemini-svg.svg" alt="" width={34} height={34} className="rounded-xl shadow-sm" priority />
            <span className="app-text text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              VeriAkış
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1.5 lg:flex ml-4" aria-label="Ana menü">
            
            {mainNavTabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavigate(tab.id)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition cursor-pointer ${
                    active 
                      ? "bg-[var(--color-primary-dark)] text-white shadow-sm" 
                      : "app-text-secondary hover:app-surface-3 hover:app-text"
                  }`}
                >
                  <Icon className="h-4 w-4 opacity-75" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}

            {/* Portföy Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setPortfolioOpen((v) => !v); setExploreOpen(false); }}
                aria-expanded={portfolioOpen}
                aria-haspopup="menu"
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition cursor-pointer ${
                  portfolioTabs.some((tab) => tab.id === activeTab) 
                    ? "bg-[var(--color-primary-dark)] text-white shadow-sm" 
                    : "app-text-secondary hover:app-surface-3 hover:app-text"
                }`}
              >
                <BriefcaseBusiness className="h-4 w-4 opacity-75" aria-hidden="true" />
                Portföyüm <ChevronDown className={`h-3.5 w-3.5 transition-transform ${portfolioOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {portfolioOpen ? (
                <>
                  <button type="button" aria-label="Menüyü kapat" className="fixed inset-0 z-40 cursor-default" onClick={() => setPortfolioOpen(false)} />
                  <div role="menu" className="app-surface app-border absolute left-0 top-full z-50 mt-1.5 w-52 rounded-2xl border p-2 shadow-xl backdrop-blur-lg">
                    {portfolioTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button 
                          key={tab.id} 
                          role="menuitem" 
                          onClick={() => handleNavigate(tab.id)} 
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition cursor-pointer ${
                            tab.id === activeTab ? "app-surface-3 app-text font-semibold" : "app-text-secondary hover:app-surface-3 hover:app-text"
                          }`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" /> {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>

            {/* Keşfet Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setExploreOpen((v) => !v); setPortfolioOpen(false); }}
                aria-expanded={exploreOpen}
                aria-haspopup="menu"
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition cursor-pointer ${
                  exploreTabs.some((tab) => tab.id === activeTab) 
                    ? "bg-[var(--color-primary-dark)] text-white shadow-sm" 
                    : "app-text-secondary hover:app-surface-3 hover:app-text"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 opacity-75" aria-hidden="true" />
                Keşfet <ChevronDown className={`h-3.5 w-3.5 transition-transform ${exploreOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {exploreOpen ? (
                <>
                  <button type="button" aria-label="Menüyü kapat" className="fixed inset-0 z-40 cursor-default" onClick={() => setExploreOpen(false)} />
                  <div role="menu" className="app-surface app-border absolute left-0 top-full z-50 mt-1.5 w-56 rounded-2xl border p-2 shadow-xl backdrop-blur-lg">
                    {exploreTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button 
                          key={tab.id} 
                          role="menuitem" 
                          onClick={() => handleNavigate(tab.id)} 
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition cursor-pointer ${
                            tab.id === activeTab ? "app-surface-3 app-text font-semibold" : "app-text-secondary hover:app-surface-3 hover:app-text"
                          }`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" /> {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>

          </nav>

          {/* Search Bar */}
          <div className="ml-auto hidden w-56 md:block xl:w-72">
            <SearchBar onNavigateTab={handleNavigate} />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            <div className="hidden xl:block"><OnlineUsers supabase={supabase} /></div>
            <AuthPanel />
            <div className="max-[400px]:hidden"><ThemeToggle /></div>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="app-border app-text inline-flex h-10 w-10 items-center justify-center rounded-xl border lg:hidden transition hover:app-surface-3 cursor-pointer"
              aria-label="Menüyü aç/kapat"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileOpen ? (
          <nav className="app-surface app-border max-h-[calc(100vh-4rem)] overflow-y-auto border-t px-4 py-4 lg:hidden shadow-2xl" aria-label="Mobil menü">
            <div className="mb-4 flex items-center justify-between min-[400px]:hidden">
              <span className="app-muted text-xs font-medium">Tema Modu</span>
              <ThemeToggle />
            </div>
            <div className="mb-4 md:hidden">
              <SearchBar onNavigateTab={handleNavigate} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-1 pb-0.5">Piyasalar & Araçlar</div>
              {mainNavTabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigate(tab.id)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition cursor-pointer ${
                      active ? "bg-[var(--color-primary-dark)] text-white shadow-sm" : "app-surface-2 app-text-secondary hover:app-surface-3 hover:app-text"
                    }`}
                  >
                    <Icon className="h-4 w-4 opacity-80" aria-hidden="true" /> 
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-3 pb-0.5">Portföy & Takip</div>
              {portfolioTabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigate(tab.id)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition cursor-pointer ${
                      active ? "bg-[var(--color-primary-dark)] text-white shadow-sm" : "app-surface-2 app-text-secondary hover:app-surface-3 hover:app-text"
                    }`}
                  >
                    <Icon className="h-4 w-4 opacity-80" aria-hidden="true" /> 
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-3 pb-0.5">Keşfet & Topluluk</div>
              {exploreTabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigate(tab.id)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition cursor-pointer ${
                      active ? "bg-[var(--color-primary-dark)] text-white shadow-sm" : "app-surface-2 app-text-secondary hover:app-surface-3 hover:app-text"
                    }`}
                  >
                    <Icon className="h-4 w-4 opacity-80" aria-hidden="true" /> 
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        ) : null}
      </header>

      {/* Main Content Sections */}
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
            <section className="rounded-3xl bg-[var(--color-primary-dark)] px-6 py-10 text-center text-white sm:py-12 shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Yatırım yapmadan önce veriyi incele.</h2>
              <p className="mx-auto mt-2.5 max-w-xl text-sm sm:text-base text-white/80">Geçmiş dönem performanslarını hesapla, hisseleri akranlarıyla kıyasla ve portföyünü tek ekrandan yönet.</p>
              <div className="mt-6 flex flex-col justify-center gap-3.5 sm:flex-row">
                <a href="#param-ne-olurdu" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[var(--color-primary-dark)] shadow transition hover:bg-gray-100">Geçmiş yatırımını hesapla</a>
                <button type="button" onClick={() => handleNavigate("portfoy")} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/40 px-6 text-sm font-semibold text-white transition hover:bg-white/10 cursor-pointer">Portföyünü oluştur</button>
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