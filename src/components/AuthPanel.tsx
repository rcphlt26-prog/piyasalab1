"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { LoaderCircle, LogIn, LogOut, UserPlus } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isValidUsername } from "@/lib/contentModeration";

export function AuthPanel({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const supabase = getSupabaseBrowserClient();
  const client = supabase;
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [mode] = useState<"login" | "signup">(initialMode);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Supabase Dashboard > Authentication > Providers > Google:
  // Google Cloud OAuth Client ID ve Client Secret değerlerini Google sağlayıcısına ekleyin.

  useEffect(() => {
    if (!client) return;
    void client.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      startTransition(() => setUser(data.user));
    });
    const { data: subscription } = client.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      startTransition(() => setUser(session?.user ?? null));
    });
    return () => subscription.subscription.unsubscribe();
  }, [client]);

  if (!client) return null;
  const authClient = client;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);
    if (mode === "signup" && !isValidUsername(username)) {
      setMessage("Takma ad 3-30 karakter olmalı; yalnızca harf, rakam ve alt çizgi kullanın.");
      setLoading(false);
      return;
    }
    if (mode === "signup" && !kvkkAccepted) {
      setMessage("Kayıt olmak için KVKK, Gizlilik ve Çerez metinlerini kabul etmelisiniz.");
      setLoading(false);
      return;
    }
    let result;
    try {
      result = mode === "login"
        ? await authClient.auth.signInWithPassword({ email, password })
        : await authClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { username, isKvkkAccepted: true, kvkkAcceptedAt: new Date().toISOString() },
          },
        });
    } catch {
      setMessage("Kimlik doğrulama servisine ulaşılamadı. Lütfen tekrar deneyin.");
      setLoading(false);
      return;
    }

    if (result.error) {
      setMessage(result.error.message);
      setLoading(false);
      return;
    }
    if (mode === "login") {
      window.localStorage.setItem("VeriAkis-remember-me", String(rememberMe));
      document.cookie = `veriakis-remember-me=${rememberMe ? "1" : "0"}; Path=/; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
      setMessage("Giriş yapıldı.");
    } else {
      setMessage("Kayıt işleminiz başarıyla gerçekleşti! Lütfen e-posta kutunuza gönderilen doğrulama bağlantısına tıklayarak hesabınızı onaylayın.");
    }
    setPassword("");
    setOpen(false);
    setLoading(false);
  }

  async function handleGoogleLogin() {
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await authClient.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setMessage(`${error.message} Supabase Dashboard > Authentication > Providers > Google bölümünde sağlayıcının Enabled olduğundan emin olun.`);
        setLoading(false);
      }
    } catch {
      setMessage("Google ile giriş başlatılamadı. Supabase Dashboard > Authentication > Providers > Google sağlayıcısını etkinleştirin ve Client ID/Secret bilgilerini kontrol edin.");
      setLoading(false);
    }
  }

  async function signOut() {
    await authClient.auth.signOut();
    setMessage("Oturum kapatıldı.");
  }

  if (user) {
    return (
      <button type="button" onClick={signOut} className="app-border app-text-secondary inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs" title="Oturumu kapat">
        <LogOut className="h-4 w-4" />
        <span className="hidden lg:inline">{user.email?.split("@")[0] ?? "Hesabım"}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-2.5 py-2 text-xs font-semibold text-white">
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Üye girişi</span>
      </button>
      {open ? (
        <div className="app-surface app-border absolute right-0 top-11 z-50 w-72 rounded-xl border p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="app-text text-sm font-semibold">Kişisel Finans Merkezi</h2>
              <p className="app-muted mt-1 text-xs">İzleme listeni ve portföyünü sakla.</p>
            </div>
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
          <form onSubmit={submit} className="space-y-2">
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-posta" className="app-surface-2 app-border app-text w-full rounded-lg border px-3 py-2 text-sm outline-none" />
            {mode === "signup" ? <input required minLength={3} maxLength={30} value={username} onChange={(event) => setUsername(event.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} placeholder="Takma ad: borsa_kaplani34" className="app-surface-2 app-border app-text w-full rounded-lg border px-3 py-2 text-sm outline-none" /> : null}
            {mode === "signup" ? <label className="app-text-secondary flex items-start gap-2 text-[11px]"><input type="checkbox" checked={kvkkAccepted} onChange={(event) => setKvkkAccepted(event.target.checked)} className="mt-0.5" /><span><Link href="/gizlilik" target="_blank" rel="noopener noreferrer" className="text-primary underline">KVKK/Gizlilik Politikası</Link>, <Link href="/cerezler" target="_blank" rel="noopener noreferrer" className="text-primary underline">Çerez Politikası</Link> ve <Link href="/kullanim-sartlari" target="_blank" rel="noopener noreferrer" className="text-primary underline">Kullanım Şartları</Link>&apos;nı okudum ve kabul ediyorum.</span></label> : null}
            <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Şifre (en az 6 karakter)" className="app-surface-2 app-border app-text w-full rounded-lg border px-3 py-2 text-sm outline-none" />
            {mode === "login" ? <label className="app-text-secondary flex items-center gap-2 text-xs"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Beni hatırla (30 gün)</label> : null}
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
              {loading ? <LoaderCircle className="mx-auto h-4 w-4 animate-spin" /> : mode === "login" ? "Giriş yap" : "Ücretsiz üye ol"}
            </button>
          </form>
          <div className="my-3 flex items-center gap-2"><span className="app-border h-px flex-1 border-t" /><span className="app-muted text-[10px]">veya</span><span className="app-border h-px flex-1 border-t" /></div>
          <button type="button" disabled={loading} onClick={() => void handleGoogleLogin()} className="app-border app-text inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold disabled:cursor-wait disabled:opacity-60">
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <span className="text-base font-bold text-[#4285f4]">G</span>}
            Google ile Devam Et
          </button>
          {mode === "login" ? <Link href="/register" target="_blank" rel="noopener noreferrer" className="app-text-secondary mt-3 inline-block text-xs underline">Hesabın yok mu? Üye ol</Link> : <Link href="/login" target="_blank" rel="noopener noreferrer" className="app-text-secondary mt-3 inline-block text-xs underline">Zaten hesabın var mı? Giriş yap</Link>}
          {message ? <p className="app-muted mt-2 text-xs">{message}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
