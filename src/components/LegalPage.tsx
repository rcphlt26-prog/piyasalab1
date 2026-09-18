import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/Footer";

export function LegalPage({
  title,
  description,
  updatedAt = "17 Eylül 2026",
  children,
}: {
  title: string;
  description: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <Link href="/" className="app-text-secondary inline-flex items-center gap-2 text-sm hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Ana sayfaya dön
        </Link>
        <article className="section-card mt-5 overflow-hidden">
          <header className="app-border -mx-4 -mt-4 mb-8 border-b bg-[var(--color-primary)]/5 px-4 py-7 sm:-mx-6 sm:-mt-6 sm:px-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">VeriAkış · Şeffaflık</p>
                <p className="app-muted text-xs">Son güncelleme: {updatedAt}</p>
              </div>
            </div>
            <h1 className="app-text text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            <p className="app-text-secondary mt-3 max-w-2xl text-sm leading-6">{description}</p>
          </header>
          <div className="app-text-secondary space-y-6 text-sm leading-7">{children}</div>
        </article>
      </div>
      <Footer />
    </main>
  );
}
