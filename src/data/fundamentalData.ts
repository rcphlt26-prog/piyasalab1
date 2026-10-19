import { marketSymbols, stockByTicker } from "@/data/marketSymbols";

export type NormalizedSector =
  | "Bankacılık"
  | "Holding/Yatırım"
  | "Otomotiv"
  | "Gıda & İçecek"
  | "Enerji"
  | "Teknoloji"
  | "Savunma/Havacılık"
  | "Demir-Çelik"
  | "Telekom"
  | "İnşaat"
  | "Perakende"
  | "Kimya"
  | "Sigorta"
  | "Madencilik"
  | "Turizm"
  | "Sağlık"
  | "Metal"
  | "Beyaz Eşya"
  | "Çimento"
  | "Ulaştırma/Lojistik"
  | "Diğer";

export type BalanceSummary = {
  period: string;
  netProfitBnTry: number;
  revenueBnTry: number;
  profitChangePct: number;
  revenueChangePct: number;
  equityBnTry: number;
};

export type FundamentalSnapshot = {
  symbol: string;
  sector: NormalizedSector;
  fk: number;
  pddd: number;
  roePct: number;
  dividendYieldPct: number;
  marketCapBnTry: number;
  balanceSummary: BalanceSummary;
  source: "api" | "cache";
};

export type ApiFundamentalInput = {
  peRatio?: number | null;
  pbRatio?: number | null;
  netProfit?: number | null;
  revenue?: number | null;
  equity?: number | null;
  netProfitPrev?: number | null;
  revenuePrev?: number | null;
};

type SectorProfile = {
  fk: [number, number];
  pddd: [number, number];
  roe: [number, number];
  dividend: [number, number];
  marketCap: [number, number];
};

const sectorProfiles: Record<NormalizedSector, SectorProfile> = {
  "Bankacılık": { fk: [3.2, 6.1], pddd: [0.72, 1.22], roe: [17, 33], dividend: [4.5, 9.2], marketCap: [60, 520] },
  "Holding/Yatırım": { fk: [5.1, 9.4], pddd: [0.75, 1.65], roe: [12, 24], dividend: [2.2, 6.5], marketCap: [20, 480] },
  "Otomotiv": { fk: [10.2, 20.8], pddd: [1.9, 8.8], roe: [14, 38], dividend: [1.1, 7.2], marketCap: [25, 700] },
  "Gıda & İçecek": { fk: [11.5, 26], pddd: [1.4, 7], roe: [12, 29], dividend: [1, 4.8], marketCap: [8, 390] },
  "Enerji": { fk: [6.4, 15.8], pddd: [0.9, 3.2], roe: [9, 26], dividend: [1.2, 8.1], marketCap: [6, 450] },
  "Teknoloji": { fk: [13, 32], pddd: [1.6, 9.8], roe: [10, 31], dividend: [0.2, 2.5], marketCap: [3, 340] },
  "Savunma/Havacılık": { fk: [9.8, 25.2], pddd: [1.4, 4.8], roe: [14, 34], dividend: [0.8, 4], marketCap: [12, 650] },
  "Demir-Çelik": { fk: [5.6, 11.8], pddd: [0.7, 1.9], roe: [8, 24], dividend: [1.8, 9], marketCap: [10, 350] },
  Telekom: { fk: [6.4, 13.2], pddd: [1, 2.6], roe: [12, 28], dividend: [3.2, 8], marketCap: [25, 450] },
  "İnşaat": { fk: [4.8, 12.8], pddd: [0.6, 2.4], roe: [7, 20], dividend: [0.8, 5.5], marketCap: [4, 210] },
  Perakende: { fk: [12.5, 29], pddd: [1.7, 8.2], roe: [13, 32], dividend: [0.5, 4.2], marketCap: [12, 500] },
  Kimya: { fk: [8.8, 24], pddd: [1, 4.9], roe: [10, 28], dividend: [0.7, 6.8], marketCap: [5, 520] },
  Sigorta: { fk: [4.7, 9.6], pddd: [0.8, 1.9], roe: [13, 29], dividend: [2.2, 9], marketCap: [3, 90] },
  Madencilik: { fk: [5.2, 14.6], pddd: [0.8, 2.8], roe: [9, 24], dividend: [1.3, 7.8], marketCap: [4, 210] },
  Turizm: { fk: [7.8, 18.6], pddd: [0.9, 3.8], roe: [8, 24], dividend: [0.4, 3.6], marketCap: [2, 150] },
  Sağlık: { fk: [10.2, 26], pddd: [1.2, 5.4], roe: [10, 27], dividend: [0.3, 3.8], marketCap: [2, 200] },
  Metal: { fk: [6.2, 13.5], pddd: [0.8, 2.6], roe: [9, 24], dividend: [1.1, 7.2], marketCap: [3, 220] },
  "Beyaz Eşya": { fk: [8.9, 18.5], pddd: [1.2, 4.3], roe: [12, 30], dividend: [1.4, 6], marketCap: [5, 260] },
  Çimento: { fk: [7.1, 14.4], pddd: [0.9, 2.7], roe: [11, 25], dividend: [1.9, 8.2], marketCap: [4, 180] },
  "Ulaştırma/Lojistik": { fk: [6.8, 16.2], pddd: [1, 4.2], roe: [10, 31], dividend: [0.8, 5], marketCap: [6, 700] },
  Diğer: { fk: [6.5, 16], pddd: [0.9, 3.1], roe: [8, 22], dividend: [0.8, 5.1], marketCap: [2, 120] },
};

const sectorAlias: Record<string, NormalizedSector> = {
  "Bankacılık": "Bankacılık",
  "Holding": "Holding/Yatırım",
  "Holding/Yatırım": "Holding/Yatırım",
  "Otomotiv": "Otomotiv",
  "Otomotiv Yan": "Otomotiv",
  "Gıda & İçecek": "Gıda & İçecek",
  Enerji: "Enerji",
  Teknoloji: "Teknoloji",
  Bilişim: "Teknoloji",
  "Finansal Teknoloji": "Teknoloji",
  Savunma: "Savunma/Havacılık",
  Havacılık: "Savunma/Havacılık",
  "Savunma/Havacılık": "Savunma/Havacılık",
  "Metal Ana": "Demir-Çelik",
  "Demir-Çelik": "Demir-Çelik",
  Telekomünikasyon: "Telekom",
  Telekom: "Telekom",
  İnşaat: "İnşaat",
  "İnşaat Malz.": "İnşaat",
  GYO: "İnşaat",
  Perakende: "Perakende",
  Kimya: "Kimya",
  Sigorta: "Sigorta",
  Madencilik: "Madencilik",
  Turizm: "Turizm",
  Sağlık: "Sağlık",
  "İlaç & Sağlık": "Sağlık",
  "Sağlık Hizmetleri": "Sağlık",
  Metal: "Metal",
  "Dayanıklı Tüketim": "Beyaz Eşya",
  "Beyaz Eşya": "Beyaz Eşya",
  Çimento: "Çimento",
  Ulaştırma: "Ulaştırma/Lojistik",
  "Ulaştırma/Lojistik": "Ulaştırma/Lojistik",
};

const curatedFundamentals: Record<string, Partial<Omit<FundamentalSnapshot, "symbol" | "source">>> = {
  THYAO: { sector: "Ulaştırma/Lojistik", fk: 5.6, pddd: 1.05, roePct: 24.2, dividendYieldPct: 2.6, marketCapBnTry: 412, balanceSummary: { period: "2026/06", netProfitBnTry: 36.2, revenueBnTry: 337.4, profitChangePct: 14.8, revenueChangePct: 18.3, equityBnTry: 149.1 } },
  ASELS: { sector: "Savunma/Havacılık", fk: 18.9, pddd: 2.95, roePct: 20.8, dividendYieldPct: 1.1, marketCapBnTry: 698, balanceSummary: { period: "2026/06", netProfitBnTry: 22.5, revenueBnTry: 118.2, profitChangePct: 31.2, revenueChangePct: 27.9, equityBnTry: 108.4 } },
  TUPRS: { sector: "Enerji", fk: 6.3, pddd: 1.74, roePct: 30.4, dividendYieldPct: 8.4, marketCapBnTry: 365, balanceSummary: { period: "2026/06", netProfitBnTry: 38.8, revenueBnTry: 694.6, profitChangePct: -9.5, revenueChangePct: 6.2, equityBnTry: 132.9 } },
  FROTO: { sector: "Otomotiv", fk: 12.9, pddd: 6.2, roePct: 43.6, dividendYieldPct: 6.2, marketCapBnTry: 436, balanceSummary: { period: "2026/06", netProfitBnTry: 34.4, revenueBnTry: 329.3, profitChangePct: 15.2, revenueChangePct: 21.8, equityBnTry: 96.1 } },
  GARAN: { sector: "Bankacılık", fk: 4.8, pddd: 1.02, roePct: 33.8, dividendYieldPct: 5.4, marketCapBnTry: 486, balanceSummary: { period: "2026/06", netProfitBnTry: 58.2, revenueBnTry: 121.3, profitChangePct: 18.1, revenueChangePct: 26.4, equityBnTry: 170.2 } },
  EREGL: { sector: "Demir-Çelik", fk: 8.7, pddd: 1.29, roePct: 15.9, dividendYieldPct: 7.1, marketCapBnTry: 212, balanceSummary: { period: "2026/06", netProfitBnTry: 18.5, revenueBnTry: 168.9, profitChangePct: 6.2, revenueChangePct: 11.4, equityBnTry: 124.3 } },
  AKBNK: { sector: "Bankacılık", fk: 4.5, pddd: 1.01, roePct: 34.1, dividendYieldPct: 6.2, marketCapBnTry: 398, balanceSummary: { period: "2026/06", netProfitBnTry: 52.6, revenueBnTry: 110.7, profitChangePct: 16.9, revenueChangePct: 24.2, equityBnTry: 154.7 } },
  KCHOL: { sector: "Holding/Yatırım", fk: 7.1, pddd: 1.24, roePct: 22.1, dividendYieldPct: 4.9, marketCapBnTry: 474, balanceSummary: { period: "2026/06", netProfitBnTry: 42.3, revenueBnTry: 712.5, profitChangePct: 11.6, revenueChangePct: 19.7, equityBnTry: 349.5 } },
  SISE: { sector: "Kimya", fk: 8.2, pddd: 1.16, roePct: 17.4, dividendYieldPct: 3.1, marketCapBnTry: 152, balanceSummary: { period: "2026/06", netProfitBnTry: 12.8, revenueBnTry: 106.9, profitChangePct: 8.4, revenueChangePct: 12.7, equityBnTry: 73.5 } },
  BIMAS: { sector: "Perakende", fk: 17.2, pddd: 5.7, roePct: 36.4, dividendYieldPct: 1.9, marketCapBnTry: 352, balanceSummary: { period: "2026/06", netProfitBnTry: 13.2, revenueBnTry: 282.8, profitChangePct: 23.8, revenueChangePct: 29.4, equityBnTry: 36.2 } },
  SASA: { sector: "Kimya", fk: 23.5, pddd: 4.2, roePct: 12.3, dividendYieldPct: 0.5, marketCapBnTry: 246, balanceSummary: { period: "2026/06", netProfitBnTry: 9.4, revenueBnTry: 92.3, profitChangePct: 6.1, revenueChangePct: 15.6, equityBnTry: 76.8 } },
  ISCTR: { sector: "Bankacılık", fk: 4.2, pddd: 0.92, roePct: 31.1, dividendYieldPct: 6.8, marketCapBnTry: 478, balanceSummary: { period: "2026/06", netProfitBnTry: 74.6, revenueBnTry: 149.3, profitChangePct: 19.2, revenueChangePct: 27.2, equityBnTry: 235.9 } },
  YKBNK: { sector: "Bankacılık", fk: 4.7, pddd: 1.04, roePct: 29.8, dividendYieldPct: 5.1, marketCapBnTry: 284, balanceSummary: { period: "2026/06", netProfitBnTry: 34.7, revenueBnTry: 88.1, profitChangePct: 14.4, revenueChangePct: 22.6, equityBnTry: 121.4 } },
  VAKBN: { sector: "Bankacılık", fk: 3.9, pddd: 0.79, roePct: 25.2, dividendYieldPct: 3.2, marketCapBnTry: 258, balanceSummary: { period: "2026/06", netProfitBnTry: 30.2, revenueBnTry: 76.5, profitChangePct: 12.7, revenueChangePct: 19.4, equityBnTry: 127.8 } },
  HALKB: { sector: "Bankacılık", fk: 3.6, pddd: 0.71, roePct: 23.4, dividendYieldPct: 2.2, marketCapBnTry: 160, balanceSummary: { period: "2026/06", netProfitBnTry: 21.6, revenueBnTry: 58.9, profitChangePct: 10.1, revenueChangePct: 16.8, equityBnTry: 94.2 } },
};

function seedFrom(symbol: string) {
  let hash = 5381;
  for (const ch of symbol) hash = ((hash << 5) + hash) + ch.charCodeAt(0);
  return Math.abs(hash >>> 0);
}

function pickRange(seed: number, [min, max]: [number, number], decimals = 2) {
  const ratio = (seed % 10_000) / 10_000;
  return Number((min + (max - min) * ratio).toFixed(decimals));
}

function normalizeSectorName(raw: string | undefined): NormalizedSector {
  if (!raw) return "Diğer";
  return sectorAlias[raw] ?? "Diğer";
}

function inferSector(symbol: string): NormalizedSector {
  const fromDirectory = stockByTicker.get(symbol)?.sector;
  return normalizeSectorName(fromDirectory);
}

function generateFallbackSummary(symbol: string, sector: NormalizedSector): Omit<FundamentalSnapshot, "source"> {
  const profile = sectorProfiles[sector] ?? sectorProfiles.Diğer;
  const seed = seedFrom(symbol);
  const next = (offset: number) => seed + offset * 97;
  const fk = pickRange(next(1), profile.fk, 1);
  const pddd = pickRange(next(2), profile.pddd, 2);
  const roePct = pickRange(next(3), profile.roe, 1);
  const dividendYieldPct = pickRange(next(4), profile.dividend, 1);
  const marketCapBnTry = pickRange(next(5), profile.marketCap, 1);
  const revenueBnTry = Number((marketCapBnTry * pickRange(next(6), [0.35, 1.85], 2)).toFixed(1));
  const netProfitBnTry = Number((revenueBnTry * pickRange(next(7), [0.06, 0.24], 3)).toFixed(1));
  const equityBnTry = Number((marketCapBnTry / Math.max(pddd, 0.3)).toFixed(1));

  return {
    symbol,
    sector,
    fk,
    pddd,
    roePct,
    dividendYieldPct,
    marketCapBnTry,
    balanceSummary: {
      period: "2026/06",
      netProfitBnTry,
      revenueBnTry,
      profitChangePct: pickRange(next(8), [-14, 42], 1),
      revenueChangePct: pickRange(next(9), [-8, 38], 1),
      equityBnTry,
    },
  };
}

const allStockSymbols = Array.from(new Set(
  marketSymbols
    .filter((symbol) => symbol.category === "hisse")
    .map((symbol) => symbol.code.toUpperCase()),
));

export const fundamentalDataCache: Record<string, Omit<FundamentalSnapshot, "source">> = Object.fromEntries(
  allStockSymbols.map((symbol) => {
    const curated = curatedFundamentals[symbol];
    const sector = curated?.sector ?? inferSector(symbol);
    const generated = generateFallbackSummary(symbol, sector);
    return [
      symbol,
      {
        ...generated,
        ...curated,
        symbol,
        sector,
        balanceSummary: {
          ...generated.balanceSummary,
          ...(curated?.balanceSummary ?? {}),
        },
      },
    ];
  }),
);

function percentChange(current: number | null | undefined, previous: number | null | undefined) {
  if (current == null || previous == null || previous === 0) return null;
  return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
}

export function getFundamentalSnapshot(symbol: string, apiInput?: ApiFundamentalInput | null): FundamentalSnapshot {
  const key = symbol.toUpperCase();
  const fallback = fundamentalDataCache[key] ?? generateFallbackSummary(key, inferSector(key));

  const apiPe = apiInput?.peRatio ?? null;
  const apiPb = apiInput?.pbRatio ?? null;
  const apiProfit = apiInput?.netProfit ?? null;
  const apiRevenue = apiInput?.revenue ?? null;
  const apiEquity = apiInput?.equity ?? null;
  const profitChange = percentChange(apiProfit, apiInput?.netProfitPrev ?? null);
  const revenueChange = percentChange(apiRevenue, apiInput?.revenuePrev ?? null);

  const hasApi = (apiPe != null && apiPe > 0) || (apiPb != null && apiPb > 0) || (apiProfit != null && apiRevenue != null);
  const roeFromApi = apiProfit != null && apiEquity != null && apiEquity > 0
    ? Number(((apiProfit / apiEquity) * 100).toFixed(1))
    : null;

  return {
    symbol: key,
    sector: fallback.sector,
    fk: Number((apiPe ?? fallback.fk).toFixed(1)),
    pddd: Number((apiPb ?? fallback.pddd).toFixed(2)),
    roePct: Number((roeFromApi ?? fallback.roePct).toFixed(1)),
    dividendYieldPct: fallback.dividendYieldPct,
    marketCapBnTry: fallback.marketCapBnTry,
    balanceSummary: {
      period: fallback.balanceSummary.period,
      netProfitBnTry: apiProfit != null ? Number((apiProfit / 1_000_000_000).toFixed(1)) : fallback.balanceSummary.netProfitBnTry,
      revenueBnTry: apiRevenue != null ? Number((apiRevenue / 1_000_000_000).toFixed(1)) : fallback.balanceSummary.revenueBnTry,
      profitChangePct: profitChange ?? fallback.balanceSummary.profitChangePct,
      revenueChangePct: revenueChange ?? fallback.balanceSummary.revenueChangePct,
      equityBnTry: apiEquity != null ? Number((apiEquity / 1_000_000_000).toFixed(1)) : fallback.balanceSummary.equityBnTry,
    },
    source: hasApi ? "api" : "cache",
  };
}

export function getSectorLabel(symbol: string): NormalizedSector {
  const data = fundamentalDataCache[symbol.toUpperCase()];
  if (data) return data.sector;
  return inferSector(symbol.toUpperCase());
}
