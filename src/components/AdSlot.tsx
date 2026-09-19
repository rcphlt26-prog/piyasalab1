"use client";

import { useEffect, useState } from "react";
import { hasAdsConsent } from "@/components/AdSenseConsent";

type Props = {
  label: string;
  width: number;
  height: number;
  className?: string;
};

declare global {
  interface Window { adsbygoogle?: unknown[]; }
}

export function AdSlot({ label, width, height, className = "" }: Props) {
  const [consent, setConsent] = useState(false);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-7925528729215112";
  const slot = label.includes("Leaderboard")
    ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD
    : label.includes("Inline")
      ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE
      : process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR;

  useEffect(() => {
    const sync = () => setConsent(hasAdsConsent());
    sync();
    window.addEventListener("veriakis-ads-consent-changed", sync);
    return () => window.removeEventListener("veriakis-ads-consent-changed", sync);
  }, []);

  useEffect(() => {
    if (!client || !slot || !consent) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense may not be available when an ad blocker is active.
    }
  }, [client, consent, slot]);

  return (
    <div
      className={`rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-2 ${className}`}
      style={{ minHeight: height + 18, minWidth: Math.min(width, 320) }}
      data-ad-slot={label}
      data-ad-width={width}
      data-ad-height={height}
      aria-label={`${label} reklam alanı`}
    >
      {client && slot && consent ? (
        <ins
          className="adsbygoogle block"
          style={{ display: "block", minHeight: height, width: "100%" }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex h-full min-h-[120px] items-center justify-center rounded-lg bg-slate-800/40 text-center text-xs text-slate-400">
          {label} · {width}x{height}
        </div>
      )}
    </div>
  );
}
