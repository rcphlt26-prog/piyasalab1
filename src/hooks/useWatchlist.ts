"use client";

import { useCallback, useEffect, useState } from "react";
import { getClientId } from "@/lib/clientId";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "@/lib/supabase/data";

const LOCAL_KEY = "VeriAkış_watchlist";

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(tickers: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(tickers));
  } catch {
    /* yok say */
  }
}

/**
 * İzleme listesi (watchlist) yönetimi.
 * Supabase varsa user_watchlists tablosuyla senkron çalışır; yoksa localStorage'a düşer.
 * Her durumda localStorage'ı yerel önbellek olarak tutar (optimistic update).
 */
export function useWatchlist() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [localOnly, setLocalOnly] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const hasSupabase = Boolean(getSupabaseBrowserClient());
    setLocalOnly(!hasSupabase);

    async function load() {
      const local = readLocal();
      if (!hasSupabase) {
        if (!cancelled) {
          setTickers(local);
          setLoaded(true);
        }
        return;
      }
      const clientId = getClientId();
      const remote = await getWatchlist(clientId);
      if (cancelled) return;
      if (remote === null) {
        // Supabase erişilemiyor → yerel moda düş
        setLocalOnly(true);
        setTickers(local);
      } else {
        // Uzak ve yerel listeyi birleştir, uzağı esas al
        const merged = Array.from(new Set([...remote, ...local]));
        setTickers(merged);
        writeLocal(merged);
      }
      setLoaded(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isWatched = useCallback((ticker: string) => tickers.includes(ticker), [tickers]);

  const toggle = useCallback(
    async (ticker: string) => {
      const currentlyWatched = tickers.includes(ticker);
      const next = currentlyWatched
        ? tickers.filter((t) => t !== ticker)
        : [...tickers, ticker];
      // Optimistic update
      setTickers(next);
      writeLocal(next);

      if (!localOnly) {
        const clientId = getClientId();
        const ok = currentlyWatched
          ? await removeFromWatchlist(clientId, ticker)
          : await addToWatchlist(clientId, ticker);
        if (!ok) {
          // Supabase yazımı başarısız → yerel mod olarak işaretle (veri yerelde kalır)
          setLocalOnly(true);
        }
      }
    },
    [tickers, localOnly],
  );

  return { tickers, isWatched, toggle, localOnly, loaded };
}
