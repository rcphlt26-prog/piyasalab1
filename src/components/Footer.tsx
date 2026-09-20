"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="app-border mt-10 border-t">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Image src="/gemini-svg.svg" alt="VeriAkış Gemini sembolü" width={32} height={32} className="rounded-lg" />
              <span className="brand-gradient text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                VeriAkış
              </span>
            </div>
            <p className="app-text-secondary max-w-xl text-sm leading-relaxed">
              Veri Akış (veriakis.com) kullanıcılarına anlık finansal analizler sunar. VeriAkış; borsa, döviz, altın ve enflasyon verileriyle çalışan interaktif hesaplayıcılar, hisse karnesi,
              yatırımcı forumu ve finansal oyunlar sunan bir bilgilendirme ve eğitim platformudur. Tüm hesaplamalar
              tarayıcınızda çalışır.
            </p>
            <a
              href="mailto:rcphlt26@gmail.com"
              className="app-text-secondary mt-3 inline-flex items-center gap-2 text-sm hover:text-primary"
            >
              <Mail className="h-4 w-4" /> rcphlt26@gmail.com
            </a>
          </div>

          <div className="app-surface-2 app-border rounded-xl border p-4">
            <h3 className="app-text mb-2 text-sm font-semibold">Yasal Uyarı (SPK)</h3>
            <div className="app-muted space-y-2 text-xs leading-relaxed">
              <p>
                Burada yer alan bilgiler, yorumlar, hesaplama araçları ve tahminler yatırım danışmanlığı kapsamında
                değildir. Yatırım danışmanlığı hizmeti; yetkili aracı kurumlar, portföy yönetim şirketleri ve mevduat
                kabul etmeyen bankalar tarafından, kişilerin risk ve getiri tercihleri dikkate alınarak, yalnızca kişiye
                özel olarak sunulmaktadır.
              </p>
              <p>
                Bu platformdaki içerikler genel niteliktedir ve kişisel mali durumunuz ile risk tercihlerinize uygun
                olmayabilir. Yalnızca bu bilgilere dayanılarak alınan yatırım kararları beklentilerinize uygun sonuçlar
                doğurmayabilir.
              </p>
              <p>
                Geçmiş dönem getirileri ve tarihsel veriler gelecekteki performans için garanti oluşturmaz. Sermaye
                piyasası araçlarına yapılan yatırımlar risk içerir; ana paranın tamamı veya bir kısmı kaybedilebilir.
                Yatırım kararlarınızı vermeden önce yetkili bir yatırım danışmanına başvurmanız önerilir.
              </p>
            </div>
          </div>
        </div>

        <div className="app-border mt-6 flex flex-col items-center justify-between gap-2 border-t pt-4 text-xs sm:flex-row">
          <p className="app-muted">© 2024-{new Date().getFullYear()} VeriAkış. Tüm hakları saklıdır.</p>
          <nav className="flex flex-wrap justify-center gap-3">
            <Link href="/gizlilik" className="app-muted hover:text-primary">Gizlilik</Link>
            <Link href="/cerezler" className="app-muted hover:text-primary">Çerezler</Link>
            <Link href="/kullanim-sartlari" className="app-muted hover:text-primary">Kullanım şartları</Link>
            <Link href="/yasal-uyari" className="app-muted hover:text-primary">Yasal uyarı</Link>
            <Link href="/iletisim" className="app-muted hover:text-primary">İletişim</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
