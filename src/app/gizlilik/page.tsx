import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Gizlilik Politikası | VeriAkış", description: "VeriAkış gizlilik politikası ve veri işleme bilgilendirmesi." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Gizlilik Politikası">
      <p>Bu sayfa, VeriAkış web sitesinin hangi verileri ve hangi amaçlarla işlediğini açıklar.</p>
      <h2 className="app-text text-lg font-semibold">Toplanan bilgiler</h2>
      <p>Site, hesaplama girdilerini sunucuya göndermeden tarayıcıda işleyebilir. Forum ve izleme listesi özelliklerinde anonim istemci kimliği, kullanıcı tarafından girilen takma ad, yorum ve tercih bilgileri Supabase altyapısında saklanabilir.</p>
      <h2 className="app-text text-lg font-semibold">Üçüncü taraf hizmetler</h2>
      <p>Canlı piyasa verileri veri sağlayıcı servislerinden alınır. Reklamlar etkinleştirildiğinde Google AdSense çerezleri ve benzeri teknolojiler kullanılabilir. Bu hizmetlerin kendi gizlilik politikaları ayrıca geçerlidir.</p>
      <h2 className="app-text text-lg font-semibold">Haklar ve iletişim</h2>
      <p>Veri talepleri, düzeltme veya kaldırma istekleri için <a className="text-primary underline" href="mailto:rcphlt26@gmail.com">rcphlt26@gmail.com</a> adresine yazabilirsiniz.</p>
    </LegalPage>
  );
}
