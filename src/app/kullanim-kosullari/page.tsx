import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | VeriAkış",
  description: "VeriAkış platformunun kullanım kuralları, içerik ve fikri mülkiyet şartları ile finansal veri sınırlamaları.",
};

export default function TermsOfUsePage() {
  return (
    <LegalPage title="Kullanım Koşulları" description="VeriAkış araçlarını, piyasa içeriklerini ve topluluk özelliklerini kullanırken geçerli olan temel koşullar.">
      <section><h2 className="app-text mb-2 text-xl font-semibold">Hizmetin kapsamı</h2><p>VeriAkış; piyasa verisi ekranları, geçmiş performans simülasyonları, hesaplama araçları, eğitim içerikleri ve topluluk özellikleri sunar. Hizmet zaman içinde değişebilir, yeni özellikler eklenebilir veya bakım ve güvenlik gerekçeleriyle geçici olarak kullanılamayabilir. Siteyi kullanırken yürürlükteki mevzuata ve bu koşullara uymanız beklenir.</p></section>
      <section><h2 className="app-text mb-2 text-xl font-semibold">Veri doğruluğu ve hizmet sınırları</h2><p>Fiyatlar, döviz kurları, haber başlıkları, tarihsel seriler ve şirket göstergeleri üçüncü taraf kaynaklardan veya eğitim amaçlı modellerden gelebilir. Veriler gecikmeli, eksik veya hatalı olabilir. VeriAkış, tüm verilerin kesintisiz, güncel veya hatasız olduğunu garanti etmez. Önemli kararlar öncesinde KAP, Borsa İstanbul, SPK ve ilgili şirketlerin resmi duyurularını kontrol edin.</p><p>Hesaplama sonuçları, kullanıcının girdileri ile seçilen varsayımlara göre üretilir. Vergi, komisyon, enflasyon yöntemi, temettü tarihi ve işlem koşulları sonucu değiştirebilir; sonuçlar kişisel mali durumunuzu temsil etmeyebilir.</p></section>
      <section><h2 className="app-text mb-2 text-xl font-semibold">Kullanıcı davranışı ve hesap güvenliği</h2><ul className="list-disc space-y-2 pl-5"><li>Hesap bilgilerinizi koruyun ve hesabınız üzerinden yapılan işlemlerden sorumlu olduğunuzu unutmayın.</li><li>Hizmeti hukuka aykırı, yanıltıcı, manipülatif, spam veya başkalarının haklarını ihlal eden içerik paylaşmak için kullanmayın.</li><li>Forumda kişisel veri, gizli bilgi, doğrulanmamış suçlama veya kesin getiri vaadi paylaşmayın.</li><li>Site altyapısına zarar verebilecek otomatik istek, güvenlik atlatma veya izinsiz veri toplama girişimlerinde bulunmayın.</li></ul></section>
      <section><h2 className="app-text mb-2 text-xl font-semibold">Fikri mülkiyet</h2><p>VeriAkış markası, arayüzü, yazılımı, özgün metinleri ve grafik düzenlemeleri ilgili fikri mülkiyet mevzuatıyla korunur. Önceden yazılı izin alınmaksızın içerikler toplu olarak kopyalanamaz, yeniden yayımlanamaz veya ticari amaçla dağıtılamaz. Üçüncü taraf veri, marka ve bağlantılar kendi hak sahiplerine aittir. İhlal bildirimleri için iletişim sayfasını kullanabilirsiniz.</p></section>
      <section><h2 className="app-text mb-2 text-xl font-semibold">Dış hizmetler ve reklamlar</h2><p>Platform, kimlik doğrulama, veri, analiz veya reklam için üçüncü taraf servislerine ve dış bağlantılara yer verebilir. Bu hizmetlerin erişilebilirliği, içerikleri, ürünleri veya gizlilik uygulamaları ilgili sağlayıcıların sorumluluğundadır. Reklam gösterimi, reklam verenin ürün veya iddiasının VeriAkış tarafından tavsiye edildiği anlamına gelmez.</p></section>
      <section><h2 className="app-text mb-2 text-xl font-semibold">Koşulların güncellenmesi ve iletişim</h2><p>Koşullar hizmet veya mevzuat değiştikçe güncellenebilir; güncel sürüm bu sayfada yayımlandığı tarihten itibaren geçerlidir. Sorularınızı <a className="text-primary underline" href="mailto:rcphlt26@gmail.com">rcphlt26@gmail.com</a> adresine iletebilirsiniz.</p></section>
    </LegalPage>
  );
}