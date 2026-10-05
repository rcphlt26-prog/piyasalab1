import YahooFinance from "yahoo-finance2";
import { marketSymbolByCode } from "@/data/marketSymbols";
import { toTry } from "@/lib/gameMath";

const yahoo = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const CACHE_TTL_MS = 20_000;
const cache = new Map<string, { price: number; at: number }>();

const GOLD_FACTORS: Record<string, number> = {
  GRAMALTIN: 1,
  CEYREKALTIN: 1.754,
  YARIMALTIN: 3.508,
  TAMALTIN: 7.016,
  ATAALTIN: 7.216,
  RESATALTIN: 7.216,
  BILEZIK22: 1,
};

const chunk = <T,>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));

async function fetchFreshPrices(codes: string[]) {
  const symbols = codes.map((code) => marketSymbolByCode.get(code)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const yahooSymbols = [...new Set([...symbols.map((item) => item.yahooSymbol), "GC=F", "SI=F", "TRY=X"])];
  const settled = await Promise.allSettled(chunk(yahooSymbols, 20).map((group) => yahoo.quote(group)));
  const rows = settled.flatMap((result) => (result.status === "rejected" ? [] : Array.isArray(result.value) ? result.value : [result.value]));
  const bySymbol = new Map(rows.map((row) => [row.symbol, Number(row.regularMarketPrice ?? 0)]));
  const ounceGold = bySymbol.get("GC=F") ?? 0;
  const ounceSilver = bySymbol.get("SI=F") ?? 0;
  const usdTry = bySymbol.get("TRY=X") ?? 0;

  const prices = new Map<string, number>();
  for (const item of symbols) {
    const gramSilver = item.code === "GRAMGUMUS" ? (ounceSilver * usdTry) / 31.1035 : 0;
    const goldFactor = GOLD_FACTORS[item.code];
    const gold = goldFactor ? ((ounceGold * usdTry * goldFactor) / 31.1035) * (item.code === "BILEZIK22" ? 0.9167 : 1) : 0;
    const native = gramSilver || gold || bySymbol.get(item.yahooSymbol) || 0;
    const priceTry = gramSilver || gold ? native : toTry(item.code, native, usdTry);
    if (Number.isFinite(priceTry) && priceTry > 0) prices.set(item.code, priceTry);
  }
  return prices;
}

/** Oyun sembollerinin TL cinsinden güncel fiyatları; kısa süreli önbellek ile Yahoo çağrıları azaltılır. */
export async function getTryPrices(codes: string[]) {
  const now = Date.now();
  const result = new Map<string, number>();
  const missing: string[] = [];
  for (const code of new Set(codes)) {
    const cached = cache.get(code);
    if (cached && now - cached.at < CACHE_TTL_MS) result.set(code, cached.price);
    else missing.push(code);
  }
  if (missing.length) {
    const fresh = await fetchFreshPrices(missing);
    for (const [code, price] of fresh) {
      cache.set(code, { price, at: now });
      result.set(code, price);
    }
  }
  return result;
}
