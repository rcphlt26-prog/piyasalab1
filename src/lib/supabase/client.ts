import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseSingleton: SupabaseClient | null | undefined;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (supabaseSingleton !== undefined) {
    return supabaseSingleton;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    supabaseSingleton = null;
    return null;
  }

  supabaseSingleton = createClient(url, anonKey, {
    realtime: {
      params: { eventsPerSecond: 8 },
    },
  });

  return supabaseSingleton;
}
