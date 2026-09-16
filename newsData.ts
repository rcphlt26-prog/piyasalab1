export type NewsCategory = "Ekonomi" | "BIST" | "Döviz" | "Emtia";

export type NewsItem = {
  slug: string;
  title: string;
  summary: string;
  category: NewsCategory;
  source: string;
  date: string; // YYYY-MM-DD
  url?: string;
  breaking?: boolean;
  relatedTickers?: string[];
};

/** Tüm haberler temsili/eğitim amaçlıdır; gerçek yatırım tavsiyesi içermez. */
export const newsData: NewsItem[] = [
  { slug: "tcmb-faiz-karari-piyasa", title: "TCMB faiz kararı öncesi piyasalarda temkinli seyir", summary: "Merkez Bankası'nın toplantısı öncesinde yatırımcılar pozisyonlarını sadeleştirdi; tahvil faizleri yatay seyretti.", category: "Ekonomi", source: "VeriAkış Ekonomi", date: "2026-09-12", breaking: true },
  { slug: "bist100-rekor-kapanis", title: "BIST 100 haftayı rekor kapanışla tamamladı", summary: "Bankacılık ve holding hisselerindeki alımlarla endeks gün içi zirvesini yeniledi.", category: "BIST", source: "Borsa Gündem", date: "2026-09-12", relatedTickers: ["GARAN", "AKBNK", "KCHOL"] },
  { slug: "dolar-kur-gorunumu", title: "Dolar/TL'de dar bant: Yatırımcı yön arıyor", summary: "Küresel dolar endeksindeki hareketler kur cephesinde volatiliteyi sınırlı tuttu.", category: "Döviz", source: "Döviz Masası", date: "2026-09-11" },
  { slug: "gram-altin-yeni-zirve", title: "Gram altın ons ve kur etkisiyle yeni zirvede", summary: "Güvenli liman talebi ve kur etkisiyle gram altın tarihi yüksek seviyelere ulaştı.", category: "Emtia", source: "Emtia Bülteni", date: "2026-09-11", breaking: true },
  { slug: "thyao-yolcu-rekoru", title: "THYAO yaz sezonunda yolcu rekoru açıkladı", summary: "Şirket, doluluk oranları ve dış hat yolcu sayısında güçlü büyüme bildirdi.", category: "BIST", source: "Şirket Haberleri", date: "2026-09-10", relatedTickers: ["THYAO"] },
  { slug: "enflasyon-beklenti-anketi", title: "Yıl sonu enflasyon beklentisi anketi güncellendi", summary: "Piyasa katılımcıları yıl sonu için tahminlerini bir miktar aşağı revize etti.", category: "Ekonomi", source: "VeriAkış Ekonomi", date: "2026-09-10" },
  { slug: "aselsan-yeni-ihracat", title: "ASELSAN yeni ihracat sözleşmesi imzaladı", summary: "Savunma devinin sipariş birikimi yeni anlaşmayla güçlenmeye devam ediyor.", category: "BIST", source: "Savunma Sanayi", date: "2026-09-09", relatedTickers: ["ASELS"] },
  { slug: "petrol-fiyatlari-arz", title: "Brent petrol arz endişeleriyle yükseldi", summary: "OPEC+ üretim planları ve stok verileri enerji fiyatlarını hareketlendirdi.", category: "Emtia", source: "Emtia Bülteni", date: "2026-09-09", relatedTickers: ["TUPRS"] },
  { slug: "euro-parite-hareketi", title: "EUR/USD paritesi kritik seviyeyi test ediyor", summary: "Avrupa Merkez Bankası açıklamaları parite tarafında oynaklığı artırdı.", category: "Döviz", source: "Döviz Masası", date: "2026-09-08" },
  { slug: "bimas-magaza-buyumesi", title: "BİM mağaza ağı genişlemesini sürdürüyor", summary: "Perakende zinciri yeni mağaza açılışları ve ciro büyümesi paylaştı.", category: "BIST", source: "Perakende Raporu", date: "2026-09-08", relatedTickers: ["BIMAS"] },
  { slug: "sanayi-uretim-verisi", title: "Sanayi üretimi verisi beklentilerin üzerinde", summary: "Aylık sanayi üretim endeksi imalat sektöründeki toparlanmayı işaret etti.", category: "Ekonomi", source: "VeriAkış Ekonomi", date: "2026-09-05" },
  { slug: "eregl-celik-fiyatlari", title: "Ereğli çelik fiyatlarındaki toparlanmadan etkilendi", summary: "Küresel çelik talebi ve fiyat hareketleri hisseye ilgiyi artırdı.", category: "BIST", source: "Sanayi Haberleri", date: "2026-09-05", relatedTickers: ["EREGL"] },
  { slug: "mevduat-faizleri-guncelleme", title: "Bankalarda mevduat faizleri güncellendi", summary: "TL mevduat getirilerinde bankalar arası rekabet sürüyor.", category: "Ekonomi", source: "Bankacılık Masası", date: "2026-09-04" },
  { slug: "gumus-emtia-ralli", title: "Gümüş, altınla birlikte ralli yaptı", summary: "Değerli metallerdeki genel yükseliş gümüşü de destekledi.", category: "Emtia", source: "Emtia Bülteni", date: "2026-09-04" },
  { slug: "sasa-yatirim-plani", title: "SASA kapasite yatırımı planını duyurdu", summary: "Şirket, üretim kapasitesini artıracak yeni yatırım adımlarını açıkladı.", category: "BIST", source: "Şirket Haberleri", date: "2026-09-03", relatedTickers: ["SASA"] },
  { slug: "kur-korumali-mevduat", title: "Kur korumalı ürünlerde yeni düzenleme gündemde", summary: "Ekonomi yönetimi tasarruf araçlarına ilişkin yeni adımları değerlendiriyor.", category: "Döviz", source: "Döviz Masası", date: "2026-09-03" },
  { slug: "garan-bilanco", title: "Garanti BBVA çeyreklik bilançosunu açıkladı", summary: "Net kâr ve net faiz marjı verileri beklentilerle uyumlu geldi.", category: "BIST", source: "Bankacılık Masası", date: "2026-09-02", relatedTickers: ["GARAN"] },
  { slug: "issizlik-orani-veri", title: "İşsizlik oranı verisi açıklandı", summary: "İstihdam piyasasındaki görünüm son verilerle netleşti.", category: "Ekonomi", source: "VeriAkış Ekonomi", date: "2026-09-02" },
  { slug: "dogalgaz-fiyat-hareketi", title: "Doğal gaz fiyatları kış öncesi hareketlendi", summary: "Talep beklentileri ve stok seviyeleri enerji tarafında öne çıktı.", category: "Emtia", source: "Emtia Bülteni", date: "2026-09-01" },
  { slug: "tofas-yeni-model", title: "Tofaş yeni model yatırımına ilişkin adım attı", summary: "Otomotiv üreticisi üretim ve ihracat planlarını güncelledi.", category: "BIST", source: "Otomotiv Raporu", date: "2026-09-01", relatedTickers: ["TOASO"] },
  { slug: "cari-denge-verisi", title: "Cari denge verisi açıklandı", summary: "Dış ticaret ve turizm gelirleri cari görünüme yön verdi.", category: "Ekonomi", source: "VeriAkış Ekonomi", date: "2026-08-29" },
  { slug: "yabanci-takas-orani", title: "Yabancı yatırımcı takas oranında hareket", summary: "BIST'te yabancı payındaki değişim yatırımcı ilgisini yansıttı.", category: "BIST", source: "Borsa Gündem", date: "2026-08-29" },
];

const categorySummaries: Record<NewsCategory, string> = {
  Ekonomi: "makroekonomik görünüm",
  BIST: "borsa performansı",
  Döviz: "kur hareketleri",
  Emtia: "emtia fiyatları",
};

/** Bir hisse için deterministik 3-5 güncel haber üretir. */
export function newsForTicker(ticker: string, name: string): NewsItem[] {
  const direct = newsData.filter((n) => n.relatedTickers?.includes(ticker));
  const seed = ticker.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const count = 3 + (seed % 3); // 3-5
  const templates: Array<{ title: string; summary: string; category: NewsCategory }> = [
    { title: `${name} hisselerinde işlem hacmi arttı`, summary: `${ticker} tarafında artan işlem hacmi yatırımcı ilgisini gösterdi.`, category: "BIST" },
    { title: `${name} için analist görünümü güncellendi`, summary: `Aracı kurumlar ${ticker} için hedef fiyat ve tavsiyelerini gözden geçirdi.`, category: "BIST" },
    { title: `${name} temettü takviminde öne çıktı`, summary: `${ticker} temettü politikası yatırımcıların gündeminde.`, category: "Ekonomi" },
    { title: `${name} sektöründeki gelişmeler fiyatı etkiliyor`, summary: `${categorySummaries.BIST} kapsamında ${ticker} için yeni gelişmeler izleniyor.`, category: "BIST" },
    { title: `${name} kur ve emtia hareketlerinden etkilendi`, summary: `Küresel piyasalardaki dalgalanma ${ticker} fiyatlamasına yansıdı.`, category: "Döviz" },
  ];

  const generated: NewsItem[] = Array.from({ length: count }, (_, i) => {
    const t = templates[(seed + i) % templates.length];
    const day = 12 - ((seed + i * 3) % 12);
    return {
      slug: `${ticker.toLowerCase()}-haber-${i + 1}`,
      title: t.title,
      summary: t.summary,
      category: t.category,
      source: "VeriAkış Derleme",
      date: `2026-09-${String(day).padStart(2, "0")}`,
      relatedTickers: [ticker],
    };
  });

  const merged = [...direct, ...generated];
  const unique = merged.filter((n, i) => merged.findIndex((m) => m.title === n.title) === i);
  return unique.slice(0, Math.max(3, Math.min(5, unique.length)));
}
