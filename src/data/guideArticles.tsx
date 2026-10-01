import type { ReactNode } from "react";

export type GuideArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readingTime: string;
  content: ReactNode;
};

const prose = "app-text-secondary leading-7";
const heading = "app-text mb-3 mt-8 text-xl font-semibold";

export const guideArticles: GuideArticle[] = [
  {
    slug: "temettu-emekliligi-ve-birikim-stratejileri",
    title: "Borsa İstanbul'da Temettü Emekliliği ve Birikim Stratejileri",
    description: "Temettü gelirinin nasıl oluştuğunu, bileşik getiriyi ve uzun vadeli birikim planının temel ilkelerini adım adım inceleyin.",
    category: "Uzun vadeli yatırım",
    readingTime: "7 dakika",
    content: (
      <>
        <p className={prose}>Temettü emekliliği, birikim döneminde şirket payları edinip bu şirketlerin dağıttığı nakit temettüleri zaman içinde gelir kaynağına dönüştürme fikridir. Buradaki “emeklilik” sözü belirli bir tarihte veya tutarda gelir garantisi vermez. Temettü kararı şirketin genel kuruluna, kârlılığına, nakit akışına, yatırım planlarına ve mevzuata bağlıdır; dağıtım her yıl yapılmayabilir. Bu nedenle yaklaşımı sabit maaş gibi değil, değişken olabilen uzun vadeli portföy bileşeni olarak değerlendirmek gerekir.</p>
        <h2 className={heading}>Borsa İstanbul&apos;da temettü yatırımı nedir?</h2>
        <p className={prose}>Bir şirket dönem kârının bir bölümünü ortaklarıyla paylaşmaya karar verirse yatırımcı, hak sahipliği koşullarını sağladığı ölçüde temettü alabilir. Dağıtım oranı, geçmiş ödeme alışkanlığı ve temettü verimi tek başına gelecekteki ödemeyi göstermez. Temettü verimi çoğunlukla hisse başına yıllık temettünün güncel fiyata oranıyla hesaplanır; fiyat düştüğünde oran mekanik olarak yükselebilir. Bu yükseliş şirketin daha güvenli veya daha kârlı olduğu anlamına gelmez. Şirketin serbest nakit akışı, borç vadesi, yatırım ihtiyacı ve temettü politikasını birlikte okumak önemlidir.</p>
        <p className={prose}>Birikim planı oluşturmadan önce hedef süreyi, düzenli katkı tutarını, acil durum rezervini ve kabul edilebilir kayıp düzeyini belirlemek yararlıdır. Borçla yatırım yapmak veya kısa vadede ihtiyaç duyulacak parayı oynak varlıklara bağlamak, temettü stratejisinin amacını bozabilir. Yatırımcılar ayrıca stopaj, işlem komisyonu ve temettü tarihindeki fiyat hareketleri gibi unsurları dikkate almalıdır.</p>
        <h2 className={heading}>Bileşik getiri etkisi nasıl oluşur?</h2>
        <p className={prose}>Bileşik getiri, yatırımın ürettiği kazancın yeniden yatırıma eklenmesiyle sonraki dönemlerde daha büyük bir tabanın çalışmasıdır. Temettü alan yatırımcı nakdi harcamak yerine yeni pay almak için kullanırsa, sonraki dağıtımlarda sahip olduğu pay sayısı artmış olabilir. Sonuç; yeniden yatırım fiyatına, temettü miktarına, şirket performansına ve geçen zamana bağlıdır. Bileşik etkinin matematiksel olarak büyümesi, sermayenin değer kaybetmeyeceği anlamına gelmez. Hisse fiyatındaki düşüşler ve temettü kesintileri toplam sonucu olumsuz etkileyebilir.</p>
        <h3 className="app-text mb-2 mt-6 text-lg font-semibold">Temettüyü yeniden yatırma (DRIP) yaklaşımı</h3>
        <p className={prose}>DRIP, dağıtılan temettünün yeniden aynı varlığa veya yatırımcının planına uygun başka varlıklara yatırılması yaklaşımını anlatır. Otomatik yeniden yatırım olanağı her aracı kurumda bulunmayabilir; yatırımcı işlemi kendisi yapabilir. Karar verirken küsuratlı pay imkânı, komisyon, vergi, fiyat seviyesi ve portföy ağırlığına bakılmalıdır. Her temettüyü aynı şirkete yönlendirmek yoğunlaşma riskini artırabilir. Bazı yatırımcılar dağıtımı portföyde hedef ağırlığının altında kalan varlıklara aktararak yeniden dengeleme yapar.</p>
        <p className={prose}>Temettünün yeniden yatırıma yöneltilmesi, nakit ihtiyacınızın bulunmadığı ve portföy hedefinizle uyumlu olduğu dönemlerde düşünülebilir. Ancak yeniden yatırım için kullanılan fiyat, temettü hak kullanım tarihi çevresindeki fiyat hareketleri ve işlem maliyetleri sonucu değiştirir. Otomatik işlem özelliği kullanılıyorsa kurumun küsuratlı pay, ücret ve vergi uygulamalarını okuyun. Temettü ödemesini almak ile aynı gün tekrar pay almak arasında operasyonel ve vergisel farklılıklar olabilir; yatırımcı kendi durumunu kontrol etmelidir.</p>
        <p className={prose}>DRIP yaklaşımının temel varsayımı, dağıtılan nakdin harcanmayıp yeniden sermayeye eklenmesidir. Bu varsayım her aile bütçesi için uygun değildir. Birikim döneminde gelir yeniden yatırıma gidebilirken, gelir ihtiyacının arttığı dönemde nakdin bir kısmı harcamalara ayrılabilir. Strateji bu nedenle sabit kural değil, değişen hedeflere göre gözden geçirilen bir plan olarak düşünülmelidir.</p>
        <blockquote className="app-border my-5 border-l-4 pl-4 italic">Temettü tutarı önemlidir; ancak sermayenin korunması, şirket kalitesi ve portföy çeşitlendirmesi de aynı derecede önemlidir.</blockquote>
        <h2 className={heading}>Uzun vadeli hisse biriktirme ilkeleri</h2>
        <ul className="app-text-secondary list-disc space-y-2 pl-5 leading-7">
          <li><strong className="app-text">İşletmeyi inceleyin:</strong> Gelirin sürekliliği, kâr marjları, borçluluk ve nakit üretimini sektör bağlamında değerlendirin.</li>
          <li><strong className="app-text">Tek şirkete bağımlı kalmayın:</strong> Farklı sektörler ve varlık türleri, tek bir şirket veya sektör şokunun etkisini azaltabilir; riski ortadan kaldırmaz.</li>
          <li><strong className="app-text">Düzenli katkı planı kurun:</strong> Katkı tutarının sürdürülebilir olması, piyasa zamanlaması tahmininden daha uygulanabilir olabilir.</li>
          <li><strong className="app-text">Sonuçları toplam getiriyle ölçün:</strong> Temettü, fiyat değişimi, vergi ve masraflarla birlikte değerlendirilmelidir.</li>
        </ul>
        <h3 className="app-text mb-2 mt-6 text-lg font-semibold">Temettü verimi neden tek başına yeterli değildir?</h3>
        <p className={prose}>Temettü verimi, farklı şirketlerin son fiyat ve dağıtım tutarlarını aynı ölçekte görmeye yardımcı olur; fakat bu oran geçmiş veya açıklanmış ödeme üzerinden hesaplanabilir. Şirketin gelecekte dağıtım yapma kararı garanti değildir. Kârın düşmesi, nakit ihtiyacı, yeni yatırım planı veya ekonomik koşullar yönetimin dağıtımı azaltmasına ya da durdurmasına neden olabilir. Ayrıca yüksek verim, fiyatın şirketle ilgili olumsuz beklentiler nedeniyle düşmüş olmasından kaynaklanabilir. Ödeme geçmişini incelerken temettünün faaliyet nakdiyle karşılanıp karşılanmadığını, borç seviyesini ve sermaye harcamalarını da kontrol edin.</p>
        <p className={prose}>Uzun vadeli birikimde izleme disiplini, sık işlem yapmaktan daha önemlidir. Şirketin gelir kaynaklarında kalıcı değişim, rekabet gücünde kayıp veya bilanço riskinde belirgin artış varsa yatırım tezini yeniden değerlendirin. Temettü tarihlerini bir takvimde izlemek, açıklanan brüt tutarla hesabınıza geçen net tutarı karşılaştırmak ve portföy ağırlıklarını dönemsel olarak gözden geçirmek karar kayıtlarını güçlendirir. Her kararın gerekçesini yazılı tutmak, yalnızca fiyat hareketine tepki vermek yerine planla tutarlı hareket etmeye yardımcı olabilir.</p>
        <h2 className={heading}>Planı nasıl takip etmeli?</h2>
        <p className={prose}>Yılda belirli aralıklarla şirket raporlarını ve portföy dağılımını gözden geçirmek, her fiyat hareketinde işlem yapmaktan daha tutarlı bir süreç sağlayabilir. Temettü takvimini takip ederken ödeme tarihinin yanı sıra hak kullanım tarihini, net tutarı ve şirketin resmi açıklamasını kontrol edin. Kişisel hedefiniz değiştiğinde portföyü yeniden değerlendirin; geçmişte temettü ödemiş olması gelecekte aynı ödemenin yapılacağını garanti etmez. Buradaki bilgiler eğitim amaçlıdır, yatırım tavsiyesi değildir. Kararlarınızı kendi koşullarınız ve risk kapasiteniz doğrultusunda verin.</p>
      </>
    ),
  },
  {
    slug: "reel-kazanc-nedir-enflasyondan-korunma",
    title: "Reel Kazanç Nedir? Enflasyona Karşı Portföy Koruma Yöntemleri",
    description: "Nominal ve reel getiriyi ayırın; enflasyon, döviz ve çeşitlendirme etkilerini portföy değerlendirmesine katın.",
    category: "Getiri ve alım gücü",
    readingTime: "7 dakika",
    content: (
      <>
        <p className={prose}>Bir yatırım hesabındaki tutarın artması, satın alma gücünün de aynı ölçüde arttığı anlamına gelmez. Nominal getiri, başlangıç ve bitiş değerleri arasındaki para cinsinden değişimi ifade eder. Reel getiri ise aynı dönemde fiyatlar genel düzeyindeki değişimi hesaba katarak yatırımın satın alma gücünü nasıl etkilediğini inceler. Bu ayrım özellikle uzun dönemli hedeflerde önemlidir; çünkü birkaç yıl içinde biriken enflasyon, nominal kazancın önemli bir bölümünü azaltabilir.</p>
        <h2 className={heading}>Nominal getiri ile reel getiri arasındaki fark</h2>
        <p className={prose}>Basitleştirilmiş bir örnekte yatırım bir yılda yüzde 30 nominal artmış, aynı dönemde enflasyon yüzde 20 olmuşsa reel getiri yüzde 10 olarak düşünülmemelidir; oranlar bileşik ilişkiyle hesaplanır. Yaklaşık hesapta nominal oran ile enflasyon farkı alınabilir; daha doğru yaklaşımda reel katsayı, nominal büyüme katsayısının enflasyon katsayısına bölünmesiyle bulunur. Örneğin 1,30 değerini 1,20&apos;ye bölmek yaklaşık yüzde 8,3 reel artış verir. Bu örnek yöntemi göstermek içindir; belirli bir dönemin resmi enflasyon oranı yerine geçmez.</p>
        <p className={prose}>Kullanılan enflasyon göstergesi de sonucu etkiler. Tüketici fiyat endeksi genel bir sepeti izler, ancak her hanenin harcama bileşimi aynı değildir. Kira, eğitim, sağlık veya gıda payı yüksek olan bir kişinin kişisel enflasyonu yayımlanan ortalamadan farklılaşabilir. Bu nedenle reel getiri tek ve herkes için aynı bir ölçüm değil, seçilen dönem ve göstergeye bağlı bir analiz aracıdır.</p>
        <h2 className={heading}>Enflasyona karşı çeşitlendirme nasıl değerlendirilir?</h2>
        <p className={prose}>Portföy çeşitlendirmesi, farklı ekonomik koşullardan farklı biçimde etkilenebilen varlıklara yayılmayı amaçlar. Hisse senetleri işletmelerin gelir ve kârına ortaklık sağlar; tahvil ve mevduat faiz değişimlerine ve ihraççı riskine açıktır; kıymetli madenler dönem dönem farklı koruma özellikleri gösterebilir. Döviz cinsinden varlıklar kur değişimine maruz kalır; kurun yükselmesi her yatırım için kazanç anlamına gelmez. Her sınıfın kendi oynaklığı, likiditesi, vergisi ve değerleme riski vardır.</p>
        <p className={prose}>Çeşitlendirme, zararı engelleyen bir garanti değil, tek kaynağa bağımlılığı azaltma yöntemidir. Varlıkların aynı anda benzer yönde hareket edebileceği dönemler bulunur. Bu nedenle dağılımı yalnızca geçmiş performansa göre kurmak yerine yatırım süresi, nakit ihtiyacı, borçlar ve kayıp toleransıyla uyumlu hale getirmek gerekir. Düzenli aralıklarla hedef ağırlıkları kontrol etmek ve aşırı büyüyen pozisyonları gözden geçirmek disiplin sağlayabilir.</p>
        <p className={prose}>Bir portföyün dayanıklılığı sadece varlık sayısına bağlı değildir. Çok sayıda benzer şirket tutmak, ekonomik olarak tek bir sektöre yoğunlaşmak anlamına gelebilir. Varlıkların hangi koşullarda değer kaybedebileceğini, ne kadar sürede nakde çevrilebileceğini ve beklenmedik harcamada hangi kaynağın kullanılacağını önceden düşünün. Düzenli yeniden dengeleme, hedeflenen risk dağılımına yaklaşmaya yardım edebilir; ancak işlem maliyeti, vergi ve piyasa koşulları dikkate alınmalıdır.</p>
        <h3 className="app-text mb-2 mt-6 text-lg font-semibold">Dolar bazlı hisse analizi ne söyler?</h3>
        <p className={prose}>Bir hisseyi yerel para biriminde izlemek yerel yatırımcının portföy değerini gösterir; dolar bazında bakmak ise fiyat değişimiyle kur değişiminin birleşik etkisini ortaya koyar. TL fiyatı yükselirken dolar karşılığı düşebilir veya tersi yaşanabilir. Dolar bazlı analiz şirketin gerçek değerini tek başına açıklamaz; döviz geliri, ithal girdi, borç para birimi ve enflasyon muhasebesi gibi unsurların şirket finansallarını nasıl etkilediğini incelemek gerekir.</p>
        <p className={prose}>Döviz cinsinden karşılaştırma yapılırken başlangıç ve bitiş günündeki kurun hangi kaynaktan alındığını, temettülerin aynı para birimine çevrilip çevrilmediğini ve bölünme gibi sermaye işlemlerinin hesaba katılıp katılmadığını belirtin. Sadece hisse fiyatını dövize bölmek, temettü dahil toplam getiriyi vermez. Farklı ülke piyasaları kıyaslanıyorsa işlem saatleri, tatil günleri, stopaj ve yatırımcıya uygulanabilecek masraflar da farklı olabilir. Bu nedenle dolar bazlı grafik açıklayıcı bir ek görünüm sağlar, tek başına karar kuralı değildir.</p>
        <blockquote className="app-border my-5 border-l-4 pl-4 italic">Farklı para birimlerinde sunulan getirileri karşılaştırmadan önce aynı başlangıç-bitiş tarihini, temettü varsayımını ve maliyetleri kullandığınızdan emin olun.</blockquote>
        <h2 className={heading}>Reel getiri hesabında kontrol listesi</h2>
        <ul className="app-text-secondary list-disc space-y-2 pl-5 leading-7">
          <li>Başlangıç ve bitiş tarihlerini aynı dönem için belirleyin.</li>
          <li>Nominal değişimi temettü, komisyon ve vergi varsayımlarından ayırmadan yorumlamayın.</li>
          <li>Karşılaştırmada hangi enflasyon endeksinin kullanıldığını not edin.</li>
          <li>TL ve döviz getirilerini kur etkisini açıkça belirterek kıyaslayın.</li>
          <li>Sonucu geleceğe yönelik garanti olarak değil, geçmiş dönemin ölçümü olarak görün.</li>
        </ul>
        <p className={prose}>Reel getiri araçları farklı senaryoları anlamaya yardımcı olur; kişiye özel portföy önerisi sunmaz. Enflasyon ve piyasa verileri güncellenebilir, geçmiş değerler farklı kaynaklara göre değişebilir. Büyük mali kararlarınızda resmi veri kaynaklarını ve yetkili profesyonelleri esas alın.</p>
      </>
    ),
  },
  {
    slug: "fk-ve-pddd-oranlari-nasil-yorumlanir",
    title: "Hisse Senedi Analizinde F/K ve PD/DD Oranları Nasıl Yorumlanır?",
    description: "Fiyat/kazanç ve piyasa/defter değeri oranlarının ne anlattığını, sınırlarını ve sektör karşılaştırmasını öğrenin.",
    category: "Şirket analizi",
    readingTime: "8 dakika",
    content: (
      <>
        <p className={prose}>Bir şirket hissesini incelerken fiyat tek başına yeterli bilgi vermez. Yüzlerce liralık bir hisse ucuz, birkaç liralık bir hisse pahalı olabilir; değerlendirme şirketin faaliyetleri, kârı, varlıkları, borcu ve beklentileriyle birlikte yapılır. Fiyat/kazanç (F/K) ve piyasa değeri/defter değeri (PD/DD) oranları yatırımcıların sık kullandığı başlangıç ölçüleridir. Bu oranlar şirket değerini kesin olarak belirlemez; finansal tabloları daha sistemli incelemek için ortak bir dil sağlar.</p>
        <h2 className={heading}>F/K oranı nedir?</h2>
        <p className={prose}>F/K, şirketin piyasa değerinin belirli bir dönemde elde ettiği net kâra oranlanmasıyla veya hisse fiyatının pay başına kazanca bölünmesiyle hesaplanır. Örneğin şirketin piyasa değeri 10 milyar TL, son on iki aylık net kârı 1 milyar TL ise basit F/K 10 olur. Bu, piyasanın mevcut kârın yaklaşık on katı değer biçtiğini gösterir; yatırımcının parasını on yılda kesin geri alacağı anlamına gelmez. Kâr döngüsel olabilir, tek seferlik gelir içerebilir veya gelecek dönemlerde azalabilir.</p>
        <p className={prose}>Çok düşük F/K; düşük beklenti, geçici yüksek kâr, artan borç riski veya sektör baskısı gibi farklı nedenlerden kaynaklanabilir. Yüksek F/K ise büyüme beklentisini yansıtabilir, ancak beklentiler gerçekleşmezse fiyat hassasiyeti artabilir. F/K&apos;nın negatif veya anlamsız olduğu zarar dönemlerinde oran karşılaştırması kullanışsız hale gelir. Hesapta kullanılan dönem, seyreltilmiş pay sayısı ve enflasyon muhasebesi de oranı değiştirebilir.</p>
        <h2 className={heading}>PD/DD nasıl okunur?</h2>
        <p className={prose}>PD/DD, şirketin borsadaki piyasa değerini özkaynaklarına, başka bir ifadeyle muhasebe kayıtlarındaki net varlık değerine oranlar. Oranın 1 olması piyasa değerinin defter değerine eşit olduğunu söyler; şirketin tasfiye edilmesi halinde yatırımcının parasını alacağını garanti etmez. Varlıkların güncel piyasa değeri, alacakların tahsil edilebilirliği, borçların kapsamı ve maddi olmayan değerler bilançoda farklı biçimde yer alabilir.</p>
        <p className={prose}>PD/DD özellikle bankacılık gibi bilanço kalemlerinin faaliyet modelinde merkezi olduğu sektörlerde incelenebilir. Buna karşılık yazılım, marka veya hizmet ağırlıklı şirketlerde defter değeri işletmenin ekonomik gücünü eksik yansıtabilir. Özsermayesi negatif şirketlerde oran anlamsızlaşır. Bu nedenle PD/DD her şirket türüne aynı şekilde uygulanmamalıdır.</p>
        <h3 className="app-text mb-2 mt-6 text-lg font-semibold">Sektörel karşılaştırma ve finansal tablo okuma</h3>
        <p className={prose}>Oranları kıyaslarken benzer iş modeli, coğrafya, bilanço tarihi ve muhasebe dönemi seçin. Bir bankayı sanayi şirketiyle veya hızlı büyüyen teknoloji firmasını olgun bir tüketim şirketiyle yalnızca F/K üzerinden sıralamak yanıltıcıdır. Şirketin satış büyümesi, faaliyet kâr marjı, nakit akışı, net borç, sermaye ihtiyacı ve yönetim kalitesi birlikte değerlendirilmelidir. Ayrıca raporlanan kârın nakde dönüşüp dönüşmediğini, kur farkı veya varlık satışının sonucu geçici olarak etkileyip etkilemediğini inceleyin.</p>
        <p className={prose}>Sektör karşılaştırmasında şirketlerin aynı raporlama dönemini açıklamış olmasına dikkat edin. Mevsimsellik taşıyan işlerde tek çeyrek, yıllık performansı olduğundan güçlü veya zayıf gösterebilir. Şirketin yatırım döneminde olması da marj ve nakit akışını geçici olarak etkileyebilir. Karşılaştırılabilir şirket seçerken büyüklük, faaliyet coğrafyası, ürün karması ve borç yapısı gibi özellikleri not edin. Benzer görünmeyen firmaların oranlarını tek tabloda sıralamak, sayısal olarak net fakat ekonomik olarak anlamsız sonuçlar doğurabilir.</p>
        <blockquote className="app-border my-5 border-l-4 pl-4 italic">Tek bir oran, şirketin değerini açıklamaz. Aynı göstergenin zaman içindeki eğilimini ve benzer şirketlerle farkını anlamak daha yararlı bir başlangıçtır.</blockquote>
        <h2 className={heading}>Pratik analiz adımları</h2>
        <ul className="app-text-secondary list-disc space-y-2 pl-5 leading-7">
          <li>Resmi finansal tablo ve faaliyet raporunun tarihini kontrol edin.</li>
          <li>F/K için kârın sürdürülebilirliğini ve tek seferlik kalemleri araştırın.</li>
          <li>PD/DD için özkaynak kalitesini, varlıkları ve borçları inceleyin.</li>
          <li>Şirketi benzer sektör şirketleriyle ve kendi geçmiş oranlarıyla karşılaştırın.</li>
          <li>Oranları nakit akışı, büyüme, borçluluk ve risklerle beraber yorumlayın.</li>
        </ul>
        <p className={prose}>Bir oranı incelerken pay ve paydanın tanımını da sorun. F/K hesabında kullanılan net kâr ana ortaklığa ait kâr mı, son on iki ay mı yoksa ileriye dönük tahmin mi? PD/DD&apos;de özkaynak hangi bilanço tarihinden geliyor ve sermaye artırımı sonuca dahil edilmiş mi? Veri sağlayıcılar farklı tanımlar kullanabilir. Şirketin yayımladığı finansal tablo ve dipnotlara ulaşmak, oranı yeniden kurmak veya en azından kullanılan dönemi doğrulamak karşılaştırmayı daha güvenilir hale getirir.</p>
        <p className={prose}>Analiz sonunda bir şirketi “ucuz” veya “pahalı” diye tek kelimeyle sınıflandırmak yerine, hangi varsayımların bu görüşe yol açtığını yazın. Kârlılık gerilerse, finansman maliyeti yükselirse veya büyüme yavaşlarsa değerleme nasıl değişebilir? Bu sorular farklı senaryolarda düşünmeyi sağlar. Finansal oranlar belirsizliği ortadan kaldırmaz; şirket ve piyasa risklerini düzenli biçimde sorgulamaya yardımcı olur.</p>
        <p className={prose}>Finansal oranlar geçmiş veya yayımlanmış verileri özetler; gelecekteki getiriyi öngörmez ve hisse alım-satım sinyali değildir. VeriAkış&apos;taki oran ve skorlar bilgilendirme amaçlıdır; kaynak kapsamı ve güncelleme tarihi değişebilir. Yatırım kararlarında şirketin resmi açıklamalarını kontrol edin ve kişisel koşullarınıza uygun profesyonel danışmanlık alın.</p>
      </>
    ),
  },
];