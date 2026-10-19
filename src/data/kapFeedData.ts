import { fundamentalDataCache } from "@/data/fundamentalData";

export type KapFeedItem = {
  id: string;
  symbol: string;
  title: string;
  summary: string;
  category: "Finansal Tablo" | "Faaliyet Raporu" | "Genel Kurul" | "Temettü" | "Yatırım" | "Diğer";
  publishDate: string;
  kapUrl: string;
};

export type StatementFeedItem = {
  id: string;
  symbol: string;
  period: string;
  netProfit: number;
  revenue: number;
  equity: number;
  profitChangePct: number;
  revenueChangePct: number;
  publishDate: string;
};

const BIST30_SYMBOLS = [
  "THYAO", "ASELS", "GARAN", "AKBNK", "ISCTR", "YKBNK", "VAKBN", "HALKB", "EREGL", "KRDMD",
  "SASA", "KCHOL", "SAHOL", "TUPRS", "BIMAS", "MGROS", "PGSUS", "FROTO", "TOASO", "TCELL",
  "TTKOM", "SISE", "PETKM", "ENKAI", "ARCLK", "ULKER", "CCOLA", "AEFES", "TAVHL", "KOZAL",
] as const;

const kapTemplates = [
  { title: "2025/12 Dönemi Faaliyet Raporu", category: "Faaliyet Raporu" as const },
  { title: "Kâr Payı Dağıtım Önerisi", category: "Temettü" as const },
  { title: "Olağan Genel Kurul Toplantı Çağrısı", category: "Genel Kurul" as const },
  { title: "Finansal Tablo ve Dipnot Açıklaması", category: "Finansal Tablo" as const },
  { title: "Yatırım Harcaması Süreç Güncellemesi", category: "Yatırım" as const },
];

function dayOffset(seed: number, index: number) {
  return (seed + index * 11) % 75;
}

function seedFrom(value: string) {
  let out = 0;
  for (const ch of value) out = (out * 31 + ch.charCodeAt(0)) >>> 0;
  return out;
}

function toIsoDate(dayOffsetValue: number) {
  const base = new Date("2026-10-19T09:15:00.000Z");
  base.setUTCDate(base.getUTCDate() - dayOffsetValue);
  return base.toISOString();
}

export const fallbackKapFeed: KapFeedItem[] = BIST30_SYMBOLS.flatMap((symbol) => {
  const seed = seedFrom(symbol);
  return kapTemplates.map((template, index) => {
    const publishDate = toIsoDate(dayOffset(seed, index));
    const data = fundamentalDataCache[symbol];
    const growth = data?.balanceSummary.revenueChangePct ?? 0;
    return {
      id: `${symbol}-${index}`,
      symbol,
      title: `${symbol} · ${template.title}`,
      summary: `${symbol} yönetimi tarafından yapılan açıklamada ${template.title.toLowerCase()} kapsamında dönemsel gelir değişimi %${growth.toFixed(1)} seviyesinde paylaşıldı.`,
      category: template.category,
      publishDate,
      kapUrl: `https://www.kap.org.tr/tr/sirket-bilgileri/ozet/${symbol.toLowerCase()}`,
    };
  });
});

export const fallbackStatementFeed: StatementFeedItem[] = BIST30_SYMBOLS.map((symbol, index) => {
  const data = fundamentalDataCache[symbol];
  const publishDate = toIsoDate((index * 3) % 60);
  const fallback = data?.balanceSummary;
  return {
    id: `${symbol}-statement`,
    symbol,
    period: fallback?.period ?? "2026/06",
    netProfit: Math.round((fallback?.netProfitBnTry ?? 8) * 1_000_000_000),
    revenue: Math.round((fallback?.revenueBnTry ?? 45) * 1_000_000_000),
    equity: Math.round((fallback?.equityBnTry ?? 22) * 1_000_000_000),
    profitChangePct: fallback?.profitChangePct ?? 0,
    revenueChangePct: fallback?.revenueChangePct ?? 0,
    publishDate,
  };
});

export function getKapFallback(symbols: string[], limit = 20): KapFeedItem[] {
  const selected = new Set(symbols.map((symbol) => symbol.toUpperCase()));
  const list = fallbackKapFeed
    .filter((item) => selected.size === 0 || selected.has(item.symbol))
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  return list.slice(0, limit);
}

export function getStatementFallback(symbols: string[], limit = 20): StatementFeedItem[] {
  const selected = new Set(symbols.map((symbol) => symbol.toUpperCase()));
  const list = fallbackStatementFeed
    .filter((item) => selected.size === 0 || selected.has(item.symbol))
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  return list.slice(0, limit);
}
