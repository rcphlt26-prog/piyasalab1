"use client";

import { CheckCircle2, X } from "lucide-react";
import { useState } from "react";

export function AuthSuccessToast() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-[var(--color-bull)]/30 bg-[var(--color-bull)]/10 p-4 text-bull" role="status">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">Hesabınız başarıyla doğrulandı ve giriş yapıldı. Hoş geldiniz!</p>
      <button type="button" onClick={() => setVisible(false)} className="shrink-0" aria-label="Bildirimi kapat"><X className="h-4 w-4" /></button>
    </div>
  );
}