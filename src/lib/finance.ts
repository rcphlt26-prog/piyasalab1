import {
  bist100Series,
  eurTrySeries,
  gramGoldSeries,
  tuikCpiSeries,
  usCpiSeries,
  usdTrySeries,
  type YearPoint,
} from "@/data/historicalData";

export type CurrencyCode = "TL" | "USD" | "EUR" | "GBP" | "CHF" | "JPY" | "CAD" | "AUD" | "RUB" | "SAR" | "CNY" | "SEK" | "NOK" | "DKK" | "PLN" | "AED" | "KWD" | "QAR" | "KRW" | "INR";
type AssetType = "BIST100" | "GRAM_ALTIN" | "USD" | "EUR" | "MEVDUAT" | "TUFE" | "NAKIT";

export const currencyRatesToUsd: Record<Exclude<CurrencyCode, "TL">, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  CHF: 1.13,
  JPY: 0.0067,
  CAD: 0.74,
  AUD: 0.66,
  RUB: 0.011,
  SAR: 0.267,
  CNY: 0.138,
  SEK: 0.096,
  NOK: 0.094,
  DKK: 0.145,
  PLN: 0.25,
  AED: 0.272,
  KWD: 3.25,
  QAR: 0.275,
  KRW: 0.00074,
  INR: 0.012,
};

const toMap = (series: YearPoint[]) => new Map(series.map((x) => [x.year, x.value]));

const seriesMap = {
  BIST100: toMap(bist100Series),
  GRAM_ALTIN: toMap(gramGoldSeries),
  USD: toMap(usdTrySeries),
  EUR: toMap(eurTrySeries),
  TUFE: toMap(tuikCpiSeries),
  CPI_US: toMap(usCpiSeries),
};

const depositAnnualRate = 0.26;

export type ReturnResult = {
  finalNominal: number;
  gainPct: number;
  cagr: number;
  realTl: number;
  usdValue: number;
  realUsdAdjusted?: number;
  nominalUsd?: number;
  dividendCash: number;
  yearlyTrack: { year: number; value: number }[];
  message?: string;
};

function getValue(map: Map<number, number>, year: number) {
  if (map.has(year)) return map.get(year)!;
  const keys = [...map.keys()].sort((a, b) => a - b);
  const fallback = keys.reduce((acc, cur) => (Math.abs(cur - year) < Math.abs(acc - year) ? cur : acc), keys[0]);
  return map.get(fallback)!;
}

export function calculateReturn(input: {
  initial: number;
  currency: CurrencyCode;
  startYear: number;
  endYear: number;
  asset: AssetType;
  drip: boolean;
  usCpiAdjusted: boolean;
}): ReturnResult {
  const years = Math.max(1, input.endYear - input.startYear);
  const usdStart = getValue(seriesMap.USD, input.startYear);
  const usdEnd = getValue(seriesMap.USD, input.endYear);
  const startTl = input.currency === "TL"
    ? input.initial
    : input.initial * (currencyRatesToUsd[input.currency] ?? 1) * usdStart;

  if (input.asset === "BIST100" && input.startYear < 1986) {
    return {
      finalNominal: startTl,
      gainPct: 0,
      cagr: 0,
      realTl: startTl,
      usdValue: startTl / usdEnd,
      dividendCash: 0,
      yearlyTrack: [{ year: input.startYear, value: startTl }],
      message: "BIST 100 verisi 1986 sonrası için hesaplanır. Lütfen başlangıç yılını 1986 veya sonrası seçin.",
    };
  }

  const getGrowthFactor = (asset: AssetType, y: number) => {
    switch (asset) {
      case "BIST100":
        return getValue(seriesMap.BIST100, y + 1) / getValue(seriesMap.BIST100, y);
      case "GRAM_ALTIN":
        return getValue(seriesMap.GRAM_ALTIN, y + 1) / getValue(seriesMap.GRAM_ALTIN, y);
      case "USD":
        return getValue(seriesMap.USD, y + 1) / getValue(seriesMap.USD, y);
      case "EUR":
        return getValue(seriesMap.EUR, y + 1) / getValue(seriesMap.EUR, y);
      case "MEVDUAT":
        return 1 + depositAnnualRate;
      case "TUFE":
        return getValue(seriesMap.TUFE, y + 1) / getValue(seriesMap.TUFE, y);
      case "NAKIT":
        return 1;
      default:
        return 1;
    }
  };

  const yearlyTrack: { year: number; value: number }[] = [{ year: input.startYear, value: startTl }];
  let position = startTl;
  let dividendCash = 0;

  for (let y = input.startYear; y < input.endYear; y += 1) {
    const factor = getGrowthFactor(input.asset, y);
    if (input.asset === "BIST100") {
      const dividendYield = 0.035;
      const dividend = position * dividendYield;
      if (input.drip) {
        position = position * factor + dividend;
      } else {
        position = position * factor;
        dividendCash += dividend;
      }
    } else {
      position = position * factor;
    }
    yearlyTrack.push({ year: y + 1, value: position + (input.drip ? 0 : dividendCash) });
  }

  const finalNominal = position + (input.drip ? 0 : dividendCash);
  const gainPct = ((finalNominal / startTl - 1) * 100) || 0;
  const cagr = (Math.pow(finalNominal / startTl, 1 / years) - 1) * 100;

  const cpiStart = getValue(seriesMap.TUFE, input.startYear);
  const cpiEnd = getValue(seriesMap.TUFE, input.endYear);
  const realTl = finalNominal / (cpiEnd / cpiStart);
  const usdValue = finalNominal / usdEnd;

  let realUsdAdjusted: number | undefined;
  let nominalUsd: number | undefined;
  if (input.usCpiAdjusted) {
    nominalUsd = finalNominal / usdEnd;
    const usStart = getValue(seriesMap.CPI_US, input.startYear);
    const usEnd = getValue(seriesMap.CPI_US, input.endYear);
    realUsdAdjusted = nominalUsd / (usEnd / usStart);
  }

  return {
    finalNominal,
    gainPct,
    cagr,
    realTl,
    usdValue,
    realUsdAdjusted,
    nominalUsd,
    dividendCash,
    yearlyTrack,
  };
}

export function toAssetLabel(asset: AssetType) {
  return (
    {
      BIST100: "BIST 100",
      GRAM_ALTIN: "Gram Altın",
      USD: "USD",
      EUR: "EUR",
      MEVDUAT: "TL Mevduat/PPF",
      TUFE: "Enflasyon (TÜFE)",
      NAKIT: "Yastık altı nakit",
    } as Record<AssetType, string>
  )[asset];
}

export const assetList: AssetType[] = ["BIST100", "GRAM_ALTIN", "USD", "EUR", "MEVDUAT", "TUFE", "NAKIT"];
