import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Newspaper } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

type NewsRow = {
  slug: string;
  title: string;
  summary: string | null;
  category: string;
  source: string | null;
  news_date: string | null;
  url: string | null;
  breaking: boolean | null;
  related_symbols: string[] | null;
};

async function getNews(slug: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("news").select("slug, title, summary, category, source, news_date, url, breaking, related_symbols").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return data as NewsRow;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNews(slug);
  return {
    title: news?.title ?? "Haber",
    description: news?.summary ?? "Piyasa haberi ve ilgili şirketler.",
    alternates: { canonical: `https://veriakis.com/haber/${encodeURIComponent(slug)}` },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) notFound();
  const symbols = news.related_symbols ?? [];

  return <main className="app-bg min-h-screen"><div className="mx-auto max-w-4xl px-4 py-8"><Link href="/" className="app-text-secondary mb-6 inline-flex items-center gap-2 text-sm hover:text-primary"><ArrowLeft className="h-4 w-4" /> Haber akışına dön</Link><article className="section-card"><div className="mb-4 flex items-center gap-2"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-primary"><Newspaper className="h-5 w-5" /></span><div><p className="app-muted text-xs">{news.category} · {news.news_date ? new Date(news.news_date).toLocaleDateString("tr-TR") : ""}</p><p className="app-muted text-xs">{news.source ?? "VeriAkış"}</p></div></div><h1 className="app-text text-3xl font-bold">{news.title}</h1><p className="app-text-secondary mt-4 text-base leading-7">{news.summary ?? "Bu haber için özet bulunmuyor."}</p>{symbols.length > 0 ? <section className="app-surface-2 app-border mt-8 rounded-xl border p-4"><h2 className="app-text text-base font-semibold">Bu haber hangi şirketleri etkileyebilir?</h2><p className="app-muted mt-1 text-xs">İlgili sembollerin detay sayfalarına geçin.</p><div className="mt-3 flex flex-wrap gap-2">{symbols.map((symbol) => <Link key={symbol} href={`/varlik/${symbol}`} className="app-border app-text rounded-lg border px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary">{symbol}</Link>)}</div></section> : <p className="app-muted mt-8 rounded-xl border border-dashed p-4 text-sm">Bu haber için ilişkili şirket sembolü bulunmuyor.</p>}{news.url ? <a href={news.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Orijinal kaynağı aç <ExternalLink className="h-4 w-4" /></a> : null}</article></div></main>;
}
