import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Çerez Politikası | VeriAkış", description: "VeriAkış çerez ve benzeri teknolojiler hakkında bilgilendirme." };

export default function CookiesPage() {
  return (
    <LegalPage title="Çerez Politikası" description="VeriAkış’ın gerekli yerel depolama, reklam ve benzeri teknolojileri nasıl kullandığını açıklar.">
      <p>VeriAkış, tema tercihi, uyarı görünürlüğü ve anonim kullanıcı tercihlerini hatırlamak için gerekli yerel depolama teknolojilerini kullanabilir.</p>
      <h2 className="app-text text-lg font-semibold">Reklam çerezleri</h2>
      <p>Google AdSense etkinleştirildiğinde Google ve iş ortakları kişiselleştirilmiş veya kişiselleştirilmemiş reklamlar için çerez kullanabilir. Kullanıcılar Google reklam ayarlarından tercihlerini yönetebilir.</p>
      <h2 className="app-text text-lg font-semibold">Tercihleri yönetme</h2>
      <p>Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Bazı özellikler bu durumda beklenen şekilde çalışmayabilir.</p>
    </LegalPage>
  );
}
