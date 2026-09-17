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
  { id: "i1", ticker: "THYAO", company: "Türk Hava Yolları", actor: "Yönetim Kurulu Üyesi", type: "Alım", shares: 420000, approxValue: 138600000, date: "2026-08-29", source: "Eğitim simülasyonu - gerçek KAP kaydı değildir" },
  { id: "i2", ticker: "EREGL", company: "Ereğli Demir Çelik", actor: "Bağlı Ortaklık", type: "Geri Alım", shares: 1500000, approxValue: 91500000, date: "2026-08-24", source: "Şirket duyurusu (temsili)" },
  { id: "i3", ticker: "SASA", company: "SASA Polyester", actor: "Ana Hissedar", type: "Satım", shares: 680000, approxValue: 89760000, date: "2026-08-18", source: "KAP bildirimi (temsili)" },
  { id: "i4", ticker: "GARAN", company: "Garanti BBVA", actor: "İcra Kurulu", type: "Alım", shares: 240000, approxValue: 33120000, date: "2026-08-10", source: "KAP bildirimi (temsili)" },
  { id: "i5", ticker: "AKBNK", company: "Akbank", actor: "Yönetici", type: "Satım", shares: 300000, approxValue: 20400000, date: "2026-08-06", source: "KAP bildirimi (temsili)" },
  { id: "i6", ticker: "FROTO", company: "Ford Otosan", actor: "Şirket", type: "Geri Alım", shares: 85000, approxValue: 105400000, date: "2026-07-31", source: "Şirket duyurusu (temsili)" },
  { id: "i7", ticker: "TUPRS", company: "Tüpraş", actor: "Bağımsız Üye", type: "Alım", shares: 110000, approxValue: 26070000, date: "2026-07-28", source: "KAP bildirimi (temsili)" },
  { id: "i8", ticker: "ASELS", company: "Aselsan", actor: "Yönetim Kurulu Üyesi", type: "Alım", shares: 260000, approxValue: 18980000, date: "2026-07-22", source: "KAP bildirimi (temsili)" },
  { id: "i9", ticker: "BIMAS", company: "BİM Mağazalar", actor: "Şirket", type: "Geri Alım", shares: 320000, approxValue: 168000000, date: "2026-07-19", source: "Şirket duyurusu (temsili)" },
  { id: "i10", ticker: "KCHOL", company: "Koç Holding", actor: "Ana Hissedar", type: "Alım", shares: 540000, approxValue: 102600000, date: "2026-07-14", source: "KAP bildirimi (temsili)" },
  { id: "i11", ticker: "PGSUS", company: "Pegasus", actor: "Yönetici", type: "Satım", shares: 95000, approxValue: 47500000, date: "2026-07-09", source: "KAP bildirimi (temsili)" },
  { id: "i12", ticker: "SISE", company: "Şişecam", actor: "Bağlı Ortaklık", type: "Geri Alım", shares: 1200000, approxValue: 66000000, date: "2026-07-03", source: "Şirket duyurusu (temsili)" },
  { id: "i13", ticker: "TCELL", company: "Turkcell", actor: "İcra Kurulu", type: "Alım", shares: 410000, approxValue: 38540000, date: "2026-06-27", source: "KAP bildirimi (temsili)" },
  { id: "i14", ticker: "YKBNK", company: "Yapı Kredi", actor: "Yönetici", type: "Satım", shares: 720000, approxValue: 25920000, date: "2026-06-21", source: "KAP bildirimi (temsili)" },
  { id: "i15", ticker: "ISCTR", company: "İş Bankası (C)", actor: "Yönetim Kurulu Üyesi", type: "Alım", shares: 350000, approxValue: 21000000, date: "2026-06-16", source: "KAP bildirimi (temsili)" },
  { id: "i16", ticker: "ARCLK", company: "Arçelik", actor: "Şirket", type: "Geri Alım", shares: 480000, approxValue: 62400000, date: "2026-06-10", source: "Şirket duyurusu (temsili)" },
  { id: "i17", ticker: "TOASO", company: "Tofaş", actor: "Ana Hissedar", type: "Satım", shares: 130000, approxValue: 31200000, date: "2026-06-04", source: "KAP bildirimi (temsili)" },
  { id: "i18", ticker: "SAHOL", company: "Sabancı Holding", actor: "Bağımsız Üye", type: "Alım", shares: 610000, approxValue: 55510000, date: "2026-05-29", source: "KAP bildirimi (temsili)" },
  { id: "i19", ticker: "KRDMD", company: "Kardemir (D)", actor: "Yönetici", type: "Alım", shares: 900000, approxValue: 27000000, date: "2026-05-23", source: "KAP bildirimi (temsili)" },
  { id: "i20", ticker: "MGROS", company: "Migros", actor: "Şirket", type: "Geri Alım", shares: 175000, approxValue: 87500000, date: "2026-05-17", source: "Şirket duyurusu (temsili)" },
];
