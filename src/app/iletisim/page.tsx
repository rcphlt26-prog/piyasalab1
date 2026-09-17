import type { Metadata } from "next";
import { Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "İletişim | VeriAkış",
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
          <p className="app-muted mt-1 text-sm">İçerik kaldırma taleplerinizi gönderin.</p>
        </a>
      </div>
      <div className="app-surface-2 app-border flex gap-3 rounded-xl border p-4">
        <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-primary" />
        <p>Başvurunuzda ilgili sayfanın bağlantısını, talebinizin nedenini ve size ulaşabileceğimiz bilgiyi paylaşın. Hassas kişisel veya finansal bilgileri e-posta ile göndermeyin.</p>
      </div>
    </LegalPage>
  );
}