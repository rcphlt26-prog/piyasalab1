"use client";

import { startTransition, useEffect, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthPanel() {
  const supabase = getSupabaseBrowserClient();
  const client = supabase;
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
    const result = mode === "login"
      ? await authClient.auth.signInWithPassword({ email, password })
      : await authClient.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    setMessage(mode === "signup" ? "Kayıt başarılı. E-posta onayını kontrol edin." : "Giriş yapıldı.");
    setPassword("");
    setOpen(false);
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
            <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Şifre (en az 6 karakter)" className="app-surface-2 app-border app-text w-full rounded-lg border px-3 py-2 text-sm outline-none" />
            <button type="submit" className="w-full rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white">
              {mode === "login" ? "Giriş yap" : "Ücretsiz üye ol"}
            </button>
          </form>
          <button type="button" onClick={() => setMode((value) => value === "login" ? "signup" : "login")} className="app-text-secondary mt-3 text-xs underline">
            {mode === "login" ? "Hesabın yok mu? Üye ol" : "Zaten hesabın var mı? Giriş yap"}
          </button>
          {message ? <p className="app-muted mt-2 text-xs">{message}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
