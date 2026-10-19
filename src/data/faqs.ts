export type FaqItem = {
  question: string;
  answer: string;
};

export const siteFaqItems: FaqItem[] = [
  {
    question: '"Param Ne Olurdu?" aracı nasıl çalışır?',
    answer: "Araç, seçtiğiniz başlangıç tarihindeki kapanış fiyatını ve son kapanış fiyatını karşılaştırır. Girdiğiniz tutarı bu oranla güncelleyerek bugünkü karşılığı hesaplar. Hesaplama; komisyon, vergi, temettü ve enflasyonu varsayılan olarak dahil etmez.",
  },
  {
    question: "Veriler hangi kaynaklardan geliyor ve ne kadar güncel?",
    answer: "Piyasa verileri Yahoo Finance tabanlı akıştan, şirket duyuruları KAP bildirimlerinden, uygulama içi bazı veri katmanları ise Supabase tablolarından gelir. Kaynaklara göre güncelleme sıklığı değişir; ekranlarda canlı, gecikmeli veya son kapanış bilgisi açıkça belirtilir.",
  },
  {
    question: "Bu site yatırım tavsiyesi veriyor mu?",
    answer: "Hayır. VeriAkış yalnızca finansal okuryazarlık ve bilgilendirme amacıyla içerik sunar. Buradaki araçlar ve yorumlar kişiye özel yatırım danışmanlığı kapsamında değildir.",
  },
  {
    question: "Temettü verimi ne demek ve nasıl hesaplanır?",
    answer: "Temettü verimi, hisse başına ödenen yıllık brüt temettünün hisse fiyatına oranıdır. Basit formül: Temettü Verimi (%) = (Hisse Başına Temettü / Hisse Fiyatı) × 100. Tek başına karar kriteri değildir; şirketin kârlılığı, nakit üretimi ve borçluluğu ile birlikte yorumlanmalıdır.",
  },
  {
    question: "Hesaplama araçları ücretsiz mi, üyelik gerekli mi?",
    answer: "Ana hesaplama araçları ücretsizdir ve üyelik olmadan kullanılabilir. Üyelik açıldığında portföy, izleme listesi ve kişiselleştirme gibi ek özellikler kullanılabilir.",
  },
  {
    question: "Kişisel verilerim nasıl korunuyor (KVKK)?",
    answer: "VeriAkış, KVKK ilkelerine uygun veri minimizasyonu yaklaşımı uygular. Sadece hizmeti sunmak için gerekli veriler işlenir, saklama süresi ve kullanım amacı şeffaf şekilde belirtilir. Ayrıntılar için Gizlilik Politikası ve KVKK aydınlatma metni referans alınmalıdır.",
  },
];
