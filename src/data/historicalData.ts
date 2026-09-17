export type YearPoint = { year: number; value: number };

const currentYear = new Date().getFullYear();

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

function interpolateSeries(anchors: Record<number, number>, start = 1980, end = currentYear): YearPoint[] {
  const years = Object.keys(anchors)
    .map(Number)
    .sort((a, b) => a - b);

  return range(start, end).map((year) => {
    if (anchors[year] !== undefined) {
      return { year, value: anchors[year] };
    }

    const prevYear = [...years].reverse().find((y) => y < year) ?? years[0];
    const nextYear = years.find((y) => y > year) ?? years[years.length - 1];
    const prevVal = anchors[prevYear];
    const nextVal = anchors[nextYear];

    if (prevYear === nextYear) {
      return { year, value: prevVal };
    }

    const ratio = (year - prevYear) / (nextYear - prevYear);
    const interpolated = prevVal + (nextVal - prevVal) * ratio;
    return { year, value: Number(interpolated.toFixed(4)) };
  });
}

/**
 * USD/TRY yıl sonu yaklaşımı (temsili/yuvarlanmış): TCMB tarihsel kur ortalamaları + piyasa yıl sonu kapanışlarından türetilmiş yaklaşık seri.
 */
export const usdTrySeries = interpolateSeries({
  1980: 0.075,
  1985: 0.67,
  1990: 2.93,
  1995: 45.7,
  2000: 620000,
  2005: 1.34,
  2010: 1.54,
  2015: 2.91,
  2018: 5.29,
  2019: 5.95,
  2020: 7.43,
  2021: 13.33,
  2022: 18.70,
  2023: 29.53,
  2024: 35.20,
  2025: 38.50,
  2026: 40.20,
});

/**
 * EUR/TRY yıl sonu yaklaşımı (temsili/yuvarlanmış): ECB/TCMB kur arşivleri ve piyasa kapanışlarının yaklaşık birleştirilmiş serisi.
 */
export const eurTrySeries = interpolateSeries({
  1999: 0.65,
  2005: 1.59,
  2010: 2.05,
  2015: 3.18,
  2018: 6.05,
  2020: 9.10,
  2021: 15.07,
  2022: 19.93,
  2023: 32.71,
  2024: 38.20,
  2025: 41.80,
  2026: 43.70,
});

/**
 * Gram altın TL yıl sonu yaklaşımı (temsili): Borsa/kapalıçarşı tarihsel gram altın fiyat yayınları ve haber arşivlerinden yaklaşık seri.
 */
export const gramGoldSeries = interpolateSeries({
  1980: 0.20,
  1985: 1.25,
  1990: 35,
  1995: 410,
  2000: 6200,
  2005: 22.5,
  2010: 70,
  2015: 100,
  2018: 220,
  2020: 455,
  2021: 780,
  2022: 1095,
  2023: 1965,
  2024: 2450,
  2025: 3020,
  2026: 3340,
});

/**
 * BIST 100 yıl sonu kapanış yaklaşımı (temsili): Borsa İstanbul tarihsel endeks kapanışlarından yaklaşık seri.
 * Not: Endeks 1986 sonrası hesaplandığı için 1986 öncesi aynı başlangıç değeri gösterim amaçlı kullanılır.
 */
export const bist100Series = interpolateSeries({
  1986: 100,
  1990: 290,
  1995: 11000,
  2000: 9500,
  2005: 39777,
  2010: 66504,
  2015: 71726,
  2018: 91000,
  2020: 1476,
  2021: 1857,
  2022: 5509,
  2023: 7470,
  2024: 10120,
  2025: 11850,
  2026: 13240,
});

/**
 * TÜFE endeksi (2003=100 ölçeğine normalize temsili seri): TÜİK uzun dönem enflasyon göstergelerinden yaklaşıklaştırılmıştır.
 */
export const tuikCpiSeries = interpolateSeries({
  1980: 0.07,
  1985: 0.44,
  1990: 2.6,
  1995: 16.2,
  2000: 78,
  2005: 114,
  2010: 161,
  2015: 241,
  2018: 364,
  2020: 505,
  2021: 686,
  2022: 1128,
  2023: 1859,
  2024: 2670,
  2025: 3320,
  2026: 3900,
});

/**
 * ABD TÜFE endeksi (1982-84=100 tabanına yakın temsili seri): BLS CPI-U tarihsel serisinden yaklaşık.
 */
export const usCpiSeries = interpolateSeries({
  1980: 82.4,
  1985: 107.6,
  1990: 130.7,
  1995: 152.4,
  2000: 172.2,
  2005: 195.3,
  2010: 218.1,
  2015: 237,
  2018: 251.1,
  2020: 258.8,
  2021: 271,
  2022: 292.7,
  2023: 305.4,
  2024: 314.2,
  2025: 321.1,
  2026: 328.3,
});

/**
 * Türkiye net asgari ücret (yıllık yaklaşık TL karşılığı): ÇSGB/TÜİK derlemelerinden yuvarlanmış temsili seri.
 */
export const minimumWageSeries = interpolateSeries({
  1980: 8,
  1985: 280,
  1990: 420000,
  1995: 8400000,
  2000: 109800000,
  2005: 350,
  2010: 599,
  2015: 1000,
  2018: 1603,
  2020: 2324,
  2021: 2825,
  2022: 5500,
  2023: 11402,
  2024: 17002,
  2025: 23000,
  2026: 27000,
});

/**
 * Çeyrek altın, Big Mac ve gündelik ürün sepeti fiyatları (temsili): kamuya açık arşiv/haber verilerinden yaklaşıklaştırılmıştır.
 */
export const quarterGoldSeries = interpolateSeries({
  1980: 1,
  1990: 180,
  2000: 35000,
  2005: 37,
  2010: 115,
  2015: 170,
  2020: 730,
  2022: 1750,
  2023: 3100,
  2024: 4200,
  2025: 5300,
  2026: 6100,
});

export const bigMacSeries = interpolateSeries({
  1980: 0.08,
  1990: 1.6,
  2000: 2.8,
  2005: 4.5,
  2010: 7,
  2015: 12,
  2020: 21,
  2022: 45,
  2023: 75,
  2024: 115,
  2025: 155,
  2026: 180,
});

export const dailyBasketSeries = interpolateSeries({
  1980: 0.2,
  1990: 4.2,
  2000: 6200,
  2005: 6.5,
  2010: 11,
  2015: 20,
  2020: 38,
  2022: 95,
  2023: 155,
  2024: 235,
  2025: 290,
  2026: 340,
});

export const historicalSources = [
  "TÜİK TÜFE ve fiyat göstergeleri (uzun dönem yayınları, yaklaşıklaştırılmış)",
  "TCMB ve piyasa arşivlerinden USD/TRY ve EUR/TRY yıl sonu değerleri (yaklaşık)",
  "Borsa İstanbul tarihsel endeks kapanışları (BIST 100, yaklaşık)",
  "BLS CPI-U (ABD TÜFE) tarihsel seri (yaklaşık)",
  "Kamuya açık haber/arşiv verilerinden gram/çeyrek altın, Big Mac ve gündelik ürün fiyatları (temsili)",
] as const;
