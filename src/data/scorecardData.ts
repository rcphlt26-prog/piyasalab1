import { rawBist100, rawMidCap } from "@/data/marketSymbols";

export type ScoreMetric = {
  valuation: number;
  health: number;
  dividend: number;
  growth: number;
  momentum: number;
  fk: number;
  pddd: number;
  /** Piyasa değeri (biçimlendirilmiş metin, temsili) */
  marketCap: string;
  /** 52 hafta en yüksek (temsili) */
  weekHigh52: number;
  /** 52 hafta en düşük (temsili) */
  weekLow52: number;
  /** Temettü verimi % (temsili) */
  dividendYield: number;
  /** Yıllık getiri % (temsili) */
  annualReturn: number;
  /** Beta (temsili) */
  beta: number;
  /** Borç/Özsermaye oranı (temsili) */
  debtEquity: number;
  note: string;
};

/* ---- Deterministik üretim yardımcıları ---- */
function seedFrom(ticker: string): number {
  let h = 2166136261;
  for (let i = 0; i < ticker.length; i++) {
    h ^= ticker.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (v: number, d = 2) => Number(v.toFixed(d));
const between = (r: number, min: number, max: number) => min + r * (max - min);
const intBetween = (r: number, min: number, max: number) => Math.round(between(r, min, max));

function formatMarketCap(billion: number): string {
  if (billion >= 1000) return `₺${round(billion / 1000, 2).toLocaleString("tr-TR")} trilyon`;
  return `₺${round(billion, 1).toLocaleString("tr-TR")} milyar`;
}

const noteTemplates: Array<(name: string, sector: string) => string> = [
  (n, s) => `${s} sektöründe faaliyet gösteren ${n}, dengeli bilanço yapısıyla öne çıkıyor.`,
  (n, s) => `${n} için nakit akışı görünümü istikrarlı; ${s} çevrimine duyarlılık göz önünde bulundurulmalı.`,
  (n) => `${n} hisselerinde çarpanlar sektör ortalamasına yakın seyrediyor.`,
  (n, s) => `${s} talebindeki toparlanma ${n} büyüme beklentilerini destekliyor.`,
  (n) => `${n} temettü kapasitesi ve operasyonel verimlilik açısından takip edilmeli.`,
];

/* ---- Elle düzenlenmiş temel skorlar (öne çıkan hisseler) ---- */
const curated: Record<string, Partial<ScoreMetric>> = {
  THYAO: { valuation: 8, health: 7, dividend: 6, growth: 8, momentum: 8, fk: 5.8, pddd: 1.1, note: "Küresel trafik toparlanması ve filo verimliliği büyümeyi destekliyor." },
  ASELS: { valuation: 6, health: 9, dividend: 5, growth: 8, momentum: 7, fk: 19.3, pddd: 2.9, note: "Savunma sipariş birikimi güçlü, fakat çarpanlar zaman zaman primli." },
  GARAN: { valuation: 8, health: 7, dividend: 7, growth: 6, momentum: 6, fk: 4.9, pddd: 0.95, note: "Banka marjları ve sermaye yeterliliği dengeli görünüm sunuyor." },
  AKBNK: { valuation: 8, health: 7, dividend: 8, growth: 6, momentum: 6, fk: 4.6, pddd: 1.0, note: "Temettü potansiyeli güçlü, kârlılık döngüsel olarak dalgalanabilir." },
  EREGL: { valuation: 7, health: 8, dividend: 8, growth: 5, momentum: 5, fk: 8.9, pddd: 1.3, note: "Nakit üretimi iyi, emtia çevrimine duyarlılık yüksek." },
  SASA: { valuation: 4, health: 6, dividend: 2, growth: 8, momentum: 7, fk: 27.4, pddd: 5.1, note: "Büyüme hikayesi güçlü fakat değerleme hassasiyeti yüksek." },
  KCHOL: { valuation: 7, health: 8, dividend: 7, growth: 6, momentum: 6, fk: 7.3, pddd: 1.2, note: "Holding iskontosu ve çeşitlendirilmiş yapı öne çıkıyor." },
  TUPRS: { valuation: 7, health: 7, dividend: 8, growth: 5, momentum: 6, fk: 6.4, pddd: 1.7, note: "Rafineri marjlarına duyarlı, temettü kapasitesi yüksek." },
  BIMAS: { valuation: 6, health: 8, dividend: 5, growth: 7, momentum: 7, fk: 15.8, pddd: 5.3, note: "Defansif iş modeli ve yüksek operasyonel çeviklik." },
  PGSUS: { valuation: 6, health: 6, dividend: 3, growth: 8, momentum: 8, fk: 9.4, pddd: 2.3, note: "Turizm ve kapasite artışıyla büyüme güçlü, yakıt maliyeti risk." },
  FROTO: { valuation: 7, health: 9, dividend: 8, growth: 7, momentum: 7, fk: 9.8, pddd: 6.1, note: "İhracat ve üretim verimliliği bilanço kalitesini destekliyor." },
  TCELL: { valuation: 7, health: 8, dividend: 7, growth: 6, momentum: 6, fk: 8.7, pddd: 1.6, note: "Abone bazlı nakit akışı ve yüksek temettü görünürlüğü." },
  SISE: { valuation: 7, health: 7, dividend: 6, growth: 6, momentum: 5, fk: 8.1, pddd: 1.1, note: "Küresel cam talebi ve enerji maliyetleri belirleyici." },
  ISCTR: { valuation: 8, health: 7, dividend: 8, growth: 6, momentum: 5, fk: 4.3, pddd: 0.9, note: "Çarpan iskontosu dikkat çekiyor, regülasyonlar belirleyici." },
  YKBNK: { valuation: 8, health: 7, dividend: 7, growth: 6, momentum: 6, fk: 4.8, pddd: 1.0, note: "Dijital dönüşüm ve maliyet disiplini pozitif katkı sunuyor." },
};

function generate(ticker: string, name: string, sector: string): ScoreMetric {
  const rnd = mulberry32(seedFrom(ticker));
  const low = round(between(rnd(), 10, 180), 2);
  const high = round(low * between(rnd(), 1.4, 3.2), 2);
  const base: ScoreMetric = {
    valuation: intBetween(rnd(), 3, 9),
    health: intBetween(rnd(), 4, 9),
    dividend: intBetween(rnd(), 2, 9),
    growth: intBetween(rnd(), 3, 9),
    momentum: intBetween(rnd(), 3, 9),
    fk: round(between(rnd(), 3.5, 28), 1),
    pddd: round(between(rnd(), 0.6, 6), 2),
    marketCap: formatMarketCap(between(rnd(), 3, 1400)),
    weekLow52: low,
    weekHigh52: high,
    dividendYield: round(between(rnd(), 0, 9), 1),
    annualReturn: round(between(rnd(), -35, 120), 1),
    beta: round(between(rnd(), 0.4, 1.8), 2),
    debtEquity: round(between(rnd(), 0.1, 2.4), 2),
    note: noteTemplates[intBetween(rnd(), 0, noteTemplates.length - 1)](name, sector),
  };
  return { ...base, ...curated[ticker] };
}

const allRows = [...rawBist100, ...rawMidCap];
const seen = new Set<string>();

export const scorecardData: Record<string, ScoreMetric> = {};
for (const [ticker, name, sector] of allRows) {
  const key = ticker.toUpperCase();
  if (seen.has(key)) continue;
  seen.add(key);
  scorecardData[key] = generate(key, name, sector);
}

export const popularStocks = Object.keys(scorecardData);
