export type MarketSymbol = {
  code: string;
  label: string;
  yahooSymbol: string;
  category: "endeks" | "hisse" | "doviz" | "emtia";
};

export const marketSymbols: MarketSymbol[] = [
  { code: "XU100", label: "BIST 100", yahooSymbol: "^XU100", category: "endeks" },
  { code: "THYAO", label: "THYAO", yahooSymbol: "THYAO.IS", category: "hisse" },
  { code: "ASELS", label: "ASELS", yahooSymbol: "ASELS.IS", category: "hisse" },
  { code: "GARAN", label: "GARAN", yahooSymbol: "GARAN.IS", category: "hisse" },
  { code: "AKBNK", label: "AKBNK", yahooSymbol: "AKBNK.IS", category: "hisse" },
  { code: "EREGL", label: "EREGL", yahooSymbol: "EREGL.IS", category: "hisse" },
  { code: "SASA", label: "SASA", yahooSymbol: "SASA.IS", category: "hisse" },
  { code: "KCHOL", label: "KCHOL", yahooSymbol: "KCHOL.IS", category: "hisse" },
  { code: "TUPRS", label: "TUPRS", yahooSymbol: "TUPRS.IS", category: "hisse" },
  { code: "BIMAS", label: "BIMAS", yahooSymbol: "BIMAS.IS", category: "hisse" },
  { code: "PGSUS", label: "PGSUS", yahooSymbol: "PGSUS.IS", category: "hisse" },
  { code: "FROTO", label: "FROTO", yahooSymbol: "FROTO.IS", category: "hisse" },
  { code: "TCELL", label: "TCELL", yahooSymbol: "TCELL.IS", category: "hisse" },
  { code: "SISE", label: "SISE", yahooSymbol: "SISE.IS", category: "hisse" },
  { code: "ISCTR", label: "ISCTR", yahooSymbol: "ISCTR.IS", category: "hisse" },
  { code: "YKBNK", label: "YKBNK", yahooSymbol: "YKBNK.IS", category: "hisse" },
  { code: "USDTRY", label: "USD/TRY", yahooSymbol: "TRY=X", category: "doviz" },
  { code: "EURTRY", label: "EUR/TRY", yahooSymbol: "EURTRY=X", category: "doviz" },
  { code: "XAUTRY", label: "Gram Altın", yahooSymbol: "GC=F", category: "emtia" },
];

/* ---- Genişletilmiş hisse dizini (arama & varlık sayfaları için) ---- */
export type StockCategory = "BIST 100" | "BIST Orta Ölçek" | "Global Hisseler";

export type StockEntry = {
  ticker: string;
  name: string;
  sector: string;
  category: StockCategory;
};

const rawBist100: Array<[string, string, string]> = [
  ["THYAO", "Türk Hava Yolları", "Ulaştırma"],
  ["ASELS", "Aselsan", "Savunma"],
  ["GARAN", "Garanti BBVA", "Bankacılık"],
  ["AKBNK", "Akbank", "Bankacılık"],
  ["ISCTR", "İş Bankası (C)", "Bankacılık"],
  ["YKBNK", "Yapı Kredi", "Bankacılık"],
  ["VAKBN", "VakıfBank", "Bankacılık"],
  ["HALKB", "Halkbank", "Bankacılık"],
  ["EREGL", "Ereğli Demir Çelik", "Metal Ana"],
  ["KRDMD", "Kardemir (D)", "Metal Ana"],
  ["SASA", "SASA Polyester", "Kimya"],
  ["KCHOL", "Koç Holding", "Holding"],
  ["SAHOL", "Sabancı Holding", "Holding"],
  ["TUPRS", "Tüpraş", "Petrol & Enerji"],
  ["BIMAS", "BİM Mağazalar", "Perakende"],
  ["MGROS", "Migros", "Perakende"],
  ["SOKM", "Şok Marketler", "Perakende"],
  ["PGSUS", "Pegasus", "Ulaştırma"],
  ["FROTO", "Ford Otosan", "Otomotiv"],
  ["TOASO", "Tofaş", "Otomotiv"],
  ["OTKAR", "Otokar", "Otomotiv"],
  ["TTRAK", "Türk Traktör", "Otomotiv"],
  ["TCELL", "Turkcell", "Telekomünikasyon"],
  ["TTKOM", "Türk Telekom", "Telekomünikasyon"],
  ["SISE", "Şişecam", "Cam & Ambalaj"],
  ["PETKM", "Petkim", "Kimya"],
  ["HEKTS", "Hektaş", "Kimya"],
  ["GUBRF", "Gübre Fabrikaları", "Kimya"],
  ["EKGYO", "Emlak Konut GYO", "GYO"],
  ["ENKAI", "Enka İnşaat", "İnşaat"],
  ["ARCLK", "Arçelik", "Dayanıklı Tüketim"],
  ["VESTL", "Vestel", "Dayanıklı Tüketim"],
  ["VESBE", "Vestel Beyaz Eşya", "Dayanıklı Tüketim"],
  ["ULKER", "Ülker Bisküvi", "Gıda & İçecek"],
  ["CCOLA", "Coca-Cola İçecek", "Gıda & İçecek"],
  ["AEFES", "Anadolu Efes", "Gıda & İçecek"],
  ["TAVHL", "TAV Havalimanları", "Ulaştırma"],
  ["DOHOL", "Doğan Holding", "Holding"],
  ["AGHOL", "AG Anadolu Grubu", "Holding"],
  ["ODAS", "Odaş Elektrik", "Enerji"],
  ["AKSEN", "Aksa Enerji", "Enerji"],
  ["ZOREN", "Zorlu Enerji", "Enerji"],
  ["ENJSA", "Enerjisa", "Enerji"],
  ["AYGAZ", "Aygaz", "Enerji"],
  ["KOZAL", "Koza Altın", "Madencilik"],
  ["KOZAA", "Koza Anadolu", "Madencilik"],
  ["IPEKE", "İpek Doğal Enerji", "Enerji"],
  ["TKFEN", "Tekfen Holding", "Holding"],
  ["ALARK", "Alarko Holding", "Holding"],
  ["GESAN", "Girişim Elektrik", "Enerji"],
  ["SMRTG", "Smart Güneş", "Enerji"],
  ["KONTR", "Kontrolmatik", "Enerji"],
  ["EUPWR", "Europower Enerji", "Enerji"],
  ["ASTOR", "Astor Enerji", "Enerji"],
  ["BRSAN", "Borusan Boru", "Metal Ana"],
  ["CIMSA", "Çimsa", "Çimento"],
  ["OYAKC", "Oyak Çimento", "Çimento"],
  ["AKCNS", "Akçansa", "Çimento"],
  ["KONYA", "Konya Çimento", "Çimento"],
  ["TSKB", "TSKB", "Bankacılık"],
  ["ALBRK", "Albaraka Türk", "Bankacılık"],
  ["ISMEN", "İş Yatırım", "Aracı Kurum"],
  ["GLYHO", "Global Yatırım", "Holding"],
  ["MAVI", "Mavi Giyim", "Tekstil & Giyim"],
  ["YATAS", "Yataş", "Mobilya"],
  ["EGEEN", "Ege Endüstri", "Otomotiv Yan"],
  ["KLSER", "Kaleseramik", "Seramik"],
  ["KLRHO", "Kiler Holding", "Holding"],
  ["BRYAT", "Borusan Yatırım", "Holding"],
  ["GWIND", "Galata Wind", "Enerji"],
  ["ISDMR", "İskenderun Demir", "Metal Ana"],
  ["TMSN", "Tümosan", "Makine"],
  ["KARSN", "Karsan", "Otomotiv"],
  ["DOAS", "Doğuş Otomotiv", "Otomotiv"],
  ["LOGO", "Logo Yazılım", "Bilişim"],
  ["SELEC", "Selçuk Ecza", "İlaç & Sağlık"],
  ["ECILC", "EİS Eczacıbaşı", "İlaç & Sağlık"],
  ["MPARK", "MLP Sağlık", "Sağlık Hizmetleri"],
  ["DEVA", "Deva Holding", "İlaç & Sağlık"],
  ["TKNSA", "Teknosa", "Perakende"],
  ["BIENY", "Bien Yapı", "İnşaat Malz."],
  ["KORDS", "Kordsa", "Kimya"],
  ["ALFAS", "Alfa Solar", "Enerji"],
  ["CANTE", "Çan2 Termik", "Enerji"],
  ["BERA", "Bera Holding", "Holding"],
  ["CWENE", "CW Enerji", "Enerji"],
  ["REEDR", "Reeder Teknoloji", "Bilişim"],
  ["PASEU", "Pasifik Eurasia", "Holding"],
  ["TABGD", "Tab Gıda", "Gıda & İçecek"],
  ["MIATK", "Mia Teknoloji", "Bilişim"],
  ["AGROT", "Agrotech", "Enerji"],
  ["BINHO", "Binho Ödeme", "Finansal Teknoloji"],
  ["FENER", "Fenerbahçe Futbol", "Spor"],
  ["GSRAY", "Galatasaray Sportif", "Spor"],
  ["BJKAS", "Beşiktaş Futbol", "Spor"],
  ["ENERY", "Enerya Enerji", "Enerji"],
  ["PEKGY", "Peker GYO", "GYO"],
];

const rawMidCap: Array<[string, string, string]> = [
  ["KAYSE", "Kayseri Şeker", "Gıda & İçecek"],
  ["SILVR", "SDT Uzay & Savunma", "Savunma"],
  ["SUNTK", "Söktaş Tekstil", "Tekstil & Giyim"],
  ["VAKKO", "Vakko Tekstil", "Tekstil & Giyim"],
  ["VKGYO", "Vakıf GYO", "GYO"],
  ["ZRGYO", "Ziraat GYO", "GYO"],
  ["TURSG", "Türkiye Sigorta", "Sigorta"],
  ["AKGRT", "Aksigorta", "Sigorta"],
  ["ANSGR", "Anadolu Sigorta", "Sigorta"],
  ["ANHYT", "Anadolu Hayat", "Sigorta"],
  ["INDES", "İndeks Bilgisayar", "Bilişim"],
  ["ARENA", "Arena Bilgisayar", "Bilişim"],
  ["ESCOM", "Escort Teknoloji", "Bilişim"],
  ["KAREL", "Karel Elektronik", "Bilişim"],
  ["NETAS", "Netaş Telekom", "Telekomünikasyon"],
  ["PENTA", "Penta Teknoloji", "Bilişim"],
  ["OBASE", "Obase Bilgisayar", "Bilişim"],
  ["ALKIM", "Alkim Kimya", "Kimya"],
  ["BAGFS", "Bagfaş", "Kimya"],
  ["EGGUB", "Ege Gübre", "Kimya"],
  ["GOODY", "Goodyear", "Otomotiv Yan"],
  ["BRISA", "Brisa", "Otomotiv Yan"],
  ["PRKME", "Park Elektrik", "Madencilik"],
  ["QUAGR", "QUA Granite", "Seramik"],
  ["BURCE", "Burçelik", "Makine"],
  ["JANTS", "Jantsa Jant", "Otomotiv Yan"],
  ["KATMR", "Katmerciler", "Savunma"],
  ["ORGE", "Orge Enerji", "Enerji"],
  ["NUHCM", "Nuh Çimento", "Çimento"],
  ["GOLTS", "Göltaş Çimento", "Çimento"],
  ["AKSA", "Aksa Akrilik", "Kimya"],
  ["SNGYO", "Sinpaş GYO", "GYO"],
  ["TSPOR", "Trabzonspor", "Spor"],
  ["DAGI", "Dagi Giyim", "Tekstil & Giyim"],
  ["DERIM", "Derimod", "Tekstil & Giyim"],
];

const rawGlobal: Array<[string, string, string]> = [
  ["AAPL", "Apple Inc.", "Teknoloji"],
  ["TSLA", "Tesla Inc.", "Otomotiv & Teknoloji"],
  ["AMZN", "Amazon.com", "E-Ticaret"],
  ["GOOGL", "Alphabet (Google)", "Teknoloji"],
  ["MSFT", "Microsoft", "Teknoloji"],
  ["NVDA", "NVIDIA", "Yarı İletken"],
  ["META", "Meta Platforms", "Teknoloji"],
  ["AMD", "AMD", "Yarı İletken"],
  ["NFLX", "Netflix", "Medya & Eğlence"],
  ["DIS", "Walt Disney", "Medya & Eğlence"],
  ["BABA", "Alibaba Group", "E-Ticaret"],
  ["BRK.B", "Berkshire Hathaway", "Holding"],
];

const dedupe = (rows: Array<[string, string, string]>, category: StockCategory): StockEntry[] => {
  const seen = new Set<string>();
  const result: StockEntry[] = [];
  for (const [ticker, name, sector] of rows) {
    const key = ticker.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ ticker: key, name, sector, category });
  }
  return result;
};

export const stockDirectory: StockEntry[] = [
  ...dedupe(rawBist100, "BIST 100"),
  ...dedupe(rawMidCap, "BIST Orta Ölçek"),
  ...dedupe(rawGlobal, "Global Hisseler"),
];

export const stockByTicker = new Map(stockDirectory.map((s) => [s.ticker, s]));

export const demoQuotes = marketSymbols.map((item, index) => ({
  code: item.code,
  label: item.label,
  price: Number((120 + index * 17.3 + (index % 3) * 2.2).toFixed(2)),
  changePct: Number((((index % 2 ? -1 : 1) * ((index % 7) + 1)) / 10).toFixed(2)),
  source: "Demo veri",
  timestamp: new Date().toISOString(),
}));
