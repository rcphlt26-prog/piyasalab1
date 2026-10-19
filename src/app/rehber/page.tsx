import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Footer } from "@/components/Footer";
import { guideArticles } from "@/data/guideArticles";

export const metadata: Metadata = {
  title: "Finans Rehberleri",
  description: "Temettü birikimi, reel getiri, enflasyon ve hisse değerleme oranları hakkında kapsamlı finansal okuryazarlık rehberleri.",
  alternates: { canonical: "https://veriakis.com/rehber" },
  openGraph: {
    title: "Finans Rehberleri | VeriAkış",
    description: "Finansal okuryazarlık için özgün rehberler: F/K, PD/DD, temettü, enflasyon ve risk yönetimi.",
    url: "https://veriakis.com/rehber",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "VeriAkış Finans Rehberleri" }],
  },
};

export default function GuidesPage() {
  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <header className="mb-8 max-w-3xl">
          <p className="app-muted text-xs font-semibold uppercase tracking-wide">VeriAkış · Finansal okuryazarlık</p>
          <h1 className="app-text mt-2 text-3xl font-bold sm:text-4xl">Finans Rehberleri</h1>
          <p className="app-text-secondary mt-3 text-base leading-7">Yatırım kavramlarını anlaşılır bir dille ele alan bu rehberler; oranları, riskleri ve hesaplama yöntemlerini öğrenmenize yardımcı olur. İçerikler eğitim amaçlıdır, kişiye özel yatırım tavsiyesi değildir.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guideArticles.map((article) => (
            <article key={article.slug} className="app-surface app-border flex min-h-64 flex-col rounded-xl border p-5">
              <div className="mb-4 flex items-center justify-between"><BookOpen className="h-5 w-5 text-primary" /><span className="app-muted text-xs">{article.readingTime}</span></div>
              <p className="text-xs font-semibold text-primary">{article.category}</p>
              <h2 className="app-text mt-2 text-xl font-semibold leading-snug">{article.title}</h2>
              <p className="app-text-secondary mt-3 flex-1 text-sm leading-6">{article.description}</p>
              <Link href={`/rehber/${article.slug}`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Rehberi oku <ArrowUpRight className="h-4 w-4" /></Link>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}