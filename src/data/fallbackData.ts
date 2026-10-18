// Son bilinen kapanış verileri — canlı API çekilemediğinde kullanılır
export const MARKET_FALLBACK = {
  'XU100': { price: 9842.31, change: 0.87, changePercent: 0.87, currency: 'TRY', label: 'BIST 100', unit: 'puan', low52: 8120.0, high52: 10540.0 },
  'USDTRY=X': { price: 38.42, change: 0.15, changePercent: 0.39, currency: 'TRY', label: 'USD/TRY', unit: '₺', low52: 32.10, high52: 40.20 },
  'EURTRY=X': { price: 41.87, change: 0.21, changePercent: 0.50, currency: 'TRY', label: 'EUR/TRY', unit: '₺', low52: 34.50, high52: 43.60 },
  'XAUTRY=X': { price: 4128.50, change: 22.30, changePercent: 0.54, currency: 'TRY', label: 'Gram Altın', unit: '₺', low52: 3210.0, high52: 4380.0 },
  'BTC-USD': { price: 105420.0, change: 1240.0, changePercent: 1.19, currency: 'USD', label: 'Bitcoin', unit: '$', low52: 52000.0, high52: 112000.0 },
  'THYAO.IS': { price: 312.40, change: 4.20, changePercent: 1.36, currency: 'TRY', label: 'THYAO', unit: '₺', low52: 218.0, high52: 358.0 },
  'ASELS.IS': { price: 187.60, change: -1.80, changePercent: -0.95, currency: 'TRY', label: 'ASELS', unit: '₺', low52: 142.0, high52: 224.0 },
  'GARAN.IS': { price: 148.30, change: 2.10, changePercent: 1.44, currency: 'TRY', label: 'GARAN', unit: '₺', low52: 98.5, high52: 167.0 },
  'AKBNK.IS': { price: 92.75, change: 0.85, changePercent: 0.93, currency: 'TRY', label: 'AKBNK', unit: '₺', low52: 64.2, high52: 105.8 },
  'EREGL.IS': { price: 74.35, change: -0.45, changePercent: -0.60, currency: 'TRY', label: 'EREGL', unit: '₺', low52: 56.8, high52: 88.5 },
  'TUPRS.IS': { price: 248.90, change: 3.60, changePercent: 1.47, currency: 'TRY', label: 'TUPRS', unit: '₺', low52: 182.0, high52: 287.0 },
};

export type MarketFallbackKey = keyof typeof MARKET_FALLBACK;

// Uygulama içi sembol kodları (marketSymbols.ts) → MARKET_FALLBACK anahtarları
export const FALLBACK_CODE_MAP: Record<string, MarketFallbackKey> = {
  XU100: 'XU100',
  USDTRY: 'USDTRY=X',
  EURTRY: 'EURTRY=X',
  GRAMALTIN: 'XAUTRY=X',
  BTCUSD: 'BTC-USD',
  THYAO: 'THYAO.IS',
  ASELS: 'ASELS.IS',
  GARAN: 'GARAN.IS',
  AKBNK: 'AKBNK.IS',
  EREGL: 'EREGL.IS',
  TUPRS: 'TUPRS.IS',
};

export const BIST30_FUNDAMENTALS = [
  { symbol: 'THYAO', name: 'Türk Hava Yolları', fk: 8.2, pddd: 1.4, ok: 18.3, temettü: 3.1 },
  { symbol: 'TUPRS', name: 'Tüpraş', fk: 6.1, pddd: 1.8, ok: 24.7, temettü: 7.2 },
  { symbol: 'ASELS', name: 'Aselsan', fk: 14.3, pddd: 3.1, ok: 22.1, temettü: 1.8 },
  { symbol: 'FROTO', name: 'Ford Otosan', fk: 11.7, pddd: 4.2, ok: 35.6, temettü: 4.5 },
  { symbol: 'EREGL', name: 'Ereğli Demir Çelik', fk: 7.8, pddd: 1.2, ok: 15.4, temettü: 8.1 },
  { symbol: 'GARAN', name: 'Garanti BBVA', fk: 5.3, pddd: 1.1, ok: 28.9, temettü: 5.6 },
];
