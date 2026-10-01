"use client";

const wrapper = "app-surface-2 app-border mt-6 rounded-xl border p-4 sm:p-5";
const h2 = "app-text text-xl font-semibold";
const h3 = "app-text mt-5 text-base font-semibold";
const p = "app-text-secondary mt-3 text-sm leading-7";
const list = "app-text-secondary mt-3 list-disc space-y-2 pl-5 text-sm leading-7";

export function MarketGuideText() {
  return (
    <article className={wrapper} aria-labelledby="market-guide-title">
      <h2 id="market-guide-title" className={h2}>Canlı Piyasa Verileri Nasıl Okunur?</h2>
      <p className={p}>Piyasa ekranı; Borsa İstanbul endekslerini ve paylarını, döviz çiftlerini, kıymetli madenleri ve kripto varlıkları tek yerde izlemeye yardımcı olur. Bir fiyatı değerlendirirken yalnızca son değere bakmak yerine varlığın para birimini, ölçü birimini, fiyatın hangi saatte güncellendiğini ve günlük değişimin hangi kapanışa göre hesaplandığını kontrol edin. TL ile dolar cinsinden fiyatlar doğrudan kıyaslanamaz; aynı şekilde ons, gram, endeks puanı ve hisse lotu farklı büyüklükleri temsil eder. Ekrandaki etiketler bu ayrımı görünür kılmayı amaçlar.</p>
      <h3 className={h3}>Fiyat, değişim ve kaynak bilgisi</h3>
      <p className={p}>Günlük yüzde değişim, seçilen veri kaynağının son fiyatı ile referans aldığı önceki kapanış arasındaki farkı gösterir. Bu oran, yatırımcının gerçekleşmiş getirisiyle aynı şey değildir: işlem zamanı, alış maliyeti, komisyon, vergi ve temettü gibi unsurlar kişisel sonucu değiştirir. Veri sağlayıcıların piyasa saatleri, sembol eşleştirmeleri ve güncelleme aralıkları farklı olabilir. Piyasa kapalıyken görünen son fiyat, yeni bir işlem fiyatı olarak yorumlanmamalıdır. Gecikmeli, eksik veya geçici olarak ulaşılmayan veriler bulunabilir; önemli işlemler öncesinde aracı kurumunuzun ekranını ve borsanın resmi duyurularını kontrol edin.</p>
      <h3 className={h3}>Endeks ve varlık gruplarını karşılaştırma</h3>
      <p className={p}>Endeks, belirli kurallarla seçilmiş menkul kıymetlerin toplu performansını özetler; tek bir şirketin riskini veya bütün piyasanın durumunu eksiksiz anlatmaz. Döviz kuru iki para birimi arasındaki fiyatı, emtia fiyatı ise ilgili sözleşme ya da göstergeyi yansıtır. Kripto varlıklar günün her saati işlem görebilir ve geleneksel piyasalardan farklı likidite ve saklama riskleri taşır. Bu nedenle portföyünüzdeki birden fazla kategoriyi incelerken ortak tarih aralığı, para birimi ve getiri yöntemi kullanın.</p>
      <ul className={list}>
        <li>Sembolün hangi varlık türüne ve hangi para birimine ait olduğunu doğrulayın.</li>
        <li>Fiyat ile yüzde değişimi, güncelleme zamanı ve piyasa seansıyla beraber okuyun.</li>
        <li>Karşılaştırmaları aynı dönem ve aynı para birimine çevirerek yapın.</li>
        <li>Veri kartlarını araştırma başlangıcı olarak görün; resmi bildirimlerin yerine koymayın.</li>
      </ul>
      <p className={p}>Birden fazla kaynaktan alınan fiyatlar küçük farklar gösterebilir; bu farklar güncelleme saati, işlem yeri veya sembol tanımından kaynaklanabilir. Özellikle kıymetli madenlerde spot gösterge, vadeli sözleşme ve perakende satış fiyatının aynı olmadığını unutmayın. Bir varlıkla ilgili haber okurken açıklamanın yayımlandığı tarih ve ilgili şirketin resmi bildirimiyle tutarlılığını kontrol etmek de yanlış çıkarımları azaltır.</p>
      <p className={p}>VeriAkış piyasa görünümü finansal okuryazarlığı desteklemek için sunulur. Fiyatlar değişebilir ve tüm piyasa koşullarını yansıtmayabilir. Buradaki bilgiler yatırım tavsiyesi değildir; yatırım kararları kişisel araştırma ve risk değerlendirmesi gerektirir.</p>
    </article>
  );
}

export function CalculatorGuideText() {
  return (
    <article className={wrapper} aria-labelledby="calculator-guide-title">
      <h2 id="calculator-guide-title" className={h2}>BIST Getiri Hesaplama Algoritması Nasıl Çalışır?</h2>
      <p className={p}>Getiri hesaplayıcısı, kullanıcının girdiği başlangıç tutarını, seçtiği varlığı ve tarih aralığını belirli varsayımlarla bir araya getirerek senaryo sonucu üretir. Bileşik büyüme yaklaşımında dönemsel değişimler başlangıç değerine uygulanır; temettü yeniden yatırımı açıksa varsayılan temettü varsayımı da modele eklenebilir. Bu yapı, farklı varlıkların aynı başlangıç noktası ve dönem altında nasıl değiştiğini anlamaya yardımcı olur. Ancak araca girilen sonuç, gerçek bir portföy ekstresi veya geleceğe dönük tahmin değildir. Gerçek işlem fiyatları, alım tarihleri, ara nakit akışları ve yatırımcının yaptığı işlemler farklı olabilir.</p>
      <h3 className={h3}>Tarihsel verilerle analiz yaparken dikkat edilmesi gerekenler</h3>
      <p className={p}>Nominal getiri, yalnızca para tutarındaki değişimi gösterir. Reel getiri için aynı dönem enflasyon etkisiyle düzeltilir; farklı enflasyon göstergeleri farklı sonuç verebilir. Dolar veya başka bir döviz cinsinden performans inceleniyorsa kur değişimi de sonuca katılır. Bu hesaplamalar, para birimi dönüşümü ve tarih seçimine duyarlıdır. Endeks getirisi, endeks bileşenlerinin tamamını işlem maliyetleriyle satın almış gerçek bir yatırımcının getirisiyle bire bir aynı olmayabilir. Temettülerin hangi tarihte ve hangi fiyattan yeniden yatırıma yönlendirildiği de bileşik sonuçları etkiler.</p>
      <h3 className={h3}>Sonuçları nasıl yorumlamalı?</h3>
      <p className={p}>Bir senaryoyu anlamlı biçimde kıyaslamak için başlangıç ve bitiş tarihlerini, para birimini, enflasyon varsayımını ve temettü seçeneğini sabit tutun. Sonra toplam getiriyle birlikte yıllık bileşik büyüme oranını, reel değeri ve oynaklık ihtimalini değerlendirin. En yüksek geçmiş sonuca ulaşmış varlığın gelecekte de en iyi seçenek olacağı çıkarımı yapılamaz. Geçmiş dönem; ekonomik döngü, sektör yapısı ve değerleme seviyeleri bakımından gelecekte tekrarlanmayabilir.</p>
      <ul className={list}>
        <li>Başlangıç tutarının hangi para biriminde olduğunu kontrol edin.</li>
        <li>Temettü yeniden yatırımı varsayımının sonucu nasıl etkilediğini ayrı inceleyin.</li>
        <li>Reel getiri ile nominal getiriyi birbirine karıştırmayın.</li>
        <li>Komisyon, vergi, enflasyon ölçümü ve veri kaynağı sınırlamalarını not edin.</li>
      </ul>
      <p className={p}>Bileşik getiri oranı, farklı uzunlukta dönemleri yıllık ölçekte karşılaştırmaya yardım eder; fakat dönem içindeki dalgalanmayı göstermez. Aynı toplam sonuca ulaşan iki yatırımın ara dönem düşüşleri çok farklı olabilir. Bu yüzden yalnızca başlangıç ve bitiş değerlerine değil, yatırım süresince yaşanabilecek oynaklığa ve paraya ne zaman ihtiyaç duyulacağına da bakın. Sonucu alternatif senaryolarla karşılaştırmak varsayımların etkisini görünür kılar.</p>
      <p className={p}>Araç, finansal kavramları açıklamak ve tarihsel senaryoları karşılaştırmak içindir. Girdiler yaklaşık olabilir; sonuç kişisel yatırım tavsiyesi, getiri garantisi veya alım-satım sinyali değildir.</p>
    </article>
  );
}

export function ScorecardGuideText() {
  return (
    <article className={wrapper} aria-labelledby="scorecard-guide-title">
      <h2 id="scorecard-guide-title" className={h2}>Hisse Senedi Karnesi Oluşturulurken Hangi Finansal Rasyolar Kullanılır?</h2>
      <p className={p}>Bir hisse karnesi, şirketi tek bir sayı ile tanımlamak yerine farklı finansal boyutlara ilişkin göstergeleri düzenli biçimde inceleme aracıdır. Değerleme, kârlılık, büyüme, borçluluk, nakit akışı ve temettü başlıkları şirketin farklı yönlerini gösterir. Oranların anlamı sektör, iş modeli, bilanço dönemi ve kullanılan veri tanımına göre değiştiğinden, puanlar kesin bir kalite ölçüsü olarak görülmemelidir. Bu ekrandaki örnek skorlar eğitim ve gösterim amaçlıdır; gerçek zamanlı bağımsız bir denetim veya yatırım önerisi değildir.</p>
      <h3 className={h3}>F/K, PD/DD ve kârlılık göstergeleri</h3>
      <p className={p}>Fiyat/kazanç oranı, piyasa değerini şirket kârıyla ilişkilendirir. Oran, kârın sürdürülebilirliği ve sektör yapısı incelenmeden tek başına ucuzluk göstermez. Piyasa değeri/defter değeri oranı, piyasa değerini özkaynakla kıyaslar; varlıkların niteliği ve muhasebe değerleri yorumu değiştirebilir. Net kâr marjı satışların ne kadarının kâra dönüştüğüne, özsermaye kârlılığı ise şirketin ortak sermayesini ne ölçüde kullandığına dair fikir verir. Tek seferlik gelirler bu göstergeleri geçici olarak yükseltebilir.</p>
      <h3 className={h3}>Büyüme, borçluluk ve nakit akışı</h3>
      <p className={p}>Ciro ve faaliyet kârındaki büyüme, şirketin ölçeklenmesine ilişkin bilgi verir; büyümenin kalıcı olması ve nakit üretimine dönüşmesi ayrıca incelenmelidir. Net borç, borç/özsermaye oranı ve faiz karşılama ölçüleri finansman riskini anlamaya yardımcı olur. Borç seviyesi sektörün sermaye ihtiyacıyla beraber değerlendirilmelidir: altyapı şirketleriyle yazılım şirketlerinin doğal borç yapıları aynı olmayabilir. Nakit akışı, muhasebe kârının tahsilat ve işletme nakdiyle desteklenip desteklenmediğini gösteren önemli bir kontrol noktasıdır.</p>
      <ul className={list}>
        <li>Şirketi öncelikle aynı sektörde ve benzer iş modelindeki firmalarla karşılaştırın.</li>
        <li>Oranların son açıklanan döneme mi, son on iki aya mı dayandığını kontrol edin.</li>
        <li>Değerleme metriklerini kârlılık, borç ve serbest nakit akışıyla birlikte okuyun.</li>
        <li>Veri kaynağı, bilanço tarihi ve bir defalık kalemler konusunda temkinli olun.</li>
      </ul>
      <p className={p}>Finansal tablo okurken gelir tablosu, bilanço ve nakit akış tablosunu birlikte ele alın. Satış artışı stok veya alacakların çok daha hızlı büyümesiyle gerçekleşiyorsa tahsilat kalitesi ayrıca sorgulanmalıdır. Sermaye harcamaları yüksek şirketlerde serbest nakit akışı geçici olarak zayıflayabilir; yatırımın kapasiteye ve gelecekteki gelire nasıl katkı sağlayacağını faaliyet raporundan araştırın. Böylece tek bir orana aşırı anlam yüklemeden daha dengeli bir şirket profili çıkarabilirsiniz.</p>
      <p className={p}>Karnedeki görünüm, araştırmaya nereden devam edilebileceğini gösteren bir başlangıç çerçevesidir. Şirket faaliyet raporları, finansal tabloları ve KAP açıklamalarıyla doğrulama yapın. Finansal oranlar geçmiş veriyi özetler, gelecekteki performansı garanti etmez ve kişiye özel yatırım tavsiyesi değildir.</p>
    </article>
  );
}