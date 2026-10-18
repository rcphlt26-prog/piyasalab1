import type { Metadata } from "next";
import { Mail, MessageSquare, ShieldCheck, Clock3 } from "lucide-react";
import { LegalPage } from "@/components/LegalPage";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "İletişim",
  description: "VeriAkış iletişim, gizlilik, telif ve içerik kaldırma başvuruları.",
};

export default function ContactPage() {
  return (
    <LegalPage title="İletişim" description="Gizlilik, telif, içerik kaldırma, reklam ve genel sorularınız için VeriAkış ekibine ulaşın.">
      <div className="grid gap-3 sm:grid-cols-2">
        <a href="mailto:rcphlt26@gmail.com" className="app-surface-2 app-border rounded-xl border p-4 transition hover:border-[var(--color-primary)]">
          <Mail className="mb-3 h-5 w-5 text-primary" />
          <h2 className="app-text font-semibold">Genel iletişim</h2>
          <p className="app-muted mt-1 text-sm">rcphlt26@gmail.com</p>
        </a>
        <a href="mailto:rcphlt26@gmail.com?subject=İçerik%20ve%20telif%20bildirimi" className="app-surface-2 app-border rounded-xl border p-4 transition hover:border-[var(--color-primary)]">
          <MessageSquare className="mb-3 h-5 w-5 text-primary" />
          <h2 className="app-text font-semibold">İçerik veya telif bildirimi</h2>
          <p className="app-muted mt-1 text-sm">İçerik kaldırma taleplerinizi güvenli şekilde iletin.</p>
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="app-surface-2 app-border flex gap-3 rounded-xl border p-4">
          <Clock3 className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <p>
            Talepler ortalama <strong>2 iş günü</strong> içinde yanıtlanır. Yoğun dönemlerde süre uzayabilir; önceliklendirme KVKK, güvenlik ve
            içerik ihlali başvurularına göre yapılır.
          </p>
        </div>
        <div className="app-surface-2 app-border flex gap-3 rounded-xl border p-4">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <p>
            Form üzerinden ilettiğiniz ad, e-posta ve mesaj içeriği yalnızca talebinizi değerlendirmek, size geri dönüş yapmak ve yasal
            yükümlülükleri yerine getirmek amacıyla işlenir. Ayrıntılar için Gizlilik Politikası ve Çerez Politikası sayfalarını inceleyin.
          </p>
        </div>
      </div>

      <section aria-labelledby="contact-form-title">
        <h2 id="contact-form-title" className="app-text mb-3 text-xl font-semibold">Mesaj gönderin</h2>
        <ContactForm />
        <p className="app-muted mt-2 text-xs">
          Supabase yapılandırması uygunsa mesajınız güvenli biçimde kaydedilir. Altyapı geçici olarak erişilemezse otomatik olarak e-posta taslağına
          yönlendirilirsiniz; hiçbir durumda iletişim yolunuz kapanmaz.
        </p>
      </section>
    </LegalPage>
  );
}
