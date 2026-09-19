"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "VeriAkis-ads-consent";
const CONSENT_EVENT = "veriakis-ads-consent-changed";

export function hasAdsConsent() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function AdSenseConsent({ client }: { client?: string }) {
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);

  useEffect(() => {
    const sync = () => {
      const value = window.localStorage.getItem(CONSENT_KEY);
      setConsent(value === "accepted" || value === "rejected" ? value : null);
    };
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  function save(value: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Continue for this session when storage is blocked.
    }
    setConsent(value);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }

  if (!client || consent) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-surface)] p-4 shadow-2xl" aria-label="Reklam ve çerez tercihleri">
      <p className="app-text text-sm font-semibold">Reklam ve çerez tercihleri</p>
      <p className="app-text-secondary mt-1 text-xs leading-5">
        Reklamları göstermek ve reklam performansını ölçmek için Google teknolojileri kullanılabilir. Tercihinizi istediğiniz zaman çerez ayarlarından değiştirebilirsiniz.
      </p>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={() => save("rejected")} className="app-border app-text rounded-lg border px-3 py-2 text-xs">Reddet</button>
        <button type="button" onClick={() => save("accepted")} className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white">Kabul et</button>
      </div>
    </aside>
  );
}
