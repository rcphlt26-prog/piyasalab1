import Link from "next/link";
import { AuthPanel } from "@/components/AuthPanel";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const hasAuthError = params.error === "auth-code-error";

  return (
    <main className="app-bg flex min-h-screen items-start justify-center px-4 py-12">
      <section className="section-card w-full max-w-md">
        <h1 className="app-text text-2xl font-bold">VeriAkış hesabı</h1>
        <p className="app-text-secondary mt-2 text-sm">Portföyünüze devam etmek için giriş yapın.</p>
        {hasAuthError ? <p className="mt-4 rounded-lg border border-[var(--color-bear)]/30 bg-[var(--color-bear)]/10 p-3 text-sm text-bear">E-posta doğrulama bağlantısı geçersiz veya süresi dolmuş.</p> : null}
        <div className="mt-5"><AuthPanel initialMode="login" openInitially /></div>
        <Link href="/" className="app-text-secondary mt-5 inline-block text-sm underline">Ana sayfaya dön</Link>
      </section>
    </main>
  );
}
