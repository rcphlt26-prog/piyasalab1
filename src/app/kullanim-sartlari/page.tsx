import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Kullanım Şartları | VeriAkış", description: "VeriAkış kullanım şartları." };

export default function TermsPage() {
  return (
    <LegalPage title="Kullanım Şartları" description="VeriAkış’ı kullanırken geçerli olan hizmet kapsamını, finansal uyarıları, kullanıcı sorumluluklarını ve içerik kurallarını açıklar.">
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">1. Hizmetin kapsamı</h2>
        <p>VeriAkış; piyasa verileri, hesaplama araçları, finansal okuryazarlık içerikleri, forum ve eğitim amaçlı simülasyonlar sunar. Siteyi kullanarak bu şartları ve <a className="text-primary underline" href="/gizlilik">Gizlilik Politikası</a>’nı okuduğunuzu kabul edersiniz.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">2. Finansal uyarı</h2>
        <p>Site içeriği yatırım danışmanlığı, portföy yönetimi, alım-satım tavsiyesi, halka arz yönlendirmesi veya getiri garantisi değildir. Canlı fiyatlar gecikmeli olabilir; skorlar, örnek kayıtlar, simülasyonlar ve hesaplama sonuçları yatırım kararının tek dayanağı olamaz. Sermaye piyasası araçları risk içerir ve ana paranın bir kısmı veya tamamı kaybedilebilir.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">3. Veri ve içerik kullanımı</h2>
        <p>Fiyat, haber bağlantısı, kur ve tarihsel seriler bilgilendirme amacıyla sunulur; doğruluk, güncellik veya kesintisiz erişim garantisi verilmez. Resmi bildirimler için KAP, Borsa İstanbul, SPK ve yetkili kurumların kendi yayınlarını esas alın.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">4. Forum ve kullanıcı içerikleri</h2>
        <p>Kullanıcılar yalnızca hukuka uygun, saygılı ve doğruluğunu bildikleri içerikleri paylaşmalıdır. Kişisel veri, gizli bilgi, içeriden öğrenenlerin ticareti iddiası, manipülatif yönlendirme, spam, hakaret, telif hakkı ihlali ve yanıltıcı getiri vaadi yasaktır. VeriAkış, bildirilen veya kurallara aykırı gördüğü içerikleri önceden bildirimde bulunmadan kaldırabilir.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">5. Fikri mülkiyet</h2>
        <p>VeriAkış’ın marka, arayüz, özgün metin, grafik ve yazılımı izin alınmadan kopyalanamaz veya ticari amaçla yeniden dağıtılamaz. Dış kaynaklara ait bağlantı, marka ve veriler ilgili sahiplerinin haklarına tabidir. Telif ihlali bildirimleri için iletişim adresini kullanabilirsiniz.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">6. Reklamlar ve dış bağlantılar</h2>
        <p>Site Google AdSense veya başka reklam hizmetleri kullanabilir. Reklam verenlerin ürün, hizmet veya iddiaları VeriAkış tarafından onaylandığı anlamına gelmez. Dış bağlantıların içeriği, güvenliği ve gizlilik uygulamalarından ilgili site sorumludur.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">7. Hizmetin sınırlandırılması ve değişiklikler</h2>
        <p>Teknik bakım, dış servis kesintisi, güvenlik veya hukuki gereklilikler nedeniyle özellikler geçici olarak durdurulabilir. Bu şartlar hizmet kapsamındaki değişikliklere göre güncellenebilir; güncel metin bu sayfada yayınlanır.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">8. İletişim</h2>
        <p>Şartlar, içerik kaldırma veya telif bildirimleri için <a className="text-primary underline" href="mailto:rcphlt26@gmail.com">rcphlt26@gmail.com</a> adresine ulaşabilirsiniz.</p>
      </section>
    </LegalPage>
  );
}
