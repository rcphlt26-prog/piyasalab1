"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function RecoveryCallbackPage() {
  const [message, setMessage] = useState("Şifre sıfırlama bağlantısı doğrulanıyor...");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      queueMicrotask(() => setMessage("Kimlik doğrulama servisi yapılandırılamadı."));
      return;
    }

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const type = hash.get("type");
    if (type !== "recovery" || !accessToken || !refreshToken) {
      queueMicrotask(() => setMessage("Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş."));
      return;
    }

    void supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setMessage("Şifre sıfırlama oturumu oluşturulamadı. Lütfen yeni bağlantı isteyin.");
          return;
        }
        window.location.replace("/sifre-sifirla");
      });
  }, []);

  return (
    <main className="app-bg flex min-h-screen items-start justify-center px-4 py-12">
      <section className="section-card w-full max-w-md text-center">
        <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" />
        <p className="app-text mt-4 text-sm">{message}</p>
      </section>
    </main>
  );
}