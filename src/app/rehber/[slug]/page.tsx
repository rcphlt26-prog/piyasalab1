import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Footer } from "@/components/Footer";
import { guideArticles } from "@/data/guideArticles";

export function generateStaticParams() {
  return guideArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = guideArticles.find((item) => item.slug === slug);
  if (!article) return { title: "Rehber bulunamadı" };
  return {
    title: `${article.title} | Rehber`,
    description: article.description,
    alternates: { canonical: `https://veriakis.com/rehber/${article.slug}` },
    openGraph: { type: "article", title: article.title, description: article.description, url: `https://veriakis.com/rehber/${article.slug}`, siteName: "VeriAkış" },
  };
}

export default async function GuideArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = guideArticles.find((item) => item.slug === slug);
  if (!article) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: { "@type": "Organization", name: "VeriAkış" },
    publisher: { "@type": "Organization", name: "VeriAkış" },
    mainEntityOfPage: `https://veriakis.com/rehber/${article.slug}`,
    inLanguage: "tr-TR",
  };

  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <Link href="/rehber" className="app-text-secondary inline-flex items-center gap-2 text-sm hover:text-primary"><ArrowLeft className="h-4 w-4" /> Tüm rehberler</Link>
        <article className="section-card mt-5">
          <header className="app-border mb-7 border-b pb-6">
            <div className="mb-4 flex items-center gap-2 text-primary"><BookOpen className="h-5 w-5" /><span className="text-xs font-semibold">{article.category} · {article.readingTime}</span></div>
            <h1 className="app-text text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>
            <p className="app-text-secondary mt-4 text-base leading-7">{article.description}</p>
          </header>
          <div className="space-y-4">{article.content}</div>
          <p className="app-muted app-border mt-8 border-t pt-4 text-xs leading-5">Bu rehber genel bilgilendirme ve eğitim amacıyla hazırlanmıştır. Yatırım tavsiyesi değildir. Piyasa verileri ve koşulları değişebilir.</p>
        </article>
      </div>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </main>
  );
}