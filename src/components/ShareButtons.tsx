"use client";

import { Copy, Send } from "lucide-react";
import { useState } from "react";

const siteOrigin = "https://piyasalab.com.tr";

export function ShareButtons({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : siteOrigin);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, icon: Send },
  ];

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="app-surface-2 app-border flex flex-wrap items-center gap-2 rounded-xl border p-3" aria-label="İçeriği paylaş">
      <span className="app-muted mr-1 text-xs font-semibold">Paylaş</span>
      {links.map(({ label, href, icon: Icon }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="app-border app-text-secondary inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold hover:text-primary">{Icon ? <Icon className="h-3.5 w-3.5" /> : null}{label}</a>)}
      <button type="button" onClick={() => void copyLink()} className="app-border app-text-secondary inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold hover:text-primary"><Copy className="h-3.5 w-3.5" />{copied ? "Kopyalandı" : "Linki kopyala"}</button>
    </div>
  );
}
