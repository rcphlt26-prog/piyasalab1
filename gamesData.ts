export type RegretScenario = {
  id: string;
  label: string;
  amount: number;
  year: number;
  description: string;
  currency: "TRY" | "USD";
};

export const regretScenarios: RegretScenario[] = [
  { id: "ev2013", label: "2013'te 100.000₺ ile ev peşinatı", amount: 100000, year: 2013, description: "2013'te bir ev peşinatına ayırdığın parayı borsaya koysaydın ne olurdu?", currency: "TRY" },
  { id: "btc2017", label: "2017'de 10.000 USD Bitcoin", amount: 10000, year: 2017, description: "2017'de kripto çılgınlığında ayırdığın dövizi farklı varlıklara koysaydın?", currency: "USD" },
  { id: "thyaoeregl2010", label: "2010'da THYAO vs EREGL (50.000₺)", amount: 50000, year: 2010, description: "2010'da iki BİST devine yatırdığın paranın bugünkü değerini karşılaştır.", currency: "TRY" },
  { id: "covid2020", label: "2020 COVID düşüşünde 50.000₺", amount: 50000, year: 2020, description: "Mart 2020 dip döneminde cesaret edip yatırım yapsaydın?", currency: "TRY" },
  { id: "aylik1000", label: "Her ay 1.000₺ BIST100 (2015'ten beri)", amount: 1000, year: 2015, description: "2015'ten bu yana her ay düzenli 1.000₺ yatırsaydın (aylık ~120 katkı).", currency: "TRY" },
  { id: "altindolar2022", label: "2022'de altın vs dolar (25.000₺)", amount: 25000, year: 2022, description: "2022'de altına mı dolara mı girmeliydin? Sonucu birlikte görelim.", currency: "TRY" },
  { id: "iphone2020", label: "2020'de iPhone almak", amount: 9000, year: 2020, description: "Yeni telefon yerine o parayı yatırıma koysaydın?", currency: "TRY" },
  { id: "car2018", label: "2018'de ikinci el araba almak", amount: 85000, year: 2018, description: "Araba yerine portföye ayırsaydın bugünkü tablo ne olurdu?", currency: "TRY" },
  { id: "vacation2021", label: "2021'de lüks tatil yapmak", amount: 18000, year: 2021, description: "Tatil bütçeni yatırıma yönlendirseydin?", currency: "TRY" },
  { id: "wedding2017", label: "2017'de düğün organizasyonu", amount: 40000, year: 2017, description: "Düğün masrafının bir kısmını yatırıma koysaydın?", currency: "TRY" },
  { id: "crypto2022", label: "2022'de kripto sepeti almak", amount: 30000, year: 2022, description: "2022 ayı piyasasında kripto yerine klasik varlıklarda kalsaydın?", currency: "TRY" },
];

export const duelPeriods = [
  { label: "1 Yıl", years: 1 },
  { label: "3 Yıl", years: 3 },
  { label: "5 Yıl", years: 5 },
  { label: "10 Yıl", years: 10 },
];

/** Günlük deterministik piyasa özeti ipuçları */
export const dailyTips = [
  "Bugün sabır günü: Plan dışı işlem yapmadan önce iki kez düşün.",
  "Hacim teyidi olmadan kırılıma güvenme; teyidi bekle.",
  "Riskini yönet: Tek hisseye portföyün büyük kısmını bağlama.",
  "Temettü tarihlerini takip et, nakit akışı önemlidir.",
  "Piyasa gürültüsünü azalt: Uzun vadeli hedefine odaklan.",
  "Zarar durdurma seviyeni önceden belirle, duygularla değil planla hareket et.",
  "Çeşitlendirme en ucuz sigortadır; sektör dağılımına dikkat et.",
];
