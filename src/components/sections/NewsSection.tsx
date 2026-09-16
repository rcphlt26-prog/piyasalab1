"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, ExternalLink } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { newsData, type NewsCategory, type NewsItem } from "@/data/newsData";
import { fetchNews } from "@/lib/supabase/data";

const categories: Array<"Tümü" | NewsCategory> = ["Tümü", "Ekonomi", "BIST", "Döviz", "Emtia"];

const catColor: Record<NewsCategory, string> = {
  Ekonomi: "bg-[var(--color-primary)]/15 text-primary",
  BIST: "bg-[var(--color-bull)]/15 text-bull",
  Döviz: "bg-[var(--color-gold)]/15 text-gold",
  Emtia: "bg-[var(--color-bear)]/15 text-bear",
};

const IS_PROD = process.env.NODE_ENV === "production";

export function NewsSection() {
  const [category, setCategory] = useState<"Tümü" | NewsCategory>("Tümü");
  const [sortDesc, setSortDesc] = useState(true);
  const [news, setNews] = useState<NewsItem[]>(IS_PROD ? [] : newsData);
  const [source, setSource] = useState<"loading" | "supabase" | "demo" | "empty">("loading");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const remote = await fetchNews();
      if (cancelled) return;
      if (remote && remote.length > 0) {
        setNews(remote);
        setSource("supabase");
      } else if (IS_PROD) {
        setNews([]);
        setSource("empty");
      } else {
        setNews(newsData);
        setSource("demo");
      }
    };
    void load();
    const timer = setInterval(() => void load(), 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

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
        description="Ekonomi, BIST, döviz ve emtia başlıklarında güncel gelişmeler. Haberin detayları için kaynak sitelere yönlendirilirsiniz."
      />

      <div className="mb-3">
        {source === "supabase" ? (
          <span className="rounded-full bg-[var(--color-bull)]/15 px-2 py-0.5 text-[11px] font-semibold text-bull">Canlı veri (Supabase) · 30 sn&apos;de bir güncellenir</span>
        ) : source === "demo" ? (
          <span className="rounded-full bg-[var(--color-gold)]/15 px-2 py-0.5 text-[11px] font-semibold text-gold">Demo veri</span>
        ) : source === "empty" ? (
          <span className="rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 text-[11px] font-semibold text-primary">Supabase&apos;de henüz haber yok</span>
        ) : (
          <span className="app-muted text-[11px]">Haberler yükleniyor…</span>
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

      {source === "loading" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="app-surface-2 app-border rounded-2xl border p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="app-surface-3 h-4 w-16 animate-pulse rounded-full" />
                <div className="app-surface-3 ml-auto h-3 w-20 animate-pulse rounded-full" />
              </div>
              <div className="app-surface-3 mb-2 h-5 w-3/4 animate-pulse rounded" />
              <div className="app-surface-3 mb-1 h-3 w-full animate-pulse rounded" />
              <div className="app-surface-3 h-3 w-5/6 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="app-surface-2 app-border rounded-2xl border p-8 text-center">
          <p className="app-text-secondary text-sm">Supabase&apos;de henüz haber bulunmuyor. Yeni haberler eklendiğinde burada otomatik görünecek.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((n: any) => {
            // Eğer Supabase'den gelen veride 'url' varsa dış kaynak linki olarak kullan, yoksa standart akış
            const articleUrl = n.url || "#";
            const isExternal = Boolean(n.url);

            return (
              <a
                key={n.slug || n.id || n.title}
                href={articleUrl}
                target={isExternal ? "_blank" : "_self"}
                rel={isExternal ? "noopener noreferrer" : ""}
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
                  <span>{n.title}</span>
                  {isExternal && <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition shrink-0 ml-2" />}
                </h3>
                
                <p className="app-text-secondary text-sm leading-6">{n.summary || n.content}</p>
                
                {n.relatedTickers && n.relatedTickers.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {n.relatedTickers.map((t: string) => (
                      <span key={t} className="app-surface-3 app-text-secondary rounded-full px-2 py-0.5 text-[10px] font-semibold">{t}</span>
                    ))}
                  </div>
                ) : null}
                
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="app-muted">Kaynak: {n.source || "Yahoo Finance"}</span>
                  {isExternal && <span className="text-[var(--color-primary)] font-medium">Habere Git →</span>}
                </div>
              </a>
            );
          })}
        </div>
      )}
      <p className="app-muted mt-4 text-xs">Haberler bilgilendirme amaçlıdır ve yatırım tavsiyesi niteliği taşımaz.</p>
    </section>
  );
}