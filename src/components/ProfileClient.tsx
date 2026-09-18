"use client";

import { useEffect, useState } from "react";

 type Profile = { username: string | null; role: string; usernameLastChangedAt: string | null; isKvkkAccepted: boolean; kvkkAcceptedAt: string | null; email: string | null; emailConfirmedAt: string | null };

export function ProfileClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/account/profile", { cache: "no-store" }).then((response) => response.json()).then((payload: { data?: Profile; error?: string }) => {
      if (payload.data) {
        setProfile(payload.data);
        setUsername(payload.data.username ?? "");
      } else setMessage(payload.error ?? "Profil alınamadı.");
      setLoading(false);
    }).catch(() => { setMessage("Profil servisine ulaşılamadı."); setLoading(false); });
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ username }) });
    const payload = (await response.json()) as { username?: string; error?: string };
    if (!response.ok) { setMessage(payload.error ?? "Profil güncellenemedi."); return; }
    setProfile((current) => current ? { ...current, username: payload.username ?? username, usernameLastChangedAt: new Date().toISOString() } : current);
    setMessage("Takma adınız güncellendi.");
  }

  if (loading) return <p className="app-muted py-8 text-center text-sm">Profil yükleniyor...</p>;
  return <section className="section-card mx-auto max-w-2xl"><p className="app-muted text-xs font-semibold uppercase tracking-wide">Hesap ayarları</p><h1 className="app-text mt-2 text-2xl font-bold">Profilim</h1>{profile ? <div className="mt-6 space-y-4"><div className="app-surface-2 app-border rounded-xl border p-4"><p className="app-muted text-xs">E-posta</p><p className="app-text mt-1 font-semibold">{profile.email ?? "-"}</p><p className={`mt-1 text-xs ${profile.emailConfirmedAt ? "text-bull" : "text-gold"}`}>{profile.emailConfirmedAt ? "E-posta doğrulandı" : "E-posta doğrulaması bekliyor"}</p></div><form onSubmit={save} className="app-surface-2 app-border rounded-xl border p-4"><label className="app-text-secondary block text-sm">Takma ad<input required minLength={3} maxLength={30} value={username} onChange={(event) => setUsername(event.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2" /></label><p className="app-muted mt-2 text-xs">Takma ad haftada bir kez değiştirilebilir.</p><button type="submit" className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white">Kaydet</button></form><div className="app-surface-2 app-border rounded-xl border p-4 text-sm"><p className="app-text">Rol: <strong>{profile.role}</strong></p><p className="app-muted mt-1 text-xs">KVKK onayı: {profile.isKvkkAccepted ? "Onaylandı" : "Bekliyor"}</p></div>{message ? <p role="status" className="rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 p-3 text-sm text-primary">{message}</p> : null}</div> : <p className="app-muted mt-5">Profil bulunamadı.</p>}</section>;
}
