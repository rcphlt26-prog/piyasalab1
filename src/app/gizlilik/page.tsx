import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Gizlilik Politikası", description: "VeriAkış gizlilik politikası ve veri işleme bilgilendirmesi." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Gizlilik Politikası" description="VeriAkış, hangi verilerin neden işlendiğini, hangi hizmet sağlayıcıların kullanıldığını ve kullanıcıların tercihlerini nasıl yönetebileceğini açıklar.">
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">1. Kapsam ve sorumlu iletişim</h2>
        <p>Bu politika veri akis.com alan adı ve VeriAkış markasıyla sunulan web uygulaması için geçerlidir. Gizlilik, veri erişimi veya kaldırma talepleriniz için <a className="text-primary underline" href="mailto:rcphlt26@gmail.com">rcphlt26@gmail.com</a> adresinden iletişime geçebilirsiniz.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">2. Hangi veriler işlenir?</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="app-text">Teknik veriler:</strong> tarayıcı, cihaz, IP adresi, güvenlik günlükleri ve sayfa etkileşimleri; hizmetin güvenli ve çalışır tutulması için.</li>
          <li><strong className="app-text">Forum verileri:</strong> kullanıcının seçtiği takma ad, yorum, tepki, oy ve seçilen hisse başlığı. Hassas kişisel bilgi paylaşmayın.</li>
          <li><strong className="app-text">Yerel tercihler:</strong> tema, uyarı görünürlüğü ve izleme listesi gibi tercihler tarayıcının localStorage alanında tutulabilir.</li>
          <li><strong className="app-text">Hesaplama girdileri:</strong> hesaplayıcı verileri mümkün olduğunca tarayıcı içinde işlenir; kişisel finansal profil oluşturulmaz.</li>
        </ul>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">3. Kullanım amaçları ve hukuki dayanak</h2>
        <p>Veriler; hizmeti sunmak, forumu ve Realtime bağlantılarını çalıştırmak, kötüye kullanımı önlemek, performansı ölçmek, yasal yükümlülükleri yerine getirmek ve açık rıza gereken durumlarda reklam tercihlerini yönetmek amacıyla kullanılır. Reklam ve isteğe bağlı ölçüm teknolojileri, gerekli izin mekanizmaları işletilmeden etkinleştirilmemelidir.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">4. Üçüncü taraf hizmetler</h2>
        <p>Forum ve anonim izleme listesi özelliklerinde Supabase; piyasa verilerinde veri sağlayıcı servisleri; reklam etkinleştirildiğinde Google AdSense kullanılabilir. Bu sağlayıcılar kendi gizlilik politikalarına ve teknik çerezlerine sahip olabilir. VeriAkış, sağlayıcıların hizmet sürekliliğini veya veri doğruluğunu garanti etmez.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">5. Çerezler ve reklam tercihleri</h2>
        <p>Gerekli yerel depolama teknolojileri temel tercihleri hatırlamak için kullanılır. Google AdSense etkinleştirildiğinde kişiselleştirilmiş reklamlar için çerez veya benzeri teknolojiler kullanılabilir. Reklam tercihlerinizi Google reklam ayarları ve tarayıcı ayarlarınızdan yönetebilirsiniz. Ayrıntılar için <a className="text-primary underline" href="/cerezler">Çerez Politikası</a> sayfasına bakın.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">6. Saklama, güvenlik ve kullanıcı hakları</h2>
        <p>Veriler, amaç için gerekli süre kadar veya yasal saklama yükümlülükleri devam ettiği sürece tutulur. Yetkisiz erişimi önlemek için makul teknik ve idari önlemler alınır; internet üzerindeki hiçbir aktarımın tamamen risksiz olduğu garanti edilemez. Erişim, düzeltme, silme, itiraz ve bilgi talebi için e-posta yoluyla başvurabilirsiniz.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">7. Politika değişiklikleri</h2>
        <p>Hizmet veya mevzuat değişikliklerinde bu politika güncellenebilir. Güncel metin her zaman bu sayfada yayınlanır ve üst bölümdeki güncelleme tarihi yenilenir.</p>
      </section>
    </LegalPage>
  );
}
