import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Kullanım Şartları | VeriAkış", description: "VeriAkış kullanım şartları." };

export default function TermsPage() {
  return (
    <LegalPage title="Kullanım Şartları">
      <p>VeriAkış; piyasa verileri, hesaplama araçları ve finansal okuryazarlık içerikleri sunan bilgilendirme platformudur.</p>
      <h2 className="app-text text-lg font-semibold">Finansal uyarı</h2>
      <p>Site içeriği yatırım danışmanlığı, portföy yönetimi, alım-satım tavsiyesi veya getiri garantisi değildir. Veriler gecikmeli, yaklaşık veya eğitim amaçlı olabilir. Yatırım kararından önce yetkili ve lisanslı bir uzmana danışmanız gerekir.</p>
      <h2 className="app-text text-lg font-semibold">Kullanıcı içerikleri</h2>
      <p>Forum kullanıcıları hukuka aykırı, yanıltıcı, kişisel veri içeren veya manipülatif içerik paylaşamaz. VeriAkış, bildirilen içerikleri inceleyebilir ve kaldırabilir.</p>
      <h2 className="app-text text-lg font-semibold">Hizmetin sınırları</h2>
      <p>Canlı veri, forum, haber bağlantıları ve hesaplama sonuçları süreklilik veya doğruluk garantisi olmadan sunulur.</p>
    </LegalPage>
  );
}
