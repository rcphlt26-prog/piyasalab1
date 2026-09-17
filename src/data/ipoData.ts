export type IpoStatus = "Bekliyor" | "Tamamlandı";

export type IpoItem = {
  company: string;
  ticker: string;
  sector: string;
  priceMin: number;
  priceMax: number;
  date: string; // YYYY-MM-DD (arz tarihi)
  status: IpoStatus;
  lotSize: number;
};

/** Temsili/eğitim amaçlı halka arz verisi. Gerçek yatırım tavsiyesi değildir. */
export const ipoData: IpoItem[] = [
  { company: "Anadolu Güneş Enerji", ticker: "ANGES", sector: "Enerji", priceMin: 18, priceMax: 21, date: "2026-09-22", status: "Bekliyor", lotSize: 1 },
  { company: "Marmara Teknoloji", ticker: "MRTEK", sector: "Bilişim", priceMin: 32, priceMax: 36, date: "2026-09-18", status: "Bekliyor", lotSize: 1 },
  { company: "Ege Gıda Sanayi", ticker: "EGEGD", sector: "Gıda & İçecek", priceMin: 12, priceMax: 14, date: "2026-09-15", status: "Bekliyor", lotSize: 1 },
  { company: "Toros Lojistik", ticker: "TRLOJ", sector: "Ulaştırma", priceMin: 24, priceMax: 27, date: "2026-09-08", status: "Tamamlandı", lotSize: 1 },
  { company: "Kapadokya Turizm", ticker: "KPTUR", sector: "Turizm", priceMin: 9, priceMax: 11, date: "2026-09-02", status: "Tamamlandı", lotSize: 1 },
  { company: "Trakya Kimya", ticker: "TRKIM", sector: "Kimya", priceMin: 40, priceMax: 45, date: "2026-08-27", status: "Tamamlandı", lotSize: 1 },
  { company: "Karadeniz Madencilik", ticker: "KRMAD", sector: "Madencilik", priceMin: 15, priceMax: 18, date: "2026-08-20", status: "Tamamlandı", lotSize: 1 },
  { company: "Anadolu Savunma Sistemleri", ticker: "ANSAV", sector: "Savunma", priceMin: 55, priceMax: 62, date: "2026-08-12", status: "Tamamlandı", lotSize: 1 },
  { company: "Doğu Perakende", ticker: "DGPER", sector: "Perakende", priceMin: 21, priceMax: 24, date: "2026-08-05", status: "Tamamlandı", lotSize: 1 },
  { company: "Batı Sağlık Grubu", ticker: "BTSAG", sector: "Sağlık Hizmetleri", priceMin: 28, priceMax: 31, date: "2026-07-29", status: "Tamamlandı", lotSize: 1 },
  { company: "Akdeniz İnşaat", ticker: "AKINS", sector: "İnşaat", priceMin: 17, priceMax: 20, date: "2026-07-22", status: "Tamamlandı", lotSize: 1 },
  { company: "Yıldız Tekstil", ticker: "YLDTX", sector: "Tekstil & Giyim", priceMin: 8, priceMax: 10, date: "2026-07-15", status: "Tamamlandı", lotSize: 1 },
];
