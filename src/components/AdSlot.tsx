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
  const adsEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
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
    if (!adsEnabled || !client || !slot || !consent) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense may not be available when an ad blocker is active.
    }
  }, [adsEnabled, client, consent, slot]);

  if (!adsEnabled || !client || !slot || !consent) return null;

  return (
    <div
      className={`rounded-xl ${className}`}
      style={{ minHeight: height, minWidth: Math.min(width, 320) }}
      data-ad-slot={label}
      data-ad-width={width}
      data-ad-height={height}
      aria-label={`${label} reklam alanı`}
    >
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight: height, width: "100%" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
