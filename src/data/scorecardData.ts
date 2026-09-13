export type ScoreMetric = {
  valuation: number;
  health: number;
  dividend: number;
  growth: number;
  momentum: number;
  fk: number;
  pddd: number;
  note: string;
};

export const scorecardData: Record<string, ScoreMetric> = {
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

export const popularStocks = Object.keys(scorecardData);
