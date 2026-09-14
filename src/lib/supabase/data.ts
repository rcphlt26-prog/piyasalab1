import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { IpoItem, IpoStatus } from "@/data/ipoData";
import type { NewsItem, NewsCategory } from "@/data/newsData";

/**
 * Supabase veri erişim katmanı (yalnızca istemci tarafı).
 * Her fonksiyon, Supabase istemcisi yoksa veya sorgu hata verirse null döndürür;
 * böylece çağıran bileşen yerel demo verisine zarif şekilde düşebilir.
 */

type IpoRow = {
  company: string;
  ticker: string;
  sector: string | null;
  price_min: number | null;
  price_max: number | null;
  ipo_date: string | null;
  status: string | null;
  lot_size: number | null;
};

type NewsRow = {
  slug: string;
  title: string;
  summary: string | null;
  category: string;
  source: string | null;
  news_date: string | null;
  breaking: boolean | null;
  related_tickers: string[] | null;
};

type WatchlistRow = {
  ticker: string;
};

/** Supabase 'ipos' tablosundan halka arz kayıtlarını çeker ve IpoItem tipine map'ler. */
export async function fetchIpos(): Promise<IpoItem[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("ipos")
      .select("company, ticker, sector, price_min, price_max, ipo_date, status, lot_size")
      .order("ipo_date", { ascending: false });
    if (error || !data || data.length === 0) return null;
    return (data as IpoRow[]).map((r) => ({
      company: r.company,
      ticker: r.ticker,
      sector: r.sector ?? "-",
      priceMin: Number(r.price_min ?? 0),
      priceMax: Number(r.price_max ?? 0),
      date: r.ipo_date ?? "",
      status: (r.status === "Tamamlandı" ? "Tamamlandı" : "Bekliyor") as IpoStatus,
      lotSize: Number(r.lot_size ?? 1),
    }));
  } catch {
    return null;
  }
}

const VALID_CATEGORIES: NewsCategory[] = ["Ekonomi", "BIST", "Döviz", "Emtia"];

/** Supabase 'news' tablosundan haberleri çeker ve NewsItem tipine map'ler. */
export async function fetchNews(): Promise<NewsItem[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("news")
      .select("slug, title, summary, category, source, news_date, breaking, related_tickers")
      .order("news_date", { ascending: false });
    if (error || !data || data.length === 0) return null;
    return (data as NewsRow[]).map((r) => ({
      slug: r.slug,
      title: r.title,
      summary: r.summary ?? "",
      category: (VALID_CATEGORIES.includes(r.category as NewsCategory)
        ? (r.category as NewsCategory)
        : "Ekonomi"),
      source: r.source ?? "Piyasalab",
      date: r.news_date ?? "",
      breaking: Boolean(r.breaking),
      relatedTickers: r.related_tickers ?? [],
    }));
  } catch {
    return null;
  }
}

/** Belirtilen client_id için izleme listesindeki ticker'ları döndürür. Hata → null. */
export async function getWatchlist(clientId: string): Promise<string[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !clientId) return null;
  try {
    const { data, error } = await supabase
      .from("user_watchlists")
      .select("ticker")
      .eq("client_id", clientId);
    if (error || !data) return null;
    return (data as WatchlistRow[]).map((r) => r.ticker);
  } catch {
    return null;
  }
}

/** İzleme listesine ticker ekler. Başarılıysa true. */
export async function addToWatchlist(clientId: string, ticker: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !clientId) return false;
  try {
    const { error } = await supabase
      .from("user_watchlists")
      .upsert({ client_id: clientId, ticker }, { onConflict: "client_id,ticker" });
    return !error;
  } catch {
    return false;
  }
}

/** İzleme listesinden ticker çıkarır. Başarılıysa true. */
export async function removeFromWatchlist(clientId: string, ticker: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !clientId) return false;
  try {
    const { error } = await supabase
      .from("user_watchlists")
      .delete()
      .eq("client_id", clientId)
      .eq("ticker", ticker);
    return !error;
  } catch {
    return false;
  }
}
