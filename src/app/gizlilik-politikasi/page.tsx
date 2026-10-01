import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Gizlilik Politikası ve Çerezler | VeriAkış",
  description: "VeriAkış'ın kişisel veri, çerez, Google AdSense reklamları ve KVKK kapsamındaki kullanıcı hakları politikası.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Gizlilik Politikası" description="Hangi verilerin hangi amaçlarla işlendiğini, reklam ve ölçüm teknolojilerini ve kullanıcıların KVKK kapsamındaki başvuru yollarını açıklar.">
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">Veri sorumlusu ve kapsam</h2>
        <p>Bu metin, veriakis.com alan adı üzerinden sunulan VeriAkış web hizmeti için hazırlanmıştır. Gizlilik talepleri ve kişisel verilerle ilgili başvurular <a className="text-primary underline" href="mailto:rcphlt26@gmail.com">rcphlt26@gmail.com</a> adresine iletilebilir. Bu bilgilendirme genel niteliktedir; hizmetin kullanılan özelliklerine ve yürürlükteki mevzuata göre güncellenebilir.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">İşlenebilecek bilgiler</h2>
        <p>Hesap oluşturulduğunda e-posta adresi, seçilen kullanıcı adı ve hesap tercihleri; forum özellikleri kullanıldığında kullanıcının yayımlamayı seçtiği yorum, tepki ve oy bilgileri işlenebilir. Güvenlik ve hizmet sürekliliği için IP adresi, cihaz ve tarayıcı bilgileri, erişim zamanı ve hata kayıtları teknik sistemlerce işlenebilir. Hesaplama araçlarına girilen tutar ve dönem bilgileri temel olarak tarayıcıda değerlendirilir; bu girdiler kişiye özel yatırım profili oluşturmak amacıyla kullanılmaz.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">Çerezler ve Google AdSense</h2>
        <p>Site, oturum ve güvenlik işlevleri için gerekli çerezler veya yerel depolama kullanabilir. Google AdSense etkinleştirildiğinde Google ve reklam iş ortakları, reklam sunmak, sıklığı sınırlamak, performansı ölçmek ve uygun olduğu durumlarda kişiselleştirme yapmak için çerezler veya benzeri teknolojiler kullanabilir. Bu teknolojiler ziyaret edilen sayfalar, tarayıcı tanımlayıcıları ve reklam etkileşimi gibi verileri işleyebilir; kullanılan tanımlayıcılar bölgeye, rıza tercihlerine ve Google yapılandırmasına göre değişebilir.</p>
        <p>Google reklam ürünleri geçmişte DART çerezi adıyla anılan reklam teknolojilerini kullanmıştır. DART veya benzeri üçüncü taraf reklam çerezlerinin bu sitedeki kullanılabilirliği Google&apos;ın güncel ürünleri, bölgesel kuralları ve kullanıcı tercihleri tarafından belirlenir; VeriAkış belirli bir Google çerezinin her ziyaretçide çalışacağını garanti etmez. Kişiselleştirilmiş reklam tercihleri Google&apos;ın reklam ayarlarından, çerez tercihleri ise tarayıcı ayarlarından yönetilebilir. Üçüncü taraf sağlayıcıların kendi gizlilik açıklamaları da geçerlidir.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">Amaçlar, saklama ve hizmet sağlayıcılar</h2>
        <p>Bilgiler hesabı ve topluluk özelliklerini işletmek, kullanıcı tercihlerini hatırlamak, kötüye kullanımı önlemek, hata ayıklamak, hizmet performansını anlamak, yasal yükümlülükleri yerine getirmek ve gerekli izinler kapsamında reklam sunmak için kullanılabilir. Kimlik doğrulama ve veritabanı işlevlerinde Supabase; trafik ve reklam hizmetlerinde ilgili sağlayıcılar; piyasa verilerinde harici veri sağlayıcıları kullanılabilir. Veriler amaç için gerekli süreyle ve varsa yasal saklama yükümlülükleri boyunca tutulur; sağlayıcıların kendi politikaları ayrıca uygulanabilir.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">KVKK kapsamındaki haklar</h2>
        <p>6698 sayılı Kişisel Verilerin Korunması Kanunu çerçevesinde kullanıcılar, kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacını ve aktarım yapılan tarafları öğrenme, eksik veya yanlış verilerin düzeltilmesini isteme, şartları oluştuğunda silme veya yok etme talebinde bulunma ve kanuni koşullarda işleme itiraz etme haklarına sahiptir. Başvurularınızı kimliğinizi ve talebinizi açıklayarak <a className="text-primary underline" href="mailto:rcphlt26@gmail.com">rcphlt26@gmail.com</a> adresine gönderin. Başvuru, mevzuattaki süre ve usullere göre değerlendirilir.</p>
      </section>
      <section>
        <h2 className="app-text mb-2 text-xl font-semibold">Güvenlik ve değişiklikler</h2>
        <p>VeriAkış, yetkisiz erişim ve kayıp risklerini azaltmak için makul teknik ve idari tedbirler uygular; internet üzerinden hiçbir aktarım yöntemi mutlak güvenlik garantisi vermez. Politika değişiklikleri bu sayfada yayımlanır. Güncel metin için sayfayı dönemsel olarak inceleyebilirsiniz.</p>
      </section>
    </LegalPage>
  );
}