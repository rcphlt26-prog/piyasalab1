import { marketSymbols } from "@/data/marketSymbols";
import type { LiveQuote } from "@/hooks/useLiveQuotes";

const staticOverrides: Record<string, { price: number; changePct: number }> = {
  XU100: { price: 11426.8, changePct: 0.84 },
  XU030: { price: 12458.2, changePct: 0.91 },
  USDTRY: { price: 39.14, changePct: 0.23 },
  EURTRY: { price: 42.27, changePct: 0.18 },
  GBPTRY: { price: 49.14, changePct: 0.12 },
  GRAMALTIN: { price: 3396.2, changePct: 0.66 },
  ALTIN: { price: 2688.4, changePct: 0.41 },
  GUMUS: { price: 31.8, changePct: 0.52 },
  BTCUSD: { price: 68240, changePct: 1.24 },
  ETHUSD: { price: 3560, changePct: 0.98 },
  THYAO: { price: 317.2, changePct: 1.48 },
  ASELS: { price: 121.4, changePct: 0.73 },
  GARAN: { price: 145.1, changePct: 0.92 },
  AKBNK: { price: 72.6, changePct: 0.54 },
  EREGL: { price: 53.2, changePct: -0.28 },
  TUPRS: { price: 181.9, changePct: 0.45 },
  FROTO: { price: 985, changePct: 1.05 },
  KCHOL: { price: 212.5, changePct: 0.62 },
  SISE: { price: 48.7, changePct: 0.37 },
  BIMAS: { price: 552.5, changePct: 1.12 },
  SASA: { price: 37.84, changePct: -0.21 },
};

function seedFrom(code: string) {
  let hash = 0;
  for (const ch of code) hash = (hash * 33 + ch.charCodeAt(0)) >>> 0;
  return hash;
}

function priceByCategory(code: string, category: string) {
  const seed = seedFrom(code);
  const ratio = (seed % 10_000) / 10_000;
  if (category === "doviz") return Number((8 + ratio * 50).toFixed(4));
  if (category === "endeks") return Number((2500 + ratio * 12000).toFixed(2));
  if (category === "emtia") return Number((20 + ratio * 4200).toFixed(2));
  if (category === "kripto") return Number((0.05 + ratio * 80000).toFixed(4));
  return Number((12 + ratio * 1100).toFixed(2));
}

function changeByCode(code: string) {
  const seed = seedFrom(code + "-pct");
  const ratio = (seed % 10_000) / 10_000;
  return Number((-2.2 + ratio * 4.6).toFixed(2));
}

function isoCloseTimestamp() {
  const now = new Date();
  const close = new Date(now);
  close.setHours(18, 10, 0, 0);
  if (now.getHours() < 9) close.setDate(close.getDate() - 1);
  return close.toISOString();
}

export function getStaticMarketFallback(timestamp = isoCloseTimestamp()): LiveQuote[] {
  return marketSymbols.map((symbol) => {
    const predefined = staticOverrides[symbol.code];
    return {
      code: symbol.code,
      label: symbol.label,
      price: predefined?.price ?? priceByCategory(symbol.code, symbol.category),
      changePct: predefined?.changePct ?? changeByCode(symbol.code),
      source: "Son Kapanış",
      timestamp,
      direction: undefined,
    };
  });
}
