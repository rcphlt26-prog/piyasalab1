import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Sorumluluk Reddi ve Yatırım Uyarısı | VeriAkış",
  description: "VeriAkış içerik, piyasa verisi ve hesaplama sonuçlarının yatırım tavsiyesi olmadığını açıklayan sorumluluk reddi.",
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Sorumluluk Reddi" description="Finansal içerik ve araçların sınırları, yatırım riski ve kullanıcıların karar sorumluluğu hakkında önemli bilgilendirme.">
      <section><h2 className="app-text mb-2 text-xl font-semibold">Yatırım tavsiyesi değildir (YTD)</h2><p>VeriAkış&apos;ta yayımlanan hiçbir metin, yorum, grafik, piyasa verisi, gösterge, puan, simülasyon veya hesaplama sonucu yatırım danışmanlığı ya da yatırım tavsiyesi niteliğinde değildir. İçerikler genel bilgilendirme ve finansal okuryazarlık amacı taşır; belirli bir kişinin mali durumu, risk-getiri tercihi veya yatırım hedefi dikkate alınarak hazırlanmaz.</p><p>6362 sayılı Sermaye Piyasası Kanunu ve ilgili düzenlemeler kapsamında yatırım danışmanlığı, yetkili kuruluşlarca ve kişiye özel olarak sunulan ayrı bir hizmettir. VeriAkış SPK tarafından yetkilendirilmiş yatırım danışmanlığı veya portföy yönetimi hizmeti sunmaz. Herhangi bir varlığı alma, satma veya elde tutma kararını yalnızca site içeriğine dayanarak vermeyin.</p></section>
      <section><h2 className="app-text mb-2 text-xl font-semibold">Risk ve geçmiş performans</h2><p>Sermaye piyasası araçlarının değeri yükselebilir veya düşebilir; yatırılan anaparanın bir kısmı ya da tamamı kaybedilebilir. Geçmiş performans gelecekteki sonuçların göstergesi veya garantisi değildir. Kur, faiz, enflasyon, likidite, şirket ve piyasa koşulları değişebilir. Yatırım kararınızdan önce resmi kaynakları inceleyin ve gerektiğinde yetkili bir uzmandan kişisel danışmanlık alın.</p></section>
      <section><h2 className="app-text mb-2 text-xl font-semibold">Veri ve hesaplama sınırlamaları</h2><p>Canlı veya gecikmeli fiyatlar, finansal oranlar, haberler ve tarihsel veriler üçüncü taraf kaynaklardan sağlanabilir; eksik, gecikmeli, yaklaşık veya hatalı olabilir. Araçların sonuçları girilen bilgilere, seçilen döneme ve kullanılan varsayımlara bağlıdır; vergi, komisyon, temettü uygulaması ve işlem maliyetleri sonucu değiştirebilir. VeriAkış, içeriklerin doğruluğu, tamlığı, güncelliği veya belirli bir amaca uygunluğu konusunda açık ya da zımni garanti vermez.</p></section>
      <section><h2 className="app-text mb-2 text-xl font-semibold">İletişim</h2><p>Bu bildirimle ilgili sorularınızı <a className="text-primary underline" href="mailto:rcphlt26@gmail.com">rcphlt26@gmail.com</a> adresine iletebilirsiniz. Bu sayfa hukuki görüş yerine geçmez.</p></section>
    </LegalPage>
  );
}