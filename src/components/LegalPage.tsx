import Link from "next/link";
import { Footer } from "@/components/Footer";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/" className="app-text-secondary text-sm hover:text-primary">Ana sayfaya dön</Link>
        <article className="section-card mt-4">
          <h1 className="app-text mb-6 text-3xl font-bold">{title}</h1>
          <div className="app-text-secondary space-y-4 text-sm leading-7">{children}</div>
        </article>
      </div>
      <Footer />
    </main>
  );
}
