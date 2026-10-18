"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Users } from "lucide-react";

const PRESENCE_CHANNEL = "site-online-users";

type OnlineUsersProps = {
  supabase: SupabaseClient | null;
};

export function OnlineUsers({ supabase }: OnlineUsersProps) {
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    const presenceKey = crypto.randomUUID();
    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: presenceKey } },
    });

    const updateCount = () => {
      if (!mounted) return;
      const state = channel.presenceState();
      setOnlineCount(Object.keys(state).length);
    };

    channel
      .on("presence", { event: "sync" }, updateCount)
      .on("presence", { event: "join" }, updateCount)
      .on("presence", { event: "leave" }, updateCount)
      .subscribe(async (status) => {
        if (!mounted) return;
        if (status === "SUBSCRIBED") {
          setConnected(true);
          await channel.track({ online_at: new Date().toISOString() });
          updateCount();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setConnected(false);
          setOnlineCount(null);
        }
      });

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const isLoading = !supabase || !connected || onlineCount === null;

  // Yükleme 2 sn'yi aşarsa "yükleniyor" metni yerine nötr rozet göster
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setShowFallback(true), 2000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading && showFallback) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400" aria-live="polite">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Piyasalar Takip Ediliyor
      </span>
    );
  }

  const label = !supabase || !connected || onlineCount === null
    ? "Çevrimiçi kullanıcılar yükleniyor"
    : `${onlineCount} çevrimiçi`;

  return (
    <span
      className="app-surface-2 app-border inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
      aria-live="polite"
      aria-label={label}
      title="Supabase Realtime ile anlık çevrimiçi kullanıcı sayısı"
    >
      <Users className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      <span className="app-text whitespace-nowrap">{label}</span>
      {connected ? <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-bull)]" aria-hidden="true" /> : null}
    </span>
  );
}
