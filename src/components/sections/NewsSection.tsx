"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { type NewsCategory } from "@/data/newsData";
import { useLiveNews } from "@/hooks/useLiveNews";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const categories: Array<"Tümü" | NewsCategory> = ["Tümü", "Ekonomi", "BIST", "Döviz", "Emtia"];

const catColor: Record<NewsCategory, string> = {
  Ekonomi: "bg-[var(--color-primary)]/15 text-primary",
  BIST: "bg-[var(--color-bull)]/15 text-bull",
  Döviz: "bg-[var(--color-gold)]/15 text-gold",
  Emtia: "bg-[var(--color-bear)]/15 text-bear",
};

export function NewsSection() {
  const [category, setCategory] = useState<"Tümü" | NewsCategory>("Tümü");
  const [sortDesc, setSortDesc] = useState(true);
  const { items: news, source, isLoading } = useLiveNews();
  // "demo" kaynağı yalnızca eğitim amaçlı yerel içeriktir; gerçek haber gibi gösterilmez.
  const live = source !== "demo";

  const items = useMemo(() => {
    const filtered = category === "Tümü" ? news : news.filter((n) => n.category === category);
    return [...filtered].sort((a, b) =>
      sortDesc ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
    );
  }, [category, sortDesc, news]);

  return (
    <section className="section-card fade-in">
      <SectionTitle
        eyebrow="Gündem"
        title="Piyasa Haberleri ve Ekonomi Gündemi"
        description="Ekonomi, BIST, döviz ve emtia başlıkları. Güncel bilgi için her zaman resmi ve yetkili kaynakları doğrulayın."
      />

      <div className="mb-3 flex items-center justify-between">
        {source === "google" ? (
          <span className="rounded-full bg-[var(--color-bull)]/15 px-2 py-0.5 text-[11px] font-semibold text-bull">Google News · Yaklaşık 5 dakikada güncellenir</span>
        ) : source === "supabase" ? (
          <span className="rounded-full bg-[var(--color-bull)]/15 px-2 py-0.5 text-[11px] font-semibold text-bull">Haber arşivi · Yaklaşık 5 dakikada kontrol edilir</span>
        ) : isLoading ? (
          <span className="app-muted text-[11px]">Haberler yükleniyor</span>
        ) : (
          <span className="rounded-full bg-[var(--color-gold)]/15 px-2 py-0.5 text-[11px] font-semibold text-gold">Canlı haber kaynağına ulaşılamıyor</span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`app-border whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${
                category === c ? "bg-[var(--color-primary)] text-white" : "app-text-secondary hover:border-[var(--color-primary-light)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortDesc((v) => !v)}
          className="app-border app-text-secondary ml-auto rounded-full border px-3 py-1.5 text-xs"
        >
          Tarih: {sortDesc ? "Yeni → Eski" : "Eski → Yeni"}
        </button>
      </div>

      {!live || items.length === 0 ? (
        isLoading && !live ? (
          <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((key) => <Skeleton key={key} className="h-24 w-full" />)}</div>
        ) : <EmptyState title={live ? "Bu kategoride haber bulunmuyor." : "Haber akışı şu anda kullanılamıyor."} description="Güncel haberler alınamadı. Birkaç dakika sonra tekrar deneyin." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((n) => {
            const articleUrl = n.url || "#";
            const isExternal = Boolean(n.url);

            return (
              <article
                key={n.slug || n.title}
                className="app-surface-2 app-border card-hover rounded-2xl border p-4 block transition hover:border-[var(--color-primary-light)] group"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${catColor[n.category as NewsCategory] || "bg-gray-500/15 text-gray-400"}`}>
                    {n.category || "Genel"}
                  </span>
                  {n.breaking ? <span className="rounded-full bg-[var(--color-bear)] px-2 py-0.5 text-[11px] font-bold text-white">Son Dakika</span> : null}
                  <span className="app-muted ml-auto flex items-center gap-1 text-[11px]">
                    <Clock className="h-3 w-3" /> {n.date ? new Date(n.date).toLocaleDateString("tr-TR") : ""}
                  </span>
                </div>
                
                <h3 className="app-text mb-1 text-base font-semibold leading-snug flex items-center justify-between">
                  <Link href={`/haber/${n.slug}`} className="hover:text-primary">{n.title}</Link>
                  {isExternal && <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition shrink-0 ml-2" />}
                </h3>
                
                <p className="app-text-secondary text-sm leading-6">{n.summary}</p>
                
                {n.relatedSymbols && n.relatedSymbols.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {n.relatedSymbols.map((symbol: string) => (
                      <Link key={symbol} href={`/varlik/${symbol}`} className="app-surface-3 app-text-secondary rounded-full px-2 py-0.5 text-[10px] font-semibold hover:text-primary">{symbol}</Link>
                    ))}
                  </div>
                ) : null}
                
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="app-muted">Kaynak: {n.url ? (n.source || "Yayıncı bağlantısı") : "Eğitim simülasyonu"}</span>
                  {isExternal && <a href={articleUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] font-medium">Kaynağa git →</a>}
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="app-muted mt-4 text-xs">Başlıklar yalnızca bilgilendirme amaçlıdır; içerik doğruluğu, yatırım tavsiyesi veya resmi kaynak niteliği garanti edilmez.</p>
    </section>
  );
}