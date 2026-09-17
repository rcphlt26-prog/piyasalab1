"use client";

import { useEffect } from "react";

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
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = label.includes("Leaderboard")
    ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD
    : label.includes("Inline")
      ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE
      : process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR;

  useEffect(() => {
    if (!client || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense may not be available when an ad blocker is active.
    }
  }, [client, slot]);

  return (
    <div
      className={`rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-2 ${className}`}
      style={{ minHeight: height + 18, minWidth: Math.min(width, 320) }}
      data-ad-slot={label}
      data-ad-width={width}
      data-ad-height={height}
      aria-label={`${label} reklam alanı`}
    >
      {client && slot ? (
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
