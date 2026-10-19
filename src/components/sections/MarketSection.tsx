"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Search, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { useWatchlist } from "@/hooks/useWatchlist";
import { WatchStar } from "@/components/WatchStar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatMarketPrice, formatNumber } from "@/lib/utils";
import { getMarketPriceMeta, marketSymbolByCode, type MarketCategory } from "@/data/marketSymbols";
import { MarketNewsStrip } from "@/components/MarketNewsStrip";
import { MarketGuideText } from "@/components/FinancialGuideText";

type TabKey = "borsa" | "doviz" | "emtia" | "kripto";

const TABS: Array<{ key: TabKey; label: string; categories: MarketCategory[] }> = [
  { key: "borsa", label: "Endeks & Hisseler", categories: ["endeks", "hisse"] },
  { key: "doviz", label: "Döviz", categories: ["doviz"] },
  { key: "emtia", label: "Emtia", categories: ["emtia"] },
  { key: "kripto", label: "Kripto", categories: ["kripto"] },
];

const categoryOf = (code: string): MarketCategory | undefined => marketSymbolByCode.get(code)?.category;

const mobileMediaQuery = "(max-width: 767px)";

function subscribeToMobile(callback: () => void) {
  const media = window.matchMedia(mobileMediaQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia(mobileMediaQuery).matches;
}

function getServerMobileSnapshot() {
  return false;
}

export function MarketSection() {
  const { quotes, tickerTape, liveAvailable, updatedAt } = useLiveQuotes();
  const { isWatched, toggle, tickers, localOnly } = useWatchlist();
  const [activeTab, setActiveTab] = useState<TabKey>("borsa");
  const [cryptoSearch, setCryptoSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useSyncExternalStore(subscribeToMobile, getMobileSnapshot, getServerMobileSnapshot);
  const itemsPerPage = isMobile ? 10 : 20;

  const watchedQuotes = quotes.filter((q) => tickers.includes(q.code));

  // Filtrelenmiş liste
  const visibleQuotes = useMemo(() => {
    const activeCategories = TABS.find((t) => t.key === activeTab)?.categories ?? [];
    let list = quotes.filter((q) => {
      const cat = categoryOf(q.code);
      return cat ? activeCategories.includes(cat) : false;
    });
    if (activeTab === "kripto" && cryptoSearch.trim()) {
      const term = cryptoSearch.trim().toLowerCase();
      list = list.filter(
        (q) => q.code.toLowerCase().includes(term) || q.label.toLowerCase().includes(term),
      );
    }
    return list;
  }, [quotes, activeTab, cryptoSearch]);

  // Sayfalandırma (Pagination) Hesaplamaları
  const totalPages = Math.ceil(visibleQuotes.length / itemsPerPage);
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return visibleQuotes.slice(start, start + itemsPerPage);
  }, [visibleQuotes, currentPage, itemsPerPage]);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setCurrentPage(1); // Sekme değiştiğinde ilk sayfaya dön
  };

  return (
    <section className="section-card fade-in">
      {/* İzleme Listem */}
      <div className="app-surface-2 app-border mb-4 rounded-xl border p-3">
        <div className="mb-2 flex items-center gap-2">
          <Star className="text-gold h-4 w-4" fill="currentColor" />
          <h3 className="app-text text-sm font-semibold">İzleme Listem</h3>
          {localOnly ? <span className="app-muted text-[11px]">(yerel mod)</span> : null}
        </div>
        {watchedQuotes.length === 0 ? (
          <p className="app-muted text-xs">Henüz favori eklemediniz — kartlardaki yıldıza dokunun.</p>
        ) : (
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {watchedQuotes.map((q) => (
              <Link
                key={q.code}
                href={`/varlik/${q.code}`}
                className="app-surface app-border card-hover min-w-[150px] rounded-lg border px-2.5 py-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="app-text text-xs font-semibold">{q.label}</span>
                  <WatchStar watched onToggle={() => toggle(q.code)} size={13} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="app-text text-sm font-bold">{formatMarketPrice(q.price)} {getMarketPriceMeta(marketSymbolByCode.get(q.code)).currencyLabel}</span>
                  <span className={`text-[11px] ${q.changePct >= 0 ? "text-bull" : "text-bear"}`}>
                    {q.changePct >= 0 ? "+" : ""}{formatNumber(q.changePct, 2)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <SectionTitle
        eyebrow="Canlı Veri"
        title="Canlı Borsa, Döviz, Emtia ve Kripto Akışı"
        description="Veriler Yahoo Finance üzerinden yaklaşık 30 saniyede bir güncellenir. Kaynak erişilemezse fiyat yerine veri durumu gösterilir."
      />

      <div className="app-surface-2 app-border mb-3 rounded-xl border p-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {tickerTape.map((q) => (
            <div key={q.code} className="app-surface app-border min-w-[130px] rounded-lg border px-2 py-1 text-xs">
              <p className="app-text font-semibold">{q.label}</p>
              <p className={`font-bold ${q.changePct >= 0 ? "text-bull" : "text-bear"}`}>{formatMarketPrice(q.price)} {getMarketPriceMeta(marketSymbolByCode.get(q.code)).currencyLabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kategori sekmeleri */}
      <div className="mb-3 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={activeTab === tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`min-h-10 rounded-lg border px-3 text-xs font-semibold transition ${
              activeTab === tab.key
                ? "border-transparent bg-[var(--color-primary)] text-white"
                : "app-surface app-border app-text card-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "kripto" && (
        <div className="app-surface-2 app-border mb-3 flex items-center gap-2 rounded-xl border px-3 py-2">
          <Search className="app-muted h-4 w-4" />
          <input
            value={cryptoSearch}
            onChange={(e) => {
              setCryptoSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Kripto ara (BTC, Ethereum, SOL...)"
            className="app-text w-full bg-transparent text-sm outline-none placeholder:opacity-60"
          />
        </div>
      )}

      {/* Grid Listesi (Her sayfada max 20 adet) */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {paginatedQuotes.map((q) => {
          return (
            <Link
              key={q.code}
              href={`/varlik/${q.code}`}
              className={`app-surface-2 app-border card-hover min-w-0 cursor-pointer rounded-xl border p-2.5 sm:p-3 ${
                q.direction === "up" ? "flash-up" : q.direction === "down" ? "flash-down" : ""
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-1">
                <h3 className="app-text truncate text-sm font-semibold">{q.label}</h3>
                <div className="flex items-center gap-1">
                  <span className={`text-xs ${q.changePct >= 0 ? "text-bull" : "text-bear"}`}>
                    {q.changePct >= 0 ? <ArrowUpRight className="inline h-3 w-3" /> : <ArrowDownRight className="inline h-3 w-3" />} %{formatNumber(Math.abs(q.changePct), 2)}
                  </span>
                  <WatchStar watched={isWatched(q.code)} onToggle={() => toggle(q.code)} size={14} />
                </div>
              </div>
              <div className="flex items-end justify-between gap-2">
                <p className="app-text truncate text-base font-bold sm:text-lg">{formatMarketPrice(q.price)} {getMarketPriceMeta(marketSymbolByCode.get(q.code)).currencyLabel}</p>
              </div>
              <p className="app-muted truncate text-[11px]">{getMarketPriceMeta(marketSymbolByCode.get(q.code)).unitLabel} fiyatı · Detay</p>
            </Link>
          );
        })}
        {paginatedQuotes.length === 0 && (
          <p className="app-muted col-span-full py-6 text-center text-sm">Sonuç bulunamadı.</p>
        )}
      </div>

      {/* Sayfalandırma (Pagination) Kontrolleri */}
      {totalPages > 1 && (
        <div className="my-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex min-h-10 items-center gap-1 rounded-lg border px-3 text-xs font-medium disabled:opacity-40 app-surface app-border app-text"
          >
            <ChevronLeft className="h-4 w-4" /> Önceki
          </button>
          
          <span className="text-xs text-gray-500">
            Sayfa {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex min-h-10 items-center gap-1 rounded-lg border px-3 text-xs font-medium disabled:opacity-40 app-surface app-border app-text"
          >
            Sonraki <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <MarketNewsStrip tab={activeTab} />

      <p className="app-muted mt-3 text-xs">
        Veriler bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. {liveAvailable && updatedAt ? `Son güncelleme: ${new Date(updatedAt).toLocaleString("tr-TR")} · Canlı kaynak` : "Son kapanış verileri gösteriliyor."}
      </p>
      <MarketGuideText />
    </section>
  );
}