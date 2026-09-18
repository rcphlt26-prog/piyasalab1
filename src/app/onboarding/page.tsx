"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const response = await fetch("/api/account/onboarding", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username, accepted }) });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Takma ad kaydedilemedi.");
      setLoading(false);
      return;
    }
    const next = searchParams.get("next");
    router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/portfoy");
  }

  return <main className="app-bg flex min-h-screen items-start justify-center px-4 py-12"><section className="section-card w-full max-w-md"><p className="app-muted text-xs font-semibold uppercase tracking-wide">Kişisel profil</p><h1 className="app-text mt-2 text-2xl font-bold">Aramıza Hoş Geldin! Sitede Seni Nasıl Çağıralım?</h1><p className="app-text-secondary mt-2 text-sm leading-6">Toplulukta ve yorumlarda görünecek benzersiz takma adını (username) belirle.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="app-text-secondary block text-sm">Takma Ad / Username<input required minLength={3} maxLength={30} value={username} onChange={(event) => setUsername(event.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} placeholder="borsa_uzmani" className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-3 py-2 outline-none" /></label><label className="app-text-secondary flex items-start gap-2 text-xs"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5" /><span><Link href="/gizlilik" target="_blank" rel="noopener noreferrer" className="text-primary underline">KVKK Aydınlatma Metni</Link> ve <Link href="/kullanim-sartlari" target="_blank" rel="noopener noreferrer" className="text-primary underline">Kullanıcı Sözleşmesi</Link>&apos;ni okudum ve kabul ediyorum.</span></label>{message ? <p role="alert" className="rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 p-3 text-sm text-gold">{message}</p> : null}<button type="submit" disabled={loading || !accepted} className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Kaydediliyor..." : "Devam Et ve Başla"}</button></form></section></main>;
}

export default function OnboardingPage() {
  return <Suspense fallback={<main className="app-bg min-h-screen" />}><OnboardingForm /></Suspense>;
}
