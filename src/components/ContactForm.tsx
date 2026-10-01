"use client";

import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent(String(form.get("subject") ?? "VeriAkış iletişim"));
    const body = encodeURIComponent(`Ad: ${form.get("name")}\nE-posta: ${form.get("email")}\n\n${form.get("message")}`);
    window.location.href = `mailto:rcphlt26@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="app-surface-2 app-border space-y-4 rounded-xl border p-4 sm:p-5" aria-label="İletişim formu">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="app-text-secondary text-sm">Ad<input required name="name" autoComplete="name" className="app-surface app-border app-text mt-1 block w-full rounded-lg border px-3 py-2" /></label>
        <label className="app-text-secondary text-sm">E-posta<input required type="email" name="email" autoComplete="email" className="app-surface app-border app-text mt-1 block w-full rounded-lg border px-3 py-2" /></label>
      </div>
      <label className="app-text-secondary block text-sm">Konu<input required name="subject" className="app-surface app-border app-text mt-1 block w-full rounded-lg border px-3 py-2" /></label>
      <label className="app-text-secondary block text-sm">Mesaj<textarea required name="message" rows={5} className="app-surface app-border app-text mt-1 block w-full resize-y rounded-lg border px-3 py-2" /></label>
      <button type="submit" className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white">E-posta uygulamasında gönder</button>
      {sent ? <p role="status" className="app-muted text-xs">E-posta uygulamanız açılmalı. Açılmadıysa <a className="text-primary underline" href="mailto:rcphlt26@gmail.com">doğrudan e-posta gönderin</a>.</p> : null}
    </form>
  );
}