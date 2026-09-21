"use client";

import Link from "next/link";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function PasswordResetPage() {
  const supabase = getSupabaseBrowserClient();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setMessage("Kimlik doğrulama servisi yapılandırılamadı.");
      return;
    }
    if (password !== passwordConfirmation) {
      setMessage("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    setMessage(error ? `Şifre güncellenemedi: ${error.message}` : "Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.");
    if (!error) {
      setPassword("");
      setPasswordConfirmation("");
    }
  }

  return (
    <main className="app-bg flex min-h-screen items-start justify-center px-4 py-12">
      <section className="section-card w-full max-w-md">
        <h1 className="app-text text-2xl font-bold">Yeni şifre belirleyin</h1>
        <p className="app-text-secondary mt-2 text-sm">Hesabınız için en az 6 karakterlik yeni bir şifre oluşturun.</p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Yeni şifre" className="app-surface-2 app-border app-text w-full rounded-lg border px-3 py-2 text-sm outline-none" />
          <input type="password" required minLength={6} value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="Yeni şifre tekrar" className="app-surface-2 app-border app-text w-full rounded-lg border px-3 py-2 text-sm outline-none" />
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? <LoaderCircle className="mx-auto h-4 w-4 animate-spin" /> : "Şifremi güncelle"}
          </button>
        </form>
        {message ? <p role="alert" className="mt-4 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 p-3 text-sm text-primary">{message}</p> : null}
        <Link href="/login" className="app-text-secondary mt-5 inline-block text-sm underline">Giriş sayfasına dön</Link>
      </section>
    </main>
  );
}