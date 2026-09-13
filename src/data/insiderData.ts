export type InsiderTxn = {
  id: string;
  ticker: string;
  company: string;
  actor: string;
  type: "Alım" | "Satım" | "Geri Alım";
  shares: number;
  approxValue: number;
  date: string;
  source: string;
};

export const insiderTransactions: InsiderTxn[] = [
  { id: "i1", ticker: "THYAO", company: "Türk Hava Yolları", actor: "Yönetim Kurulu Üyesi", type: "Alım", shares: 420000, approxValue: 138600000, date: "2026-08-29", source: "KAP bildirimi (temsili)" },
  { id: "i2", ticker: "EREGL", company: "Ereğli Demir Çelik", actor: "Bağlı Ortaklık", type: "Geri Alım", shares: 1500000, approxValue: 91500000, date: "2026-08-24", source: "Şirket duyurusu (temsili)" },
  { id: "i3", ticker: "SASA", company: "SASA Polyester", actor: "Ana Hissedar", type: "Satım", shares: 680000, approxValue: 89760000, date: "2026-08-18", source: "KAP bildirimi (temsili)" },
  { id: "i4", ticker: "GARAN", company: "Garanti BBVA", actor: "İcra Kurulu", type: "Alım", shares: 240000, approxValue: 33120000, date: "2026-08-10", source: "KAP bildirimi (temsili)" },
  { id: "i5", ticker: "AKBNK", company: "Akbank", actor: "Yönetici", type: "Satım", shares: 300000, approxValue: 20400000, date: "2026-08-06", source: "KAP bildirimi (temsili)" },
  { id: "i6", ticker: "FROTO", company: "Ford Otosan", actor: "Şirket", type: "Geri Alım", shares: 85000, approxValue: 105400000, date: "2026-07-31", source: "Şirket duyurusu (temsili)" },
  { id: "i7", ticker: "TUPRS", company: "Tüpraş", actor: "Bağımsız Üye", type: "Alım", shares: 110000, approxValue: 26070000, date: "2026-07-28", source: "KAP bildirimi (temsili)" },
];
