import type { Metadata } from "next";
import { Calculator, Database, ShieldCheck, Activity } from "lucide-react";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Hakkımızda & Veri Metodolojisi",
  description: "VeriAkış misyonu, hesaplama metodolojisi, veri kaynakları ve SPK/KVKK uyum ilkeleri.",
  alternates: { canonical: "https://veriakis.com/hakkimizda-veri-metodolojisi" },
};

export default function AboutMethodologyPage() {
  return (
    <LegalPage
      title="Hakkımızda & Veri Metodolojisi"
      description="VeriAkış'ın finansal okuryazarlık yaklaşımını, hesaplama formüllerini ve veri kaynaklarını şeffaflık ilkesiyle paylaşıyoruz."
      updatedAt="18 Ekim 2026"
    >
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-primary">
          <Activity className="h-3.5 w-3.5" />
          Misyon ve vizyon
        </div>
        <p>
          VeriAkış, Türkiye’de finansal okuryazarlığı güçlendirmeyi amaçlayan bir bilgilendirme platformudur. Misyonumuz; yatırımcıların
          piyasa verisini daha doğru okumasını, temel hesaplama yöntemlerini anlamasını ve risklerini daha bilinçli yönetmesini desteklemektir.
          Vizyonumuz ise karmaşık finansal kavramları teknik jargondan arındırıp erişilebilir hale getirerek, her seviyeden kullanıcının
          veri odaklı karar alma kültürünü geliştirmesine katkı sağlamaktır. Platformda yer alan araçlar bu nedenle “hızlı sinyal” üretmekten
          çok “doğru çerçeve” kurmayı hedefler.
        </p>
        <p>
          VeriAkış’ta yayınlanan rehber içerikler, modellemeler ve hesaplamalar eğitim amaçlıdır. Kullanıcıya tek bir doğru yatırım kararı
          dayatmak yerine, farklı senaryoları karşılaştırma ve varsayımları test etme imkânı sunar. Böylece kısa vadeli fiyat hareketlerine
          verilen duygusal tepkiler yerine, planlı ve ölçülebilir bir karar süreci teşvik edilir.
        </p>
      </section>

      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-primary">
          <Calculator className="h-3.5 w-3.5" />
          Hesaplama metodolojisi ve formüller
        </div>
        <p>
          Hesaplama araçlarımız, finans literatüründe yaygın kullanılan temel formüllere dayanır. Aşağıdaki formüller sadeleştirilmiş gösterimdir
          ve eğitim amaçlı referans niteliğindedir:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Bileşik Getiri:</strong> Gelecek Değer = Başlangıç Tutarı × (1 + r)^n</li>
          <li><strong>Reel Getiri:</strong> Reel = ((1 + Nominal Getiri) / (1 + Enflasyon)) - 1</li>
          <li><strong>Maliyet Ortalaması:</strong> Ortalama Maliyet = Toplam Alış Tutarı / Toplam Lot</li>
          <li><strong>Temettü Verimi:</strong> Verim (%) = (Hisse Başı Temettü / Hisse Fiyatı) × 100</li>
          <li><strong>F/K Oranı:</strong> F/K = Piyasa Değeri / Net Kâr (veya Fiyat / Hisse Başı Kâr)</li>
          <li><strong>PD/DD Oranı:</strong> PD/DD = Piyasa Değeri / Özsermaye</li>
        </ul>
        <p>
          Araç çıktıları oluşturulurken veri bütünlüğü, dönem uyumu ve birim dönüşümleri gözetilir. Buna rağmen hesaplamalar geçmiş veriye
          dayanır ve gelecekteki fiyat hareketini garanti etmez. Sonuçlar, kullanıcı tarafından yapılan tarih, tutar, varlık ve varsayım seçimine
          bağlı olarak değişir.
        </p>
      </section>

      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-primary">
          <Database className="h-3.5 w-3.5" />
          Veri kaynakları ve güncelleme sıklığı
        </div>
        <p>
          VeriAkış, farklı veri katmanlarını bir arada kullanır. Piyasa fiyat akışlarında Yahoo Finance tabanlı kaynaklar, şirket duyurularında
          KAP bildirimleri ve uygulama içi bazı yapılandırılmış içeriklerde Supabase veri katmanı kullanılmaktadır. Kaynağa bağlı olarak güncelleme
          aralığı dakika bazında, saatlik veya dönemsel olabilir. Bu nedenle ekranlarda canlı, gecikmeli veya son kapanış bilgisi uygun rozetlerle
          belirtilir.
        </p>
        <p>
          KAP ve finansal tablo verileri şirketlerin resmi açıklama takvimine bağlıdır. Yani tüm şirketler aynı gün veya aynı yoğunlukta veri
          üretmez. Bu farklılık, özellikle karşılaştırmalı analizlerde dönem uyumu kontrolünü gerekli kılar. VeriAkış, kullanıcıya bu farkı
          görünür kılmak için kaynak etiketi ve tarih bilgisi sunar.
        </p>
      </section>

      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          SPK uyumu, sorumluluk reddi ve KVKK
        </div>
        <p>
          VeriAkış’taki tüm içerikler bilgilendirme amaçlıdır; yatırım tavsiyesi değildir. Platform, Sermaye Piyasası Kurulu mevzuatındaki
          yatırım danışmanlığı tanımına uygun şekilde kişiye özel portföy önerisi sunmaz. Buradaki analizler, karar destek amacı taşır; nihai
          yatırım kararı kullanıcının kendi risk profili, vade planı ve finansal durumu doğrultusunda verilmelidir.
        </p>
        <p>
          Kişisel verilerin korunması tarafında veri minimizasyonu ilkesi uygulanır. Kullanıcı deneyimini sağlamak için gerekli olan veriler
          sınırlı kapsamda işlenir, amacı dışında kullanılmaz ve erişim kontrolleriyle korunur. Ayrıntılar için
          <a href="/gizlilik-politikasi" className="text-primary underline"> Gizlilik Politikası</a> ve
          <a href="/cerezler" className="text-primary underline"> Çerez Politikası</a> sayfalarına başvurabilirsiniz.
          Uygulamadaki yasal metinler ve süreçler düzenli olarak güncellenir.
        </p>
        <p>
          Özetle VeriAkış, şeffaf metodoloji, açık kaynak etiketi ve kullanıcı odaklı finansal eğitim yaklaşımıyla hareket eder.
          Piyasalarda belirsizlik her zaman vardır; bu nedenle en güçlü koruma, doğru bilgiye dayalı disiplinli karar sürecidir.
        </p>
      </section>
    </LegalPage>
  );
}
