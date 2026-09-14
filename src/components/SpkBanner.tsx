"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";

const STORAGE_KEY = "piyasalab-spk-banner";

export function SpkBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed !== "1") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* yoksay */
    }
    setVisible(false);
  }

  return (
    <div className="border-b border-[var(--color-gold)]/40 bg-[var(--color-gold-soft)]">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold)]" />
        <p className="flex-1 text-xs leading-relaxed text-[var(--color-gold)]">
          <strong>Yasal Uyarı:</strong> Piyasalab&apos;da yer alan tüm içerik, hesaplama ve veriler yalnızca bilgilendirme
          ve eğitim amaçlıdır; yatırım danışmanlığı kapsamında değildir ve yatırım tavsiyesi niteliği taşımaz. Geçmiş
          performans gelecekteki getiriyi garanti etmez.
        </p>
        <button
          onClick={dismiss}
          aria-label="Uyarıyı kapat"
          className="rounded-md p-1 text-[var(--color-gold)] transition hover:bg-[var(--color-gold)]/15"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
