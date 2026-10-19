"use client";

import { useState } from "react";

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function ContactForm() {
  const [state, setState] = useState<SubmitState>({ type: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    setState({ type: "loading" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string; stored?: boolean; fallbackMailto?: string };

      if (!response.ok) {
        setState({ type: "error", message: result.error ?? "Mesaj gönderilemedi. Lütfen tekrar deneyin." });
        return;
      }

      if (result.fallbackMailto) {
        window.location.href = result.fallbackMailto;
        setState({ type: "success", message: "Mesajınız e-posta taslağına aktarıldı. Lütfen e-posta uygulamanızdan gönderimi tamamlayın." });
        return;
      }

      form.reset();
      setState({ type: "success", message: result.stored ? "Mesajınız başarıyla alındı. Talebiniz ortalama 2 iş günü içinde yanıtlanır." : "Mesajınız alındı." });
    } catch {
      setState({ type: "error", message: "Bağlantı hatası oluştu. Lütfen tekrar deneyin." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="app-surface-2 app-border space-y-4 rounded-xl border p-4 sm:p-5" aria-label="İletişim formu">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="app-text-secondary text-sm">Ad<input required name="name" autoComplete="name" className="app-surface app-border app-text mt-1 block w-full rounded-lg border px-3 py-2" /></label>
        <label className="app-text-secondary text-sm">E-posta<input required type="email" name="email" autoComplete="email" className="app-surface app-border app-text mt-1 block w-full rounded-lg border px-3 py-2" /></label>
      </div>
      <label className="app-text-secondary block text-sm">Konu<input required name="subject" className="app-surface app-border app-text mt-1 block w-full rounded-lg border px-3 py-2" /></label>
      <label className="app-text-secondary block text-sm">Mesaj<textarea required name="message" rows={5} className="app-surface app-border app-text mt-1 block w-full resize-y rounded-lg border px-3 py-2" /></label>

      <button type="submit" disabled={state.type === "loading"} className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {state.type === "loading" ? "Gönderiliyor..." : "Mesajı gönder"}
      </button>

      {state.type === "success" ? <p role="status" className="text-xs text-bull">{state.message}</p> : null}
      {state.type === "error" ? <p role="alert" className="text-xs text-bear">{state.message}</p> : null}
    </form>
  );
}
