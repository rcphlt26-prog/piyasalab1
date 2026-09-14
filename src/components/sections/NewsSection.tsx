"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
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

export function NewsSection() {
  const [category, setCategory] = useState<"Tümü" | NewsCategory>("Tümü");
  const [sortDesc, setSortDesc] = useState(true);
  const [news, setNews] = useState<NewsItem[]>(newsData);
  const [source, setSource] = useState<"loading" | "supabase" | "demo">("loading");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const remote = await fetchNews();
      if (cancelled) return;
      if (remote && remote.length > 0) {
        setNews(remote);
        setSource("supabase");
      } else {
        setNews(newsData);
        setSource("demo");
      }
    })();
    return () => {
      cancelled = true;
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
        description="Ekonomi, BIST, döviz ve emtia başlıklarında derlenen güncel gelişmeler. Tüm içerikler temsili/eğitim amaçlıdır."
      />

      <div className="mb-3">
        {source === "supabase" ? (
          <span className="rounded-full bg-[var(--color-bull)]/15 px-2 py-0.5 text-[11px] font-semibold text-bull">Canlı veri (Supabase)</span>
        ) : source === "demo" ? (
          <span className="rounded-full bg-[var(--color-gold)]/15 px-2 py-0.5 text-[11px] font-semibold text-gold">Demo veri</span>
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

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((n) => (
          <article key={n.slug} className="app-surface-2 app-border card-hover rounded-2xl border p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${catColor[n.category]}`}>{n.category}</span>
              {n.breaking ? <span className="rounded-full bg-[var(--color-bear)] px-2 py-0.5 text-[11px] font-bold text-white">Son Dakika</span> : null}
              <span className="app-muted ml-auto flex items-center gap-1 text-[11px]">
                <Clock className="h-3 w-3" /> {new Date(n.date).toLocaleDateString("tr-TR")}
              </span>
            </div>
            <h3 className="app-text mb-1 text-base font-semibold leading-snug">{n.title}</h3>
            <p className="app-text-secondary text-sm leading-6">{n.summary}</p>
            <p className="app-muted mt-2 text-xs">Kaynak: {n.source}</p>
          </article>
        ))}
      </div>
      <p className="app-muted mt-4 text-xs">Haberler bilgilendirme amaçlıdır ve yatırım tavsiyesi niteliği taşımaz.</p>
    </section>
  );
}
