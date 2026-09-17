import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Yasal Uyarı | VeriAkış", description: "VeriAkış finansal içerik ve veri kullanım uyarısı." };

export default function LegalNoticePage() {
  return (
    <LegalPage title="Yasal Uyarı" description="Piyasa verileri, hesaplama araçları ve finansal içeriklerin kullanım sınırlarını açıklar.">
      <p>VeriAkış içerikleri yalnızca genel bilgilendirme ve eğitim amacı taşır. Hiçbir içerik kişiye özel yatırım danışmanlığı veya yatırım tavsiyesi değildir.</p>
      <p>Geçmiş performans gelecekteki sonucu garanti etmez. Sermaye piyasası araçları risk içerir ve yatırılan paranın tamamı veya bir kısmı kaybedilebilir.</p>
      <p>Canlı fiyatlar, haber başlıkları, simülasyonlar, skorlar ve hesaplamalar kaynaklara, gecikmelere ve yaklaşık modellere bağlı olarak farklılık gösterebilir. Resmi kararlar için KAP, Borsa İstanbul, SPK ve yetkili kurumların güncel açıklamalarını kullanın.</p>
      <p>Bu site SPK tarafından yetkilendirilmiş yatırım danışmanlığı veya portföy yönetimi hizmeti sunmaz.</p>
    </LegalPage>
  );
}
