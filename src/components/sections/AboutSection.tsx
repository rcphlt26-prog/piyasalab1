"use client";

import { Code2, Database, LineChart } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function AboutSection() {
  return (
    <section className="section-card fade-in">
      <SectionTitle
        eyebrow="Hakkında"
        title="Piyasalab Nedir?"
        description="Borsa, enflasyon ve reel getiri odaklı, tamamen tarayıcıda çalışan interaktif bir finansal okuryazarlık platformu."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="app-surface-2 app-border rounded-2xl border p-4">
          <h3 className="app-text mb-2 text-lg font-semibold">Platform</h3>
          <p className="app-text-secondary text-sm leading-7">
            Piyasalab; getiri hesaplama, enflasyondan arındırılmış reel kazanç analizi, alım gücü simülatörü, hisse
            karnesi, halka arz tavan serisi, canlı piyasa akışı, topluluk forumu ve viral mini oyunları tek bir çatı
            altında toplar. Amaç, karmaşık finansal kavramları herkes için anlaşılır, görsel ve eğlenceli hale
            getirmektir. Tüm hesaplamalar cihazınızda çalışır; sunucu tarafında ağır işleme veya kişisel veri saklama
            yoktur.
          </p>
        </div>

        <div className="app-surface-2 app-border rounded-2xl border p-4">
          <h3 className="app-text mb-3 text-lg font-semibold">Teknoloji</h3>
          <ul className="space-y-2 text-sm">
            <li className="app-text-secondary flex items-center gap-2"><Code2 className="text-primary h-4 w-4" /> Next.js (App Router) & TypeScript</li>
            <li className="app-text-secondary flex items-center gap-2"><Database className="text-bull h-4 w-4" /> Supabase (gerçek zamanlı forum & anketler)</li>
            <li className="app-text-secondary flex items-center gap-2"><LineChart className="text-gold h-4 w-4" /> TradingView & Recharts görselleştirme</li>
          </ul>
        </div>
      </div>

      <div className="app-surface-2 app-border mt-4 rounded-2xl border p-4">
        <h3 className="app-text mb-2 text-lg font-semibold">İletişim</h3>
        <p className="app-text-secondary text-sm">
          Görüş, öneri ve iş birliği için bize ulaşabilirsiniz:{" "}
          <a href="mailto:rcphlt26@gmail.com" className="text-primary font-semibold underline">rcphlt26@gmail.com</a>
        </p>
      </div>

      <div id="seo-makale" className="app-surface-2 app-border mt-4 rounded-2xl border p-4">
        <h2 className="app-text mb-4 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Borsa İstanbul Getiri Hesaplama, Enflasyon ve Dolar Bazlı Reel Kazançlar
        </h2>
        <article className="app-text-secondary space-y-4 text-sm leading-7">
          <h3 className="app-text text-lg font-semibold">Neden sadece nominal getiriye bakmak yanıltıcıdır?</h3>
          <p>
            Borsada bir yatırımın değerinin artması tek başına yeterli bir başarı ölçütü değildir. Çünkü yatırımcı için asıl önemli olan, parasının satın alma gücünü gerçekten artırıp artırmadığıdır. Nominal getiri, yalnızca rakamsal artışı gösterir; fakat arka plandaki enflasyon dinamiği hesaba katılmadığında ortaya eksik bir tablo çıkar. Örneğin bir yatırımın beş yılda %300 yükselmesi kulağa etkileyici gelebilir. Ancak aynı dönemde fiyatlar genel düzeyi de çok güçlü artmışsa, reel kazanç sanıldığından daha düşük olabilir. Piyasalab, bu farkı görünür kılmak için nominal ve reel sonuçları aynı ekran üzerinde sunar. Böylece kullanıcı yalnızca kaç lira oldu sorusuna değil, o para bugün gerçekten ne kadar güçlü sorusuna da net bir yanıt alır.
          </p>

          <h3 className="app-text text-lg font-semibold">BIST 100 bileşik etkisi ve dönem seçiminin önemi</h3>
          <p>
            BIST 100 gibi endekslerde getiriyi değerlendirirken başlangıç yılı, yatırım süresi ve dalgalı dönemlerin dağılımı kritik rol oynar. Kısa dönemlerde sert yükseliş ya da düşüşler sonucu önemli ölçüde değiştirebilirken, daha uzun vadede bileşik getiri etkisi ön plana çıkar. Bileşik etki; kazancın da yeni kazanç üretmesiyle oluşur ve özellikle düzenli yatırım yapan kişiler için zamanla çarpan etkisi yaratır. Bu nedenle tek bir yılda ne oldu sorusundan çok, farklı dönemlerde nasıl bir profil oluşuyor yaklaşımı daha sağlıklıdır. Piyasalab&apos;daki çoklu varlık grafiği, aynı başlangıç tutarının farklı araçlarda nasıl evrildiğini yıllara yayarak gösterir ve yatırımcının dönem etkisini daha şeffaf görmesini sağlar.
          </p>

          <h3 className="app-text text-lg font-semibold">TÜFE ile enflasyon düzeltmesi nasıl okunmalı?</h3>
          <p>
            Enflasyon düzeltmesi yapılırken genellikle TÜFE endeksinin başlangıç ve bitiş dönemleri karşılaştırılır. Bu yöntemle geçmişteki bir tutarın bugünkü alım gücü karşılığı hesaplanabilir. Pratikte bu yaklaşım, yatırım getirilerinin reel analizinde güçlü bir referans sağlar. Ancak unutulmaması gereken önemli nokta, herkesin kişisel enflasyonunun farklı olduğudur. Örneğin kira ağırlığı yüksek bir bütçe ile gıda ağırlığı yüksek bir bütçenin hissedilen enflasyonu aynı olmayabilir. Dolayısıyla TÜFE, birebir kişisel yaşam maliyetini değil, genel fiyat seviyesini temsil eder. Piyasalab bu farkı açıkça belirterek kullanıcıyı bilinçli karar almaya yönlendirir ve verilerin bilgilendirme amaçlı olduğunu vurgular.
          </p>

          <h3 className="app-text text-lg font-semibold">Dolar bazlı reel getiri neden ayrıca izlenir?</h3>
          <p>
            Yerel para birimiyle yüksek görünen bir performans, uluslararası ölçekte aynı güçte olmayabilir. Bu yüzden yatırımcılar zaman zaman sonuçları USD bazında inceler. Ancak yalnızca kur çevrimi yapmak da tam bir reel analiz sayılmaz; çünkü doların kendi enflasyonu da zaman içinde satın alma gücünü etkiler. ABD TÜFE ile düzeltilmiş reel USD getirisi, yatırımın küresel referansla ne kadar değer ürettiğini anlamak için daha doğru bir çerçeve sunar. Özellikle uzun vadeli birikim planlayanlar için bu metrik, yerelde kazanç var ama küreselde değer korunuyor mu sorusunu cevaplar. Piyasalab&apos;daki ABD TÜFE anahtarı, nominal USD sonucu ve enflasyondan arındırılmış USD sonucu yan yana göstererek bu farkı görünür hale getirir.
          </p>

          <h3 className="app-text text-lg font-semibold">DRIP (Temettü Yeniden Yatırımı) etkisi</h3>
          <p>
            Temettü ödeyen hisselerde uzun vadeli performansı belirleyen unsurlardan biri de temettünün nasıl değerlendirildiğidir. DRIP açık olduğunda, alınan temettü tekrar varlığa yatırılır ve ana pozisyon büyür. Bu da zaman içinde bileşik getiriyi anlamlı ölçüde artırabilir. DRIP kapalı olduğunda ise temettü nakit olarak ayrı birikir; bu yaklaşım daha muhafazakâr bir görüntü verir ve nakit akışını izlemeyi kolaylaştırır. Hangi yöntemin uygun olduğu yatırımcının hedeflerine bağlıdır: büyüme odaklı yaklaşımda DRIP sıklıkla avantaj sağlar, düzenli nakit akışı isteyen yatırımcı içinse temettünün ayrı tutulması tercih edilebilir. Piyasalab iki senaryoyu da aynı model içinde karşılaştırılabilir şekilde sunar.
          </p>

          <h3 className="app-text text-lg font-semibold">Tavan serisi hesaplaması: heyecan ve gerçeklik</h3>
          <p>
            Halka arz dönemlerinde en çok konuşulan konulardan biri art arda tavan günleriyle oluşan teorik getirilerdir. Matematiksel olarak %10&apos;luk günlük artışın bileşik etkisi kısa sürede çarpıcı seviyelere ulaşabilir. Ancak gerçek piyasada likidite koşulları, emir derinliği, lot dağılımı, tavan bozulma riski ve yatırımcı davranışı sonucu ciddi şekilde değiştirebilir. Bu nedenle tavan serisi hesaplayıcıları bir olasılık laboratuvarı olarak görülmelidir; kesin sonuç üretmez. Piyasalab bu aracı eğitim odaklı bir simülasyon olarak konumlandırır ve gün gün tabloyla kullanıcıya bileşik matematiğin nasıl işlediğini anlatır. Böylece heyecan odaklı söylemler yerine sayısal farkındalık gelişir.
          </p>

          <h3 className="app-text text-lg font-semibold">Alım gücü simülatörü neden önemlidir?</h3>
          <p>
            Finansal planlama yalnızca yatırım getirisiyle değil, yaşam maliyetindeki dönüşümle birlikte düşünülmelidir. Geçmişteki bir tutarın bugünkü karşılığını görmek, bireysel bütçe kararlarında güçlü bir içgörü sağlar. Asgari ücret, çeyrek altın, Big Mac ya da günlük sepet gibi somut karşılıklar, soyut enflasyon kavramını günlük hayata taşır. Özellikle genç yatırımcılar için bu yaklaşım paranın zaman değeri kavramını daha anlaşılır kılar. Piyasalab&apos;ın nostalji simülatörü bu nedenle sadece eğlenceli bir bölüm değil, aynı zamanda davranışsal finans açısından öğretici bir araçtır. Kullanıcı geçmişe bakarak bugünkü tüketim ve birikim dengesini daha bilinçli kurabilir.
          </p>

          <h3 className="app-text text-lg font-semibold">Forum, sentiment ve hype göstergeleri nasıl kullanılmalı?</h3>
          <p>
            Topluluk verisi yatırım kararlarında destekleyici bir sinyal olabilir; ancak tek başına yeterli değildir. Forum mesaj yoğunluğu, emoji reaksiyonları, boğa/ayı oyları ve hype skorları piyasadaki duygu durumunu yansıtır. Bu sinyaller kısa vadeli volatiliteyi tahmin etmede yardımcı olabilir, fakat temel analiz ve risk yönetimi olmadan kullanıldığında yanıltıcı sonuçlara da yol açabilir. Piyasalab&apos;da sentiment bölümü özellikle kalabalığın yönünü göstermek için tasarlanmıştır; nihai karar mekanizması olarak sunulmaz. En sağlıklı yaklaşım, bu topluluk sinyallerini bilanço, değerleme ve makro görünümle birlikte çok katmanlı bir analiz içinde değerlendirmektir.
          </p>

          <h3 className="app-text text-lg font-semibold">Sık sorulan sorular (FAQ)</h3>
          <ol className="list-decimal space-y-2 pl-5">
            <li><strong className="app-text">BIST verisi neden 1986 sonrası?</strong> Çünkü BIST 100 endeks serisi bu dönemden itibaren düzenli referans sunar; daha eski dönemler için doğrudan karşılaştırma sınırlıdır.</li>
            <li><strong className="app-text">Reel getiri negatif çıkarsa ne anlama gelir?</strong> Nominal kazanç olsa bile enflasyon etkisi nedeniyle satın alma gücü artmamış olabilir.</li>
            <li><strong className="app-text">DRIP kapalıyken temettü nereye gider?</strong> Sistem temettüyü nakit birikim olarak ayrı izler ve toplam tabloda ayrıca gösterir.</li>
            <li><strong className="app-text">USD reel hesapta ABD TÜFE neden kullanılır?</strong> Doların kendi enflasyonunu temizleyerek uluslararası alım gücü etkisini daha doğru görmek için.</li>
            <li><strong className="app-text">Tavan serisi sonucu kesin mi?</strong> Hayır. Bu araç, teorik bileşik artış simülasyonu sağlar; piyasa koşulları sonucu değiştirebilir.</li>
            <li><strong className="app-text">Forum verisi yatırım tavsiyesi midir?</strong> Değildir. Topluluk duyarlılığı göstergesi olarak değerlendirilmelidir.</li>
          </ol>

          <p>
            Sonuç olarak sağlıklı bir yatırım değerlendirmesi; nominal getiri, reel getiri, döviz bazlı kıyas, enflasyon etkisi, temettü yaklaşımı ve davranışsal göstergeleri birlikte okumayı gerektirir. Piyasalab bu çok katmanlı yaklaşımı tek bir ekranda birleştirerek kullanıcının hem analitik hem pratik karar sürecini desteklemeyi amaçlar. Buradaki tüm araçlar bilgilendirme odaklıdır ve kişiye özel yatırım danışmanlığı yerine geçmez. Nihai yatırım kararlarında risk profili, likidite ihtiyacı ve profesyonel görüş birlikte değerlendirilmelidir.
          </p>
        </article>
      </div>

      <p className="app-muted mt-6 text-center text-xs">© 2024-2025 Piyasalab. Tüm hakları saklıdır.</p>
    </section>
  );
}
