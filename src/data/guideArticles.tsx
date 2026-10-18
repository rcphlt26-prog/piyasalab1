import type { ReactNode } from "react";

type ExampleTable = {
  columns: string[];
  rows: string[][];
  note: string;
};

export type GuideArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readingTime: string;
  content: ReactNode;
};

type GuideArticleDefinition = Omit<GuideArticle, "content"> & {
  intro: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
  exampleTitle: string;
  example: ExampleTable;
  summary: string;
};

const prose = "app-text-secondary leading-7";
const heading = "app-text mb-3 mt-8 text-xl font-semibold";
const subHeading = "app-text mb-2 mt-6 text-lg font-semibold";

function renderTable(table: ExampleTable) {
  return (
    <div className="app-surface app-border mt-3 overflow-x-auto rounded-xl border p-3">
      <table className="w-full min-w-[540px] border-collapse text-sm">
        <thead>
          <tr className="app-muted border-b text-left text-xs uppercase tracking-wide">
            {table.columns.map((column) => (
              <th key={column} className="px-2 py-2 font-semibold">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, index) => (
            <tr key={index} className="app-border border-b last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="app-text px-2 py-2 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="app-muted mt-2 text-xs">{table.note}</p>
    </div>
  );
}

function renderArticle(definition: GuideArticleDefinition) {
  return (
    <>
      <p className={prose}>{definition.intro}</p>
      {definition.sections.map((section) => (
        <section key={section.heading}>
          <h2 className={heading}>{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index} className={prose}>{paragraph}</p>
          ))}
        </section>
      ))}
      <h3 className={subHeading}>{definition.exampleTitle}</h3>
      {renderTable(definition.example)}
      <blockquote className="app-border my-5 border-l-4 pl-4 italic">
        Bu içerik bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Karar almadan önce kişisel risk profilinizi, vade beklentinizi ve resmi kaynakları birlikte değerlendirin.
      </blockquote>
      <div className="app-surface-2 app-border rounded-xl border p-4">
        <h3 className="app-text text-base font-semibold">Sonuç / Özet</h3>
        <p className="app-text-secondary mt-2 leading-7">{definition.summary}</p>
      </div>
    </>
  );
}

const definitions: GuideArticleDefinition[] = [
  {
    slug: "fk-ve-pddd-orani-nedir-ve-nasil-yorumlanir",
    title: "F/K (Fiyat/Kazanç) ve PD/DD Oranı Nedir, Hisse Analizinde Nasıl Yorumlanır?",
    description: "F/K ve PD/DD oranlarının temel mantığını, hangi sektörlerde ne anlatabildiğini ve tek başına neden yeterli olmadığını adım adım öğrenin.",
    category: "Şirket analizi",
    readingTime: "10 dakika",
    intro: "Hisse senedi analizine yeni başlayan yatırımcıların en sık yaptığı hata, fiyatı tek başına ucuz veya pahalı olarak etiketlemektir. Oysa 15 TL fiyatlı bir hisse pahalı, 250 TL fiyatlı bir hisse ucuz olabilir. Bu farkı anlamanın yolu şirketin ürettiği kâr, bilanço kalitesi ve geleceğe dönük beklentileri birlikte incelemektir. F/K ve PD/DD oranları, bu incelemenin başlangıç noktasıdır. Ancak oranların doğru yorumlanması için hesaplama dönemi, sektör yapısı, şirketin borçluluk düzeyi ve kârlılığın sürdürülebilirliği gibi değişkenlerin tamamına bakmak gerekir. Bu rehberde oranların ne söylediğini, ne söylemediğini ve pratik kullanımını ele alıyoruz.",
    sections: [
      {
        heading: "F/K oranı neyi ölçer?",
        paragraphs: [
          "F/K oranı, piyasanın bir şirketin 1 TL net kârına kaç TL değer biçtiğini gösterir. Basit biçimiyle hisse fiyatının hisse başına kâra bölünmesiyle veya şirketin piyasa değerinin net kâra oranlanmasıyla hesaplanır. Örneğin piyasa değeri 24 milyar TL, son on iki aylık net kârı 3 milyar TL olan bir şirkette F/K yaklaşık 8 çıkar. Bu oran, yatırımın sekiz yılda kesin geri döneceği anlamına gelmez; yalnızca mevcut kâra göre piyasa değerlemesinin kabaca çarpanını verir.",
          "F/K oranının düşük olması her zaman fırsat anlamına gelmez. Şirketin kârı geçici bir kalemle şişmiş olabilir, talep daralması nedeniyle gelecek dönem kârları düşecek olabilir veya borç çevrim riski artmış olabilir. Benzer şekilde yüksek F/K da otomatik olarak pahalı demek değildir; hızlı büyüyen, güçlü nakit üreten ve yüksek özsermaye kârlılığına sahip şirketlerde piyasa daha yüksek çarpan ödeyebilir. Asıl kritik olan, oranı şirketin kendi geçmişi ve benzerleriyle kıyaslayarak değerlendirmektir.",
        ],
      },
      {
        heading: "PD/DD oranı neden önemlidir?",
        paragraphs: [
          "PD/DD oranı, piyasa değerinin bilançodaki özsermayeye oranıdır. Özellikle finans, sigorta, holding ve varlık yoğun sektörlerde anlamlı bir referans sağlar çünkü bilanço kalemleri iş modelinin merkezindedir. Örneğin PD/DD 1,2 ise piyasa şirketi defter değerinin yüzde 20 üzerinde fiyatlıyor demektir. Ancak bu, şirketin tasfiye halinde aynı değerden satılacağı veya hissedarın bu tutarı mutlaka geri alacağı anlamına gelmez.",
          "Defter değeri muhasebe standartlarına göre hesaplanır ve varlıkların gerçek piyasa değerinden farklı olabilir. Maddi olmayan duran varlıklar, enflasyon düzeltmeleri, karşılıklar ve yeniden değerleme kalemleri oranı ciddi biçimde etkileyebilir. Bu nedenle PD/DD yorumlanırken bilanço dipnotları, özkaynak kalitesi ve varlıkların likiditesi birlikte okunmalıdır. Özsermayesi negatif olan şirketlerde ise PD/DD analitik değerini büyük ölçüde kaybeder.",
        ],
      },
      {
        heading: "Sektör karşılaştırması nasıl yapılmalı?",
        paragraphs: [
          "Bir banka ile bir teknoloji şirketinin F/K veya PD/DD oranını doğrudan karşılaştırmak çoğu zaman yanıltıcıdır. Çünkü marj yapısı, büyüme döngüsü, regülasyon yükü ve sermaye ihtiyacı tamamen farklıdır. Sağlıklı karşılaştırma için aynı sektörde, benzer ölçekte ve yakın bilanço döneminde raporlama yapan şirketler seçilmelidir. Ayrıca tek bir tarihteki oran yerine son üç-beş yılın eğilimleri incelenirse geçici bozulmalarla yapısal değişimler ayrıştırılabilir.",
          "Karşılaştırmada veri sağlayıcı farklılıklarını da dikkate almak gerekir. Bazı platformlar ileriye dönük tahmini kâr kullanırken bazıları gerçekleşmiş son on iki ay verisini alır. Bu farklılık, aynı şirkette F/K değerini ciddi biçimde değiştirebilir. Uygulamada en güvenli yöntem, şirketin finansal raporundaki net kâr ve özsermaye rakamını baz alarak oranı kendiniz yeniden üretmektir. Böylece kullandığınız verinin kapsamını netleştirir ve daha tutarlı karar alırsınız.",
        ],
      },
      {
        heading: "Oranlar hangi risklerde yetersiz kalır?",
        paragraphs: [
          "F/K ve PD/DD oranları geçmiş veya cari dönem fotoğrafı sunar; yönetim kalitesi, rekabet avantajı, dava riskleri, jeopolitik belirsizlikler ve kur şokları gibi nitel faktörleri tek başına yakalayamaz. Bu nedenle oranları şirket stratejisi, sektör görünümü ve nakit akış analizleriyle birlikte okumak şarttır. Özellikle borçlu şirketlerde faiz oranı değişimi, görünürde düşük F/K’yı kısa sürede anlamsızlaştırabilir.",
          "Yatırımcı için en pratik yaklaşım, oranları bir eleme aracı olarak kullanıp nihai kararı daha geniş bir kontrol listesiyle vermektir: faaliyet marjı trendi, serbest nakit akışı, net borç/FAVÖK, ihracat payı, yönetim kalitesi, kurumsal yönetim uygulamaları ve temettü politikası. Bu çerçeve, tek bir oranın sunduğu yanılsamaları azaltır ve daha dengeli risk yönetimi sağlar.",
        ],
      },
    ],
    exampleTitle: "Örnek hesaplama tablosu (TL)",
    example: {
      columns: ["Şirket", "Piyasa Değeri", "Net Kâr (12A)", "Özsermaye", "F/K", "PD/DD"],
      rows: [
        ["A Şirketi", "24.000.000.000", "3.000.000.000", "18.000.000.000", "8,0", "1,33"],
        ["B Şirketi", "15.500.000.000", "1.250.000.000", "9.200.000.000", "12,4", "1,68"],
        ["C Şirketi", "9.600.000.000", "1.600.000.000", "11.800.000.000", "6,0", "0,81"],
      ],
      note: "Formül: F/K = Piyasa Değeri / Net Kâr, PD/DD = Piyasa Değeri / Özsermaye. Rakamlar eğitim amaçlı örnektir.",
    },
    summary: "F/K ve PD/DD, şirket analizi için güçlü başlangıç metrikleridir; ancak tek başına yatırım kararı üretmez. Oranları sektör, dönem, bilanço kalitesi ve nakit akışıyla birlikte değerlendirmek gerekir. En sağlıklı yaklaşım, oranları filtreleme aracı olarak kullanıp nihai kararı çok boyutlu analizle vermektir.",
  },
  {
    slug: "bilesik-getiri-nedir-uzun-vadeli-yatirimda-kar-topu-etkisi",
    title: "Bileşik Getiri Nedir? Uzun Vadeli Yatırımda Kar Topu Etkisi",
    description: "Bileşik getirinin matematiğini, düzenli katkının etkisini ve uzun vadede neden en güçlü kaldıraçlardan biri olduğunu örnek tabloyla görün.",
    category: "Uzun vadeli yatırım",
    readingTime: "9 dakika",
    intro: "Yatırım dünyasında en çok duyulan kavramlardan biri bileşik getiridir; ancak çoğu yatırımcı bu etkinin gücünü yalnızca teoride bilir. Bileşik getiri, sadece ana paranızın büyümesi değil, elde edilen kazancın da yeniden kazanç üretmesiyle oluşur. Bu yüzden kısa vadede etkisi sınırlı görünürken uzun vadede dramatik bir fark yaratabilir. Kar topu etkisi benzetmesi tam da buradan gelir: küçük bir birikim, disiplinli katkı ve yeterli zamanla beklenenden çok daha büyük bir portföye dönüşebilir. Bununla birlikte bileşik getiri sihirli bir formül değildir; dalgalı piyasa dönemleri, yanlış risk yönetimi ve düzensiz katkı davranışı sonucu ciddi biçimde değiştirebilir.",
    sections: [
      {
        heading: "Bileşik getirinin temel mantığı",
        paragraphs: [
          "Basit getiride yalnızca başlangıç sermayesi getiriyi üretir. Bileşik getiride ise her dönem sonunda biriken toplam tutar yeni dönemin başlangıç sermayesine dönüşür. Matematiksel olarak Portföy Değeri = Başlangıç Tutarı × (1 + getiri oranı)^dönem sayısı biçiminde özetlenebilir. Düzenli katkı varsa modele her dönemde eklenen tutar da dahil edilir ve sonuç daha yüksek çıkar. Bu nedenle yatırım süresi uzadıkça getiri eğrisi doğrusal değil, ivmelenen bir yapı gösterir.",
          "Bileşik etkinin çalışması için iki temel koşul önemlidir: kazancın portföyde kalması ve yeterli zaman. Kârı erken dönemde çekmek, eğriyi aşağı çeker. Benzer şekilde çok kısa vadede yüksek getiri beklentisi bileşik mekanizmayı zayıflatır. Birçok yatırımcı ilk yıllarda büyümenin yavaş olduğunu görüp stratejiden vazgeçer; oysa bileşik etkinin en güçlü kısmı genellikle son yıllarda görünür hale gelir.",
        ],
      },
      {
        heading: "Düzenli katkı neden sonucu çarpıcı biçimde değiştirir?",
        paragraphs: [
          "Sadece başlangıç sermayesine güvenmek yerine aylık veya üç aylık düzenli katkı yapmak, piyasa zamanlaması baskısını azaltır. Fiyatlar yüksekken daha az, düşükken daha çok birim almak ortalama maliyeti dengeleyebilir. Bu yaklaşım her zaman en yüksek getiriyi garanti etmez; ancak davranışsal hataları azaltarak planın sürdürülebilirliğini artırır. Özellikle gelir akışı düzenli olan yatırımcılar için otomatik katkı, disiplin oluşturmanın en etkili yollarından biridir.",
          "Katkı tutarını küçük ama sürdürülebilir seçmek, agresif ama kısa ömürlü bir plan yapmaktan daha verimlidir. Örneğin aylık 2.000 TL ile başlayan bir yatırımcı, gelir artışı oldukça bu tutarı enflasyon oranında güncellerse uzun vadede ciddi fark yaratabilir. Burada esas avantaj, getirinin yanı sıra birikim alışkanlığının sistematik hale gelmesidir. Bileşik getiri, iyi bir davranış modeliyle birleştiğinde gerçek gücünü gösterir.",
        ],
      },
      {
        heading: "Getiri kadar risk yönetimi de önemlidir",
        paragraphs: [
          "Yüksek ortalama getiri vaat eden bir strateji, çok yüksek dalgalanma nedeniyle yatırımcının planı yarıda bırakmasına yol açabilir. Bileşik getiri yalnızca kağıt üzerindeki oranla değil, yatırımcının stratejide kalma becerisiyle ilgilidir. Bu nedenle portföy dağılımı; vade, likidite ihtiyacı ve risk toleransına göre belirlenmelidir. Gerektiğinde hisse, sabit getirili ürünler ve emtia arasında denge kurmak dalgalanmayı yönetmeye yardımcı olur.",
          "Ayrıca bileşik hesaplarda komisyon, vergi ve fon giderleri ihmal edilmemelidir. Küçük görünen yıllık maliyetler uzun vadede toplam getiriyi ciddi biçimde aşağı çekebilir. Bu yüzden net getiri odaklı düşünmek, yani masraflar sonrası performansı izlemek daha sağlıklı bir yaklaşımdır. Özellikle sık işlem yapan yatırımcılar, brüt getirileri yüksek görünse bile net tarafta beklenenden zayıf sonuçlarla karşılaşabilir.",
        ],
      },
      {
        heading: "Kar topu etkisini bozan yaygın hatalar",
        paragraphs: [
          "En yaygın hata, kısa vadeli düşüşlerde panik satış yapmaktır. Planın her dalgalanmada değiştirilmesi, bileşik mekanizmayı sürekli sıfırlar. İkinci hata, bütün birikimi tek varlıkta toplamak ve beklenmedik bir şokta yılların emeğini riske atmaktır. Üçüncü hata ise çok iddialı hedefler koyup katkı planını sürdürememektir. Strateji, psikolojik olarak uygulanabilir olmadığında matematiksel avantajların anlamı kalmaz.",
          "Daha gerçekçi bir yöntem, yıllık kontrol noktaları belirlemek ve planı yalnızca bu tarihlerde gözden geçirmektir. Böylece anlık haber akışı yerine uzun vadeli hedeflere odaklanılır. Portföyün performansı kadar katkı disiplini, nakit rezervi ve borçluluk durumu da izlenmelidir. Bileşik getiri bir sonuçtur; asıl belirleyici olan, bu sonuca götüren davranış sistemidir.",
        ],
      },
    ],
    exampleTitle: "Örnek bileşik getiri tablosu (TL)",
    example: {
      columns: ["Yıl", "Başlangıç Değeri", "Yıllık Katkı", "Yıllık Getiri (%)", "Yıl Sonu Değeri"],
      rows: [
        ["1", "100.000", "24.000", "18", "146.320"],
        ["2", "146.320", "24.000", "18", "200.578"],
        ["3", "200.578", "24.000", "18", "264.382"],
        ["4", "264.382", "24.000", "18", "339.271"],
        ["5", "339.271", "24.000", "18", "427.180"],
      ],
      note: "Aylık 2.000 TL katkı ve yıllık ortalama %18 varsayımıyla hazırlanmış eğitim amaçlı örnektir. Gerçek getiriler dönemsel olarak farklılaşır.",
    },
    summary: "Bileşik getiri, zaman ve disiplin birleştiğinde en güçlü büyüme mekanizmalarından biridir. Düzenli katkı, maliyet bilinci ve risk yönetimi olmazsa matematiksel avantajın büyük kısmı kaybolabilir. Uzun vadede başarı; doğru varlık seçimi kadar doğru davranış modeliyle ilişkilidir.",
  },
  {
    slug: "bist-100-ve-bist-30-endeksleri-nedir",
    title: "BIST 100 ve BIST 30 Endeksleri Nedir, Nasıl Hesaplanır?",
    description: "Borsa İstanbul'un iki temel endeksinin kapsamını, hesaplama mantığını ve yatırımcının bu endeksleri nasıl okumasi gerektiğini öğrenin.",
    category: "Piyasa temelleri",
    readingTime: "9 dakika",
    intro: "Borsa İstanbul dendiğinde en çok duyulan iki gösterge BIST 100 ve BIST 30 endeksleridir. Pek çok yatırımcı bu endeksleri yalnızca günlük yüzde değişim olarak takip eder; ancak endeksin neyi temsil ettiğini bilmeden yapılan yorumlar eksik kalır. Endeks, tek bir şirketin değil belirli kriterlerle seçilen şirket sepetinin performansını gösterir. Bu yüzden piyasanın genel yönü, sektör dağılımı ve risk iştahı hakkında önemli sinyaller üretir. BIST 30 daha büyük ve likit şirketlerden oluşurken BIST 100 daha geniş bir kapsama sahiptir. Rehberin amacı, bu iki endeksi sadece ekrandaki rakamlar olarak değil, yatırım kararını destekleyen analitik araçlar olarak okumayı öğretmektir.",
    sections: [
      {
        heading: "BIST 30 ve BIST 100 arasındaki temel fark",
        paragraphs: [
          "BIST 30, piyasa değeri ve işlem hacmi bakımından öne çıkan daha sınırlı sayıdaki şirketi içerir. Bu nedenle büyük ölçekli kurumların ve endeks türev ürünlerinin ana referanslarından biridir. BIST 100 ise bu kapsama ek olarak daha geniş şirket grubunu içerir ve genel piyasa görünümünü daha yaygın temsil eder. Teknik olarak iki endeks de düzenli dönemlerde gözden geçirilir; şirketlerin endekse girme veya çıkma koşulları Borsa İstanbul tarafından belirlenir.",
          "Yatırımcı açısından fark şudur: BIST 30’un hareketleri, bankacılık ve büyük sanayi hisseleri nedeniyle bazen daha konsantre olabilir. BIST 100 ise sektör çeşitliliği daha yüksek olduğu için bazı dönemlerde daha dengeli bir tablo sunabilir. Bu nedenle sadece tek endekse bakmak yerine iki endeksi birlikte izlemek, piyasa genişliği hakkında daha doğru fikir verir.",
        ],
      },
      {
        heading: "Endeks nasıl hesaplanır?",
        paragraphs: [
          "Endeks hesaplamasının temelinde şirketlerin fiili dolaşımdaki payları ve piyasa değerleri bulunur. Basitleştirilmiş anlatımla, endeksi oluşturan şirketlerin ağırlıklı piyasa değerlerinin toplamı belirli bir bölen katsayıya bölünerek endeks seviyesi elde edilir. Bu bölen, bedelli-bedelsiz sermaye artırımı, temettü, birleşme veya bölünme gibi şirket olaylarının endeksi yapay biçimde bozmaması için teknik olarak güncellenir.",
          "Önemli nokta, endeksin her hisseye eşit ağırlık vermemesidir. Piyasa değeri ve fiili dolaşım büyük olan şirketlerin endeks üzerindeki etkisi daha yüksektir. Bu yüzden birkaç büyük hissedeki güçlü hareket, endeksi yukarı çekerken endeks dışı geniş bir hisse grubunda zayıf görünüm devam edebilir. Piyasa genişliği analizi yaparken bu ayrımı görmek kritik önem taşır.",
        ],
      },
      {
        heading: "Endeks yükselirken portföy neden aynı performansı göstermeyebilir?",
        paragraphs: [
          "Yatırımcıların sık yaşadığı bir durum, endeks güçlü yükselirken portföyün sınırlı artmasıdır. Bunun temel nedeni ağırlık farklarıdır. Endeksi taşıyan büyük hisseler portföyünüzde yeterli oranda yoksa endeks performansını yakalamak zorlaşır. Tersi durumda, endeks düşerken portföyün daha iyi dayanması da mümkündür. Bu nedenle endeks performansını kişisel başarı ölçütü olarak kullanırken portföy bileşiminizi ve risk seviyenizi dikkate almalısınız.",
          "Ayrıca endeks seviyesi tek başına değerleme hakkında net bilgi vermez. Endeksin yükselmesi şirket kârlılıklarının arttığı anlamına gelebileceği gibi, risk iştahı veya likidite etkisiyle çarpanların genişlemesi sonucu da olabilir. Dolayısıyla endeks hareketini mutlaka bilanço sezonu, faiz görünümü ve kur dinamiği ile birlikte okumak gerekir.",
        ],
      },
      {
        heading: "Endeks verisini yatırım sürecine nasıl entegre etmeli?",
        paragraphs: [
          "BIST 30 ve BIST 100, yatırımcının piyasa rejimini anlaması için güçlü sinyaller sunar. Örneğin BIST 30 güçlü, BIST 100 zayıfsa hareketin büyük hisselerde yoğunlaştığı düşünülebilir. Tam tersi durumda daha geniş katılımlı bir yükselişten söz edilebilir. Bu ayrım, portföydeki sektör ve ölçek dağılımını gözden geçirmek için pratik bir rehberdir.",
          "Orta ve uzun vadeli yatırımcılar için endeksler, tek başına al-sat sinyali değil, risk yönetimi ve pozisyon boyutu ayarı için referans olmalıdır. Endeksin yüksek volatiliteye geçtiği dönemlerde kaldıraç azaltmak, nakit oranını geçici artırmak veya sektör dağılımını dengelemek gibi adımlar düşünülebilir. Nihai karar her zaman kişisel risk profilinizle uyumlu olmalıdır.",
        ],
      },
    ],
    exampleTitle: "Basitleştirilmiş endeks ağırlık örneği (TL)",
    example: {
      columns: ["Şirket", "Fiili Dolaşım Piyasa Değeri", "Endeks Ağırlığı", "Günlük Değişim", "Endekse Katkı"],
      rows: [
        ["Şirket A", "180.000.000.000", "%30", "+%2,0", "+0,60 puan"],
        ["Şirket B", "120.000.000.000", "%20", "-%1,0", "-0,20 puan"],
        ["Diğerleri", "300.000.000.000", "%50", "+%0,4", "+0,20 puan"],
      ],
      note: "Toplam katkı yaklaşık +0,60 puan olur. Büyük ağırlıklı hisseler endeks yönünü belirlemede daha etkilidir.",
    },
    summary: "BIST 30 ve BIST 100, piyasa nabzını tutmak için kritik göstergelerdir. Ancak endeks hareketini doğru okumak için ağırlık yapısını, şirket olaylarını ve makro koşulları birlikte değerlendirmek gerekir. Endeksler kararın kendisi değil, karar sürecini güçlendiren bir çerçevedir.",
  },
  {
    slug: "temettu-yatirimciligi-ve-temettu-verimi-hesaplama-rehberi",
    title: "Temettü (Kâr Payı) Yatırımcılığı ve Temettü Verimi Hesaplama Rehberi",
    description: "Temettü yatırımcılığının temelini, verim hesabını ve sürdürülebilir temettü için takip edilmesi gereken finansal göstergeleri öğrenin.",
    category: "Gelir odaklı yatırım",
    readingTime: "10 dakika",
    intro: "Temettü yatırımcılığı, hisse senedi yatırımını sadece fiyat artışı üzerinden değil, düzenli nakit akışı perspektifiyle ele alır. Özellikle uzun vadeli yatırımcılar için temettü, portföyün toplam getirisini destekleyen önemli bir bileşendir. Ancak temettü odaklı yaklaşımda en kritik nokta, yalnızca yüksek verim oranına bakmak yerine bu verimin sürdürülebilirliğini analiz etmektir. Bir şirketin bir yıl yüksek temettü dağıtması, bunu her yıl aynı düzeyde sürdüreceği anlamına gelmez. Şirketin kârlılığı, nakit üretme kapasitesi, borçluluğu ve yatırım planları temettü politikasını doğrudan etkiler. Bu rehberde temettü verimi hesabını, yorumlama hatalarını ve disiplinli temettü stratejisinin nasıl kurulacağını adım adım inceliyoruz.",
    sections: [
      {
        heading: "Temettü verimi nasıl hesaplanır?",
        paragraphs: [
          "Temettü verimi, hisse başına dağıtılan yıllık brüt temettünün hisse fiyatına oranlanmasıyla hesaplanır. Formül: Temettü Verimi (%) = (Hisse Başına Temettü / Hisse Fiyatı) × 100. Örneğin hisse başına 9 TL temettü dağıtan ve borsada 180 TL’den işlem gören bir şirkette verim yaklaşık %5 olur. Bu oran, yatırımcının mevcut fiyata göre aldığı yıllık nakit akışın kaba seviyesini gösterir.",
          "Ancak verim oranı statik değildir; hisse fiyatı düştüğünde oran otomatik yükselir, yükseldiğinde düşer. Bu nedenle sadece yüksek verim görmek, şirketin ucuz olduğu sonucuna götürmemelidir. Fiyat düşüşünün nedeni kâr gerilemesi veya bilanço riskiyse yüksek görünen verim bir uyarı sinyali de olabilir. Verimi geçmiş dağıtım alışkanlığı, payout oranı ve serbest nakit akışıyla birlikte yorumlamak gerekir.",
        ],
      },
      {
        heading: "Sürdürülebilir temettü için hangi göstergeler izlenmeli?",
        paragraphs: [
          "Sürdürülebilir temettü politikasında ilk bakılacak gösterge, net kârın nakde dönüşümüdür. Şirket muhasebe kârı açıklasa bile işletme faaliyetlerinden düzenli nakit üretmiyorsa temettü devamlılığı zorlaşır. İkinci gösterge dağıtım oranıdır: Kârın ne kadarı temettüye ayrılıyor? Çok yüksek oranlar, büyüme yatırımlarını sınırlayabilir veya zayıf yıllarda dağıtımın keskin düşmesine neden olabilir.",
          "Üçüncü gösterge borçluluk yapısıdır. Yüksek faiz ortamında kısa vadeli borcu ağır şirketler, nakdi temettü yerine borç servisine yönlendirebilir. Dördüncü gösterge ise sermaye harcaması ihtiyacıdır. Özellikle yatırım döngüsündeki şirketler, kısa vadede daha düşük temettü dağıtıp kaynaklarını büyüme projelerine ayırabilir. Yatırımcı için doğru soru, ‘verim kaç’ değil ‘bu verim hangi finansal gerçeklik üzerine kurulu’ olmalıdır.",
        ],
      },
      {
        heading: "Temettü tarihleri ve fiyat etkisi",
        paragraphs: [
          "Temettü sürecinde hak kullanım tarihi, ödeme tarihi ve kayıt tarihi gibi kavramlar önemlidir. Hak kullanım tarihinden sonra hisse fiyatı teorik olarak dağıtılan brüt temettü kadar aşağı ayarlanır. Bu yüzden yatırımcı sadece ‘temettü aldım’ diyerek toplam getiriyi eksik değerlendirebilir. Doğru yaklaşım, temettü + fiyat değişimi + vergi/masraf etkisini birlikte hesaplamaktır.",
          "Ayrıca farklı aracı kurumların temettü yansıtma saatleri, küsurat uygulamaları ve raporlama biçimleri değişebilir. Net tutarı takip ederken stopaj etkisini ve hesap ekstrenizdeki kayıtları kontrol etmek önemlidir. Temettü stratejisinde operasyonel detayları bilmek, beklenmedik farkların önüne geçer.",
        ],
      },
      {
        heading: "Temettü odaklı portföy kurulumu",
        paragraphs: [
          "Temettü portföyü kurarken tek bir yüksek verimli hisseye yoğunlaşmak yerine sektör çeşitlendirmesi yapmak daha dengeli bir risk profili sunar. Bankacılık, enerji, sanayi, telekom ve tüketim gibi farklı döngülere sahip alanlara dağılım sağlamak gelir akışındaki dalgalanmayı azaltabilir. Bununla birlikte her sektörün kendi regülasyon ve döngü riski olduğu unutulmamalıdır.",
          "Temettü gelirini düzenli harcamaya dönüştürmek isteyen yatırımcı ile birikim döneminde olan yatırımcı aynı portföy yapısına ihtiyaç duymaz. Birikim döneminde yeniden yatırım (DRIP) etkisi büyümeyi artırabilir; gelir döneminde ise daha istikrarlı nakit akışı öncelik kazanabilir. Strateji, yatırımcının yaşam döngüsüne göre güncellenmelidir.",
        ],
      },
    ],
    exampleTitle: "Temettü verimi örnek hesap tablosu (TL)",
    example: {
      columns: ["Şirket", "Hisse Fiyatı", "Hisse Başı Temettü", "Brüt Verim", "10.000 TL ile Yıllık Brüt Temettü"],
      rows: [
        ["Şirket A", "180", "9", "%5,0", "500"],
        ["Şirket B", "95", "4,75", "%5,0", "500"],
        ["Şirket C", "62", "2,48", "%4,0", "400"],
      ],
      note: "Basit örnek amaçlıdır. Gerçekte stopaj, komisyon ve fiyat değişimleri toplam getiriyi etkiler.",
    },
    summary: "Temettü yatırımcılığı, yalnızca yüksek oran kovalamak değil, sürdürülebilir kârlılık ve nakit üretimine ortak olmaktır. Verim oranını kâr kalitesi, borçluluk ve sektör dinamiğiyle birlikte okumak uzun vadede daha sağlam sonuç verir. Her koşulda toplam getiri yaklaşımı korunmalıdır.",
  },
  {
    slug: "enflasyon-karsisinda-reel-getiri-nasil-hesaplanir",
    title: "Enflasyon Karşısında Reel Getiri Nasıl Hesaplanır? (Nominal vs Reel Getiri)",
    description: "Nominal kazanç ile satın alma gücü artışı arasındaki farkı görün; reel getiri formülünü ve yorumlama adımlarını örneklerle öğrenin.",
    category: "Getiri analizi",
    readingTime: "9 dakika",
    intro: "Yatırım hesabınızın tutarı artarken gerçek anlamda zenginleşmeyebilirsiniz. Çünkü para miktarı arttığı halde aynı dönemde fiyatlar daha hızlı yükselmişse satın alma gücü düşebilir. Bu nedenle nominal getiri ile reel getiri ayrımı, özellikle yüksek enflasyon dönemlerinde kritik hale gelir. Nominal getiri, sadece portföy tutarındaki artışı ifade eder; reel getiri ise enflasyon etkisini temizleyerek gerçek alım gücü değişimini ölçer. Uzun vadeli plan yapan yatırımcılar için bu ayrım, hedef belirleme ve performans değerlendirmesinin temelidir. Bu rehberde nominal-reel farkını, doğru hesaplama formülünü ve karar sürecine nasıl uygulanacağını pratik bir dille ele alıyoruz.",
    sections: [
      {
        heading: "Nominal ve reel getiri arasındaki fark",
        paragraphs: [
          "Nominal getiri, yatırımınızın başlangıç ve bitiş değerleri arasındaki yüzdesel farktır. Örneğin 100.000 TL’lik portföy yıl sonunda 130.000 TL olduysa nominal getiri %30’dur. Ancak aynı dönemde enflasyon %22 ise bu %30’un tamamı gerçek kazanç değildir. Reel getiri, fiyat artışlarını dikkate alarak bu büyümenin satın alma gücüne ne kadar yansıdığını ölçer.",
          "Basit yaklaşımda nominalden enflasyonu çıkarmak kabaca fikir verir; ancak doğru yöntem bileşik formüldür: Reel Getiri = ((1 + nominal getiri) / (1 + enflasyon)) - 1. Bu formül oranların çarpan etkisini dikkate aldığı için daha güvenilir sonuç üretir. Özellikle yüksek enflasyon dönemlerinde iki yöntem arasındaki fark belirginleşir.",
        ],
      },
      {
        heading: "Hangi enflasyon göstergesi kullanılmalı?",
        paragraphs: [
          "Resmi hesaplamalarda çoğunlukla TÜFE baz alınır çünkü geniş tüketim sepetini temsil eder. Ancak her yatırımcının kişisel harcama kompozisyonu farklıdır. Konut, eğitim veya sağlık harcamalarının ağırlığı yüksek olan bir kişinin hissettiği enflasyon resmi ortalamadan sapabilir. Bu nedenle reel getiriyi değerlendirirken kullanılan endeksi açıkça not etmek gerekir.",
          "Ayrıca dönem uyumu önemlidir. Yatırımın başlangıç-bitiş tarihleri ile enflasyon serisinin kapsadığı dönem aynı olmalıdır. Takvim yılı getirisiyle farklı tarihli enflasyon verisini eşleştirmek analizi bozar. Veri disiplininin en güçlü tarafı, küçük tanım hatalarının büyük yorum hatalarına dönüşmesini engellemesidir.",
        ],
      },
      {
        heading: "Reel getiri neden strateji seçiminde belirleyicidir?",
        paragraphs: [
          "Yatırımcı için nihai soru, portföyün enflasyondan daha hızlı büyüyüp büyümediğidir. Nominal olarak yükselen ama reel olarak gerileyen bir portföy, uzun vadede hedeflere ulaşmayı zorlaştırır. Emeklilik planı, çocuk eğitimi veya konut birikimi gibi hedeflerde reel getiri takibi yapılmazsa tasarruf açığı geç fark edilir.",
          "Reel getiriyi izlemek, varlık dağılımını daha gerçekçi yönetmeyi sağlar. Örneğin yalnızca düşük riskli ürünlerde kalmak bazı dönemlerde nominal korunma sağlasa da reel kayıp yaratabilir. Tersine aşırı riskli strateji de kısa vadede yüksek nominal kazanç sunsa bile sert geri çekilmeler nedeniyle reel tarafta istikrarsız olabilir. Denge, hedef vade ve risk toleransına göre kurulmalıdır.",
        ],
      },
      {
        heading: "Uygulamada sık yapılan hesaplama hataları",
        paragraphs: [
          "En yaygın hata, farklı dönemleri karşılaştırmaktır. Aylık getiriyi yıllık enflasyonla kıyaslamak veya yıl ortasında başlayan yatırımı tam yıl enflasyonuna bölmek sonucu yanıltır. İkinci hata, vergi ve işlem maliyetini dışarıda bırakmaktır. Net getiriyi düşüren bu kalemler özellikle kısa vadede reel hesabı ciddi etkiler.",
          "Üçüncü hata ise döviz bazlı sonuçları enflasyon etkisinden bağımsız yorumlamaktır. Kur artışı bazı dönemlerde nominal koruma sağlar, ancak ilgili para biriminin kendi enflasyonu dikkate alınmadan gerçek satın alma gücü tam ölçülemez. Bu nedenle çoklu para birimi analizlerinde metodoloji açıkça belirtilmelidir.",
        ],
      },
    ],
    exampleTitle: "Nominal vs reel getiri örnek tablosu (TL)",
    example: {
      columns: ["Başlangıç Tutarı", "Yıl Sonu Tutarı", "Nominal Getiri", "Dönem Enflasyonu", "Reel Getiri"],
      rows: [
        ["100.000", "130.000", "%30,0", "%22,0", "%6,6"],
        ["100.000", "145.000", "%45,0", "%32,0", "%9,8"],
        ["100.000", "118.000", "%18,0", "%20,0", "-%1,7"],
      ],
      note: "Reel Getiri = ((1 + nominal) / (1 + enflasyon)) - 1 formülüyle hesaplanmıştır. Rakamlar örnek amaçlıdır.",
    },
    summary: "Nominal artış tek başına başarı göstergesi değildir; asıl kritik ölçü satın alma gücüdür. Reel getiri hesabı düzenli yapılırsa yatırım performansı daha doğru değerlendirilir ve strateji zamanında güncellenebilir. Uzun vadeli hedeflerde reel perspektif vazgeçilmezdir.",
  },
  {
    slug: "portfoy-cesitlendirme-stratejileri-ve-risk-yonetimi",
    title: "Portföy Çeşitlendirme (Sepet Yapma) Stratejileri ve Risk Yönetimi",
    description: "Sepet yapmanın mantığını, hangi riskleri azaltabildiğini ve etkin bir portföy dağılımı kurarken dikkat edilmesi gereken adımları öğrenin.",
    category: "Risk yönetimi",
    readingTime: "10 dakika",
    intro: "Portföy çeşitlendirme, yatırım dünyasında en fazla tekrar edilen ama en az doğru uygulanan kavramlardan biridir. Birçok yatırımcı çeşitlendirmeyi sadece çok sayıda hisse almak olarak yorumlar. Oysa gerçek çeşitlendirme, farklı risk kaynaklarına maruz varlıkları bir araya getirerek tek bir şokun toplam portföy üzerindeki etkisini azaltmaktır. Bu yaklaşım riski tamamen ortadan kaldırmaz; ancak dalgalanmayı daha yönetilebilir hale getirebilir. Özellikle belirsiz makro dönemlerde, çeşitlendirme disiplini yatırımcının planda kalma olasılığını artırır. Bu rehberde varlık, sektör ve para birimi düzeyinde çeşitlendirme yöntemlerini; yeniden dengeleme ve pozisyon boyutlandırma kurallarıyla birlikte ele alıyoruz.",
    sections: [
      {
        heading: "Çeşitlendirme hangi riski azaltır, hangisini azaltmaz?",
        paragraphs: [
          "Çeşitlendirme, şirkete özgü riskleri azaltmada etkilidir. Örneğin tek bir şirkette yaşanacak yönetim krizi, bilanço bozulması veya dava süreci tüm portföyü vurmasın diye pozisyonlar dağıtılır. Ancak piyasa genelini etkileyen sistemik şoklarda tüm varlık sınıfları aynı yönde baskı görebilir. Bu nedenle çeşitlendirme önemli ama tek başına yeterli bir koruma değildir.",
          "Yatırımcı, çeşitlendirmeyi garanti mekanizması olarak değil risk dengeleme aracı olarak görmelidir. Kriz dönemlerinde korelasyonların yükselmesi, normalde bağımsız görünen varlıkların birlikte düşmesine neden olabilir. Bu ihtimal, acil durum nakdi ve uygun kaldıraç seviyesi gibi ek önlemleri zorunlu kılar.",
        ],
      },
      {
        heading: "Katmanlı çeşitlendirme yaklaşımı",
        paragraphs: [
          "Etkili bir sepet için üç katman düşünülebilir: varlık sınıfı, sektör ve para birimi. Varlık sınıfında hisse, sabit getirili ürün, emtia ve likit nakit dengesi kurulur. Sektör katmanında bankacılık, sanayi, tüketim, enerji gibi farklı döngülere sahip alanlar dağıtılır. Para birimi katmanında ise yerel ve yabancı para cinsi maruziyet dengelenir.",
          "Bu katmanlar birbirini tamamlar. Örneğin sadece çok sayıda hisse tutup hepsini aynı sektörde toplamak gerçek çeşitlendirme sağlamaz. Benzer şekilde farklı sektörlerden hisseler alsanız da hepsi aynı makro risk faktörüne bağlıysa koruma sınırlı kalır. Sepet tasarımı, risk kaynaklarını mümkün olduğunca bağımsızlaştırmaya odaklanmalıdır.",
        ],
      },
      {
        heading: "Pozisyon boyutu ve yeniden dengeleme",
        paragraphs: [
          "Çeşitlendirme kadar önemli bir konu, her varlığın portföydeki ağırlığıdır. Çok güvenilen bir varlıkta bile aşırı yüksek oran taşımak tekil riski artırır. Uygulamada üst limit belirlemek (örneğin tek varlıkta %15-20 bandı) denge sağlar. Bu limitler yatırımcının risk toleransına göre değişebilir; önemli olan önceden belirlenmiş kuralın disiplinle uygulanmasıdır.",
          "Zamanla bazı varlıklar daha hızlı yükselir ve hedef dağılım bozulur. Yeniden dengeleme, ağırlıkları planlanan seviyeye çekerek risk profilini korur. Bu süreçte vergi, komisyon ve piyasa likiditesi dikkate alınmalıdır. Çok sık dengeleme maliyet yaratır, çok seyrek dengeleme risk kontrolünü zayıflatır. Yıllık veya yarıyıllık kontrol noktaları pratik bir denge sağlayabilir.",
        ],
      },
      {
        heading: "Davranışsal riskler ve sepet disiplini",
        paragraphs: [
          "Çeşitlendirme planları çoğu zaman teknik değil davranışsal nedenlerle bozulur. Bir varlık çok yükseldiğinde yatırımcı daha da artırma eğilimine girer; düşüşte ise plansız biçimde her şeyi satabilir. Bu iki uç davranış, sepetin risk-fayda dengesini bozar. Yazılı yatırım politikası oluşturmak ve kararları bu çerçevede almak davranışsal hataları azaltır.",
          "Ayrıca hedeflerin zaman ufkuna göre ayrıştırılması gerekir. Kısa vadeli nakit ihtiyacı olan para ile uzun vadeli büyüme sermayesinin aynı portföyde yönetilmesi gereksiz stres yaratır. Katmanlı bütçe yaklaşımı, yatırım kararlarını daha rasyonel hale getirir ve zor dönemlerde planın sürdürülebilirliğini artırır.",
        ],
      },
    ],
    exampleTitle: "Örnek çeşitlendirme tablosu (TL)",
    example: {
      columns: ["Varlık Grubu", "Hedef Ağırlık", "Portföy Tutarı", "Beklenen Rol"],
      rows: [
        ["Hisse Senetleri", "%45", "450.000", "Uzun vadeli büyüme"],
        ["Sabit Getirili Ürünler", "%25", "250.000", "Dalgalanma dengeleme"],
        ["Altın / Emtia", "%15", "150.000", "Enflasyon ve belirsizlik tamponu"],
        ["Likidite / Nakit", "%15", "150.000", "Acil durum ve fırsat payı"],
      ],
      note: "1.000.000 TL örnek portföy üzerinden hazırlanmıştır. Gerçek dağılım kişisel risk profiline göre farklılaşmalıdır.",
    },
    summary: "Portföy çeşitlendirme, getiriyi garantilemez ama tek bir riskin portföyü devirmesini zorlaştırır. Başarılı sepet yönetimi; doğru dağılım, düzenli yeniden dengeleme ve davranışsal disiplinin birlikte uygulanmasına bağlıdır. Risk yönetimi, yatırım performansının ayrılmaz parçasıdır.",
  },
  {
    slug: "kap-bildirimleri-nasil-okunur",
    title: "KAP (Kamuyu Aydınlatma Platformu) Bildirimleri Nasıl Okunur?",
    description: "KAP duyurularını yalnızca başlıktan değil içerik etkisinden okuyabilmek için pratik bir analiz çerçevesi edinin.",
    category: "Piyasa okuryazarlığı",
    readingTime: "8 dakika",
    intro: "KAP, halka açık şirketlerin yatırımcılarla resmi bilgi paylaştığı en kritik platformlardan biridir. Ancak yatırımcıların önemli bir bölümü KAP bildirimlerini ya hiç okumaz ya da yalnızca başlığa bakarak karar verir. Bu yaklaşım, yanlış fiyatlama dönemlerinde ciddi hata riskini artırır. Bildirimin türü, zamanlaması, finansal etkisi ve önceki açıklamalarla tutarlılığı birlikte değerlendirilmelidir. Özellikle yatırım, borçlanma, dava, ortaklık yapısı ve finansal sonuç duyuruları kısa vadeli fiyat hareketlerinin ötesinde orta vadeli değerlemeyi de etkileyebilir. Bu rehber, KAP okumayı sistematik hale getirmek için bir kontrol listesi ve örnek analiz çerçevesi sunar.",
    sections: [
      {
        heading: "KAP bildirim türleri ve önceliklendirme",
        paragraphs: [
          "Her KAP açıklaması aynı ağırlıkta değildir. Finansal tablo duyuruları, yatırım kararları, kredi notu değişiklikleri, önemli dava sonuçları ve yönetim değişiklikleri genellikle yüksek etki potansiyeline sahiptir. Buna karşılık rutin idari bildirimler daha sınırlı etki yaratabilir. İlk adım, duyuruyu doğru kategoriye koymaktır.",
          "Önceliklendirme yaparken şu sorular işlevseldir: Şirketin nakit akışını etkiler mi? Borçluluğu artırır mı azaltır mı? Kârlılık marjını değiştirir mi? Tek seferlik mi, sürdürülebilir mi? Bu çerçeve yatırımcıyı başlık etkisinden çıkarır ve analitik okumaya geçirir.",
        ],
      },
      {
        heading: "Bildirimi finansal tablo ile eşleştirme",
        paragraphs: [
          "KAP metni tek başına yeterli değildir; finansal tablo ve faaliyet raporuyla birlikte okunmalıdır. Örneğin büyük tutarlı bir yatırım açıklaması varsa şirketin mevcut nakit pozisyonu, net borcu ve yatırım finansman modeli incelenmelidir. Duyuru olumlu görünebilir ama finansman maliyeti yüksekse kısa vadede bilanço baskısı yaratabilir.",
          "Benzer şekilde geri alım programı, temettü kararı veya yeni sözleşme duyurularında büyüklük analizi yapılmalıdır. Duyurulan tutarın şirket satışlarına, FAVÖK’üne veya özsermayesine oranı hesaplandığında etkinin gerçek boyutu daha net görülür. Yüzde olarak küçük kalan başlıklar fiyatı geçici etkileyebilir.",
        ],
      },
      {
        heading: "Zamanlama ve tekrar eden açıklamalar",
        paragraphs: [
          "KAP açıklamasının yayınlandığı saat ve dönem önemlidir. Seans sonrası gelen bildirimler ertesi gün açılışta fiyatlanabilir; çeyrek bilanço dönemlerinde gelen açıklamalar ise yoğun haber akışı içinde farklı tepki alabilir. Ayrıca bazı şirketler benzer içerikte birden fazla güncelleme paylaşır; yalnızca ilk duyuruya odaklanmak eksik kalır.",
          "Yatırımcı açısından iyi uygulama, şirket bazında bildirim günlüğü tutmaktır. Böylece önceki açıklamalarla çelişen veya ertelenen vaatler kolayca görülür. Tutarlılık, yönetim kalitesi ve kurumsal iletişim güvenilirliği hakkında güçlü bir sinyal üretir. Şirket duyurularını yalnızca yayımlandığı gün değil, sonraki dönem finansallarında karşılığı var mı diye de kontrol etmek gerekir. Örneğin kapasite artışı açıklayan bir şirketin satış hacmi, marjı veya yatırım harcaması beklenen hızda ilerlemiyorsa piyasa anlatısı ile bilanço gerçekliği ayrışıyor olabilir. Bu çapraz kontrol, haber bazlı acele kararları azaltır ve yatırımcının süreç odaklı kalmasına yardımcı olur.",
        ],
      },
      {
        heading: "KAP verisini karar sürecine entegre etme",
        paragraphs: [
          "KAP açıklamaları tek başına alım-satım sinyali değildir; değerleme modelindeki varsayımları güncellemek için veri sağlar. Örneğin yeni kapasite yatırımı açıklandığında gelir projeksiyonu, marj beklentisi ve borçluluk varsayımı yeniden ele alınabilir. Bu tür güncellemeler yapılmadan verilen kararlar çoğunlukla sezgisel kalır.",
          "Pratikte en sağlıklı yöntem, KAP sonrası hızlı not almak ve 24 saat içinde ikinci değerlendirme yapmaktır. İlk tepki döneminde piyasa çoğu zaman aşırı hareket edebilir. Soğukkanlı ikinci okuma, başlık etkisini filtreleyip daha tutarlı karar almayı kolaylaştırır.",
        ],
      },
    ],
    exampleTitle: "KAP etki analizi örnek tablosu (TL)",
    example: {
      columns: ["Bildirim", "Tutar", "Şirket Yıllık Satışı", "Oran", "İlk Yorum"],
      rows: [
        ["Yeni yatırım tesisi", "2.400.000.000", "36.000.000.000", "%6,7", "Orta vadede büyüme potansiyeli, kısa vadede finansman baskısı izlenmeli"],
        ["Geri alım programı", "750.000.000", "36.000.000.000", "%2,1", "Likidite desteği; sürdürülebilirlik için nakit akışı kontrolü"],
        ["Dava karşılığı artışı", "420.000.000", "36.000.000.000", "%1,2", "Kâr marjı etkisi ve nakit çıkışı takibi gerekli"],
      ],
      note: "Oran analizi, bildirimin büyüklüğünü bağlama oturtmak için kullanılır. Rakamlar eğitim amaçlıdır.",
    },
    summary: "KAP okumada amaç, başlığı değil etkisini analiz etmektir. Bildirimi finansal tablo, zamanlama ve şirketin geçmiş iletişim tutarlılığıyla birlikte değerlendirmek daha kaliteli karar sağlar. Sistematik okuma disiplini, haber kaynaklı hataları azaltır.",
  },
  {
    slug: "altin-ve-gumus-yatiriminda-ons-gram-ve-makas-mantigi",
    title: "Altın ve Gümüş Yatırımında Ons, Gram ve Makas Aralığı Mantığı",
    description: "Ons-altın fiyat ilişkisini, gram fiyat oluşumunu ve alış-satış makasının toplam getiriye etkisini uygulamalı olarak öğrenin.",
    category: "Emtia okuryazarlığı",
    readingTime: "9 dakika",
    intro: "Altın ve gümüş yatırımı Türkiye’de en yaygın yatırım tercihlerinden biridir. Ancak yatırımcıların önemli bir kısmı ons, gram, kur ve makas ilişkisinin tamamını birlikte okumadan işlem yapar. Sonuç olarak fiyat doğru yönde gitse bile beklenen kazanç elde edilemeyebilir. Özellikle bankalar ve fiziksel piyasa arasındaki alış-satış farkı (makas), kısa vadeli işlemlerde getiriyi ciddi biçimde törpüler. Bu rehberde altın ve gümüş fiyatının hangi bileşenlerden oluştuğunu, gram fiyatın nasıl türetildiğini ve makas maliyetinin yatırım stratejisine nasıl yedirilmesi gerektiğini sade bir çerçevede anlatıyoruz.",
    sections: [
      {
        heading: "Ons nedir, gram fiyatla ilişkisi nasıldır?",
        paragraphs: [
          "Uluslararası piyasalarda altın ve gümüş fiyatları çoğunlukla ons başına ABD doları cinsinden kote edilir. Türkiye’de yatırımcı ise gram bazlı ve TL cinsinden fiyat takip eder. Bu nedenle gram fiyatın temel belirleyicileri iki ana değişkendir: ons fiyatı ve USD/TRY kuru. Basitleştirilmiş yaklaşımla gram altın fiyatı, ons altın × dolar kuru / 31,1035 formülüyle yaklaşık hesaplanabilir.",
          "Bu yapı nedeniyle ons yatay kalsa bile kur yükselişi gram fiyatı artırabilir; kur sabitken ons düşerse gram da gerileyebilir. Yatırımcı yalnızca tek değişkeni izlerse fiyat hareketinin nedenini yanlış yorumlayabilir. Sağlıklı analiz için ons ve kuru aynı anda takip etmek gerekir.",
        ],
      },
      {
        heading: "Makas aralığı neden kritik?",
        paragraphs: [
          "Makas, alış ve satış fiyatı arasındaki farktır. Varlığı alırken alış fiyatından, satarken satış fiyatından işlem yaptığınız için bu fark doğrudan maliyet anlamına gelir. Kısa vadede sık işlem yapan yatırımcılar için makas maliyeti getirinin önemli bölümünü silebilir. Özellikle volatil dönemlerde makas açılabilir ve öngörülenden yüksek işlem maliyeti oluşabilir.",
          "Yatırım planı oluştururken sadece fiyat hedefi değil, makası da hesaplamaya katmak gerekir. Örneğin %3 yükseliş beklenen bir işlemde makas toplamda %1,2 ise net beklenen kazanç ciddi şekilde düşer. Bu nedenle işlem frekansı ve kanal seçimi (fiziksel, banka, platform) maliyet optimizasyonu açısından belirleyicidir. Kısa vadeli al-sat düşünülüyorsa girişte ve çıkışta oluşacak toplam makas maliyeti peşinen bir eşik olarak not edilmelidir. Net hedef bu eşiğin anlamlı biçimde üzerinde değilse işlem, yön doğru olsa dahi tatmin edici sonuç üretmeyebilir. Bu basit kural, gereksiz işlem sayısını düşürerek performansı iyileştirebilir.",
        ],
      },
      {
        heading: "Altın ve gümüşte risk yönetimi",
        paragraphs: [
          "Emtia yatırımları enflasyon ve jeopolitik belirsizlik dönemlerinde portföye denge unsuru sağlayabilir; ancak tek yönlü güvenli liman varsayımı risklidir. Ons fiyatı faiz beklentileri, merkez bankası politikaları ve küresel büyüme görünümüne duyarlıdır. Gümüşte ise endüstriyel talep payı daha yüksek olduğu için dalgalanma altına göre daha sert olabilir.",
          "Bu nedenle altın/gümüş pozisyonlarını toplam portföyün risk bütçesine göre sınırlamak önemlidir. Tek bir noktadan yüklü alım yapmak yerine kademeli alım stratejisi maliyet ortalaması sağlayabilir. Ayrıca yatırımcının likidite ihtiyacı ve vade süresi, varlık türü seçimini doğrudan etkilemelidir.",
        ],
      },
      {
        heading: "Pratik takip çerçevesi",
        paragraphs: [
          "Günlük takipte dört gösterge yeterli bir çerçeve sunar: ons fiyatı, USD/TRY, yerel gram fiyat ve makas oranı. Bu göstergeleri birlikte izlemek, fiyat hareketinin kaynağını ayırmanıza yardımcı olur. Örneğin gram yükselirken ons düşüyorsa hareketin ana sürükleyicisi kur olabilir.",
          "Ayrıca giriş-çıkış kararları için hedef fiyat kadar hedef süre de belirlenmelidir. Vade belirsizliği, yatırımcının dalgalanmalarda plansız karar vermesine yol açar. Yazılı plan, duygusal işlemleri azaltır ve maliyet kontrolünü güçlendirir.",
        ],
      },
    ],
    exampleTitle: "Gram altın fiyat oluşumu örnek tablosu",
    example: {
      columns: ["Ons Altın ($)", "USD/TRY", "Teorik Gram (TL)", "Alış (TL)", "Satış (TL)"],
      rows: [
        ["2.350", "39,20", "2.960", "2.990", "2.945"],
        ["2.410", "39,35", "3.048", "3.075", "3.025"],
        ["2.290", "39,10", "2.881", "2.905", "2.860"],
      ],
      note: "Teorik gram yaklaşık hesaplamadır. İşlem fiyatları kurum bazlı makas içerir ve farklılık gösterebilir.",
    },
    summary: "Altın ve gümüş yatırımında kazancı belirleyen yalnızca fiyat yönü değildir; ons, kur ve makas birlikte değerlendirilmelidir. Maliyet farkındalığı ve vade disiplini, emtia yatırımlarında toplam sonucu belirgin biçimde iyileştirir. Her zaman net getiri bakışı korunmalıdır.",
  },
  {
    slug: "bilanco-okuma-rehberi-donen-varlik-ozsermaye-net-borc",
    title: "Bilanço Okuma Rehberi: Dönen Varlıklar, Özsermaye ve Net Borç Nedir?",
    description: "Bilançonun en kritik kalemlerini sade dille okuyun; likidite, borçluluk ve özkaynak kalitesi üzerinden şirket sağlığını analiz edin.",
    category: "Finansal tablo analizi",
    readingTime: "10 dakika",
    intro: "Bir hisse senedinin uzun vadeli performansını anlamak için bilanço okumayı bilmek büyük avantaj sağlar. Gelir tablosu şirketin belirli dönemde ne kadar kazandığını gösterirken bilanço o dönemin sonunda şirketin varlık ve yükümlülük fotoğrafını verir. Yatırımcı açısından kritik soru şudur: Şirket kazanç üretirken aynı zamanda finansal dayanıklılığını koruyor mu? Bu sorunun cevabı çoğunlukla dönen varlıklar, kısa vadeli borçlar, özsermaye ve net borç kalemlerinde gizlidir. Bilanço dilini sadeleştirmek, yatırım kararını sadece hikâyeden değil veriden beslemeyi sağlar. Bu rehberde temel kalemlerin anlamını, birbirleriyle ilişkisini ve pratik analiz yöntemini adım adım ele alıyoruz.",
    sections: [
      {
        heading: "Dönen varlıklar neyi anlatır?",
        paragraphs: [
          "Dönen varlıklar, şirketin bir yıl içinde nakde çevirmesi veya tüketmesi beklenen varlıklardır. Nakit ve nakit benzerleri, ticari alacaklar ve stoklar bu grupta yer alır. Yüksek dönen varlık tek başına olumlu değildir; kalitenin de incelenmesi gerekir. Örneğin tahsilatı geciken alacaklar veya yavaş dönen stoklar bilanço üzerinde büyük görünse de likiditeye hızlı katkı vermeyebilir.",
          "Likidite analizinde cari oran (dönen varlıklar / kısa vadeli borçlar) ve asit-test oranı (nakit + kısa vadeli alacaklar / kısa vadeli borçlar) sık kullanılır. Bu oranlar sektör ortalamasıyla birlikte yorumlanmalıdır. Perakende ve üretim sektörlerinin işletme sermayesi dinamiği farklı olduğundan tek bir eşik değeri tüm şirketlere uygulamak doğru olmaz.",
        ],
      },
      {
        heading: "Özsermaye neden kritik bir göstergedir?",
        paragraphs: [
          "Özsermaye, şirket varlıklarından toplam borçlar çıkarıldığında kalan net değeri ifade eder. Güçlü özsermaye yapısı, şirketin şoklara karşı tampon kapasitesini artırabilir. Ancak özsermayenin kaynağına bakmak önemlidir: Düzenli kârlardan biriken özkaynak ile yeniden değerleme etkisiyle şişmiş özkaynak aynı kaliteyi sunmayabilir.",
          "Yatırımcılar özsermaye kârlılığını (ROE) izleyerek şirketin sermayesini ne kadar verimli kullandığını görebilir. Fakat çok yüksek ROE bazen aşırı borçla desteklenmiş olabilir. Bu yüzden ROE mutlaka borçluluk göstergeleriyle birlikte okunmalıdır. Sağlıklı analiz, tek bir orana dayanmak yerine oranların birbirini doğrulamasını bekler.",
        ],
      },
      {
        heading: "Net borç analizi nasıl yapılır?",
        paragraphs: [
          "Net borç, toplam finansal borçtan nakit ve nakit benzerlerinin çıkarılmasıyla bulunur. Şirketin borç yükünü gerçekçi görmek için kritik bir metriktir. Net borç/FAVÖK oranı, borcun faaliyet kârıyla geri ödeme kapasitesine dair hızlı bir fikir verir. Oranın yüksek olması her zaman kötü değildir; ancak faiz maliyeti ve vade yapısıyla birlikte değerlendirilmelidir.",
          "Borç kompozisyonu da önemli bir ayrıntıdır. Kısa vadeli ve değişken faizli borçların payı yüksekse faiz artış dönemlerinde risk büyüyebilir. Döviz cinsi borçlar, gelir yapısı aynı para biriminde değilse kur şoklarına duyarlılık yaratır. Bu nedenle net borç analizinde yalnızca tutara değil, borcun niteliğine odaklanmak gerekir.",
        ],
      },
      {
        heading: "Bilanço kalemlerini birlikte okuma yöntemi",
        paragraphs: [
          "En iyi sonuç, dönen varlıklar, özsermaye ve net borcun aynı tabloda birlikte değerlendirilmesiyle elde edilir. Örneğin cari oran güçlü ama net borç/FAVÖK aşırı yüksekse likidite kısa vadede iyi görünse de orta vadede finansman riski olabilir. Tersine net borç düşük ama alacak tahsil süresi uzuyorsa işletme sermayesi baskısı doğabilir.",
          "Yatırımcı için pratik bir yaklaşım, her çeyrek aynı üç soruyu sormaktır: Likidite korunuyor mu? Özsermaye kaliteli mi? Borç çevrilebilir mi? Bu sorulara düzenli verilen yanıtlar, şirketin finansal sağlığına ilişkin daha tutarlı bir resim sunar ve duygusal karar olasılığını azaltır.",
        ],
      },
    ],
    exampleTitle: "Bilanço kontrol tablosu örneği (TL)",
    example: {
      columns: ["Kalem", "2025", "2026", "Yorum"],
      rows: [
        ["Dönen Varlıklar", "18.400.000.000", "22.100.000.000", "Likidite kapasitesi artıyor"],
        ["Kısa Vadeli Borçlar", "11.200.000.000", "13.900.000.000", "Borç artışı likidite artışından hızlı"],
        ["Özsermaye", "14.500.000.000", "17.300.000.000", "Kâr kaynaklı güçlenme"],
        ["Net Borç", "7.800.000.000", "8.900.000.000", "Yönetilebilir artış, vade dağılımı izlenmeli"],
      ],
      note: "Rakamlar eğitim amaçlıdır. Gerçek analizde dipnotlar, vade yapısı ve döviz pozisyonu da incelenmelidir.",
    },
    summary: "Bilanço okuma, yatırım kararında fark yaratan temel beceridir. Dönen varlık, özsermaye ve net borç kalemleri birlikte ele alındığında şirketin dayanıklılığı daha net anlaşılır. Düzenli ve karşılaştırmalı analiz, kısa vadeli gürültüden korunmayı sağlar.",
  },
  {
    slug: "yatirimci-psikolojisi-fomo-ve-panik-satisindan-korunma",
    title: "Yatırımcı Psikolojisi: FOMO ve Panik Satışından Korunma Yolları",
    description: "Piyasa kararlarında duygusal hataları azaltmak için FOMO, sürü psikolojisi ve panik satış döngüsünü yönetme yöntemlerini öğrenin.",
    category: "Davranışsal finans",
    readingTime: "9 dakika",
    intro: "Yatırım performansını belirleyen tek unsur bilgi değildir; duygular ve davranış kalıpları çoğu zaman daha belirleyicidir. Aynı veriyi gören iki yatırımcıdan biri disiplinli kalırken diğeri panik veya aşırı özgüven nedeniyle büyük hata yapabilir. FOMO (fırsatı kaçırma korkusu) yükseliş dönemlerinde acele alımlara, panik satış ise düşüş dönemlerinde plansız çıkışlara yol açar. Her iki davranış da yatırımcının uzun vadeli hedefinden sapmasına neden olur. Davranışsal finansın temel katkısı, bu hataların kişisel zayıflık değil insan doğasının parçası olduğunu kabul edip sistem kurmayı öğretmesidir. Bu rehberde duygusal tetikleyicileri, korunma tekniklerini ve uygulanabilir bir yatırım disiplini modelini ele alıyoruz.",
    sections: [
      {
        heading: "FOMO nasıl ortaya çıkar?",
        paragraphs: [
          "FOMO, bir varlığın hızlı yükseldiği dönemlerde ‘geç kalıyorum’ düşüncesiyle plansız pozisyon açma dürtüsüdür. Sosyal medya akışı, çevre baskısı ve kısa sürede zenginleşme hikâyeleri bu dürtüyü güçlendirir. Yatırımcı çoğu zaman risk-getiri dengesini ölçmeden, yalnızca fiyat hareketine tepki vererek işlem yapar. Sonuçta giriş noktası pahalı kalabilir.",
          "FOMO’dan korunmanın ilk adımı, işlem öncesi kontrol listesi kullanmaktır. Neden alıyorum, hangi veriye dayanıyorum, hedef süre ne, stop kuralım ne sorularına yazılı cevap veremiyorsanız işlem ertelenmelidir. Kararı geciktirmek çoğu zaman fırsat kaçırmak değil, hata maliyetini azaltmaktır.",
        ],
      },
      {
        heading: "Panik satış döngüsü ve zarar kalıcılaşması",
        paragraphs: [
          "Panik satış genellikle hızlı düşüş dönemlerinde, kaybı durdurmaktan çok psikolojik rahatsızlıktan kaçınmak için yapılır. Plan dışı satış, geçici dalgalanmayı kalıcı zarara çevirebilir. Özellikle kaldıraç kullanılan işlemlerde bu davranış daha yıkıcıdır çünkü volatilite marj baskısı yaratır ve yatırımcıyı zorunlu kararlara iter.",
          "Panikten korunmanın temel yolu, işlem açmadan önce çıkış senaryosu tanımlamaktır. Teknik seviyeler, temel bozulma kriterleri ve maksimum portföy kaybı eşiği önceden belirlenirse düşüş anında karar yükü azalır. Plansız hareket yerine kurallı hareket, duygusal maliyeti düşürür.",
        ],
      },
      {
        heading: "Davranışsal hatalara karşı sistem kurma",
        paragraphs: [
          "Yatırım günlüğü tutmak, tekrarlanan hataları görünür kılan güçlü bir araçtır. Her işlem için giriş nedeni, hedef, risk limiti ve sonuç not edilirse birkaç ay içinde kişisel zayıf noktalar netleşir. Kimi yatırımcı kârı erken alır, kimi zararı taşır, kimi de fazla işlem yapar. Bu kalıpları görmek performans artışı için somut başlangıç noktası sağlar.",
          "Ayrıca portföy büyüklüğüne uygun pozisyon boyutu belirlemek duygusal dalgalanmayı azaltır. Aşırı büyük pozisyonlar, küçük fiyat hareketlerini bile psikolojik krize dönüştürebilir. Daha yönetilebilir büyüklükte pozisyonlar ise planın uygulanma ihtimalini artırır. Psikolojik dayanıklılık, teknik bilgi kadar stratejinin parçasıdır. Yatırımcılar için faydalı bir yöntem, her yeni pozisyonu toplam portföyün belirli bir yüzdesiyle sınırlamaktır. Böylece tek bir işlemde oluşacak zarar kontrol altında kalır ve ardışık hatalarda bile portföyün tamamı baskı altına girmez. Bu yaklaşım, özellikle FOMO dönemlerinde hızla büyüyen pozisyonların önüne geçer.",
        ],
      },
      {
        heading: "Uzun vadeli zihinsel çerçeve",
        paragraphs: [
          "Piyasa her gün yeni bir hikâye üretir; fakat yatırım başarısı çoğu zaman sık karar vermekle değil doğru kararları sürdürebilmekle gelir. Bu nedenle kısa vadeli gürültü ile uzun vadeli tez ayrıştırılmalıdır. Bir varlıkta yatırım tezi bozulmadıysa her düşüş satış sebebi değildir; bozulduysa da duygusal bağlılıkla pozisyon taşımak risklidir.",
          "Zihinsel çerçeveyi güçlendirmek için haftalık ekran süresi sınırı, plan dışı işlem yasağı ve aylık performans değerlendirme ritüeli gibi basit kurallar işe yarar. Amaç kusursuz olmak değil, hataları sistematik olarak küçültmektir. Disiplinli süreç, uzun vadede getirinin sürdürülebilirliğini artırır.",
        ],
      },
    ],
    exampleTitle: "Davranışsal karar etkisi örnek tablosu (TL)",
    example: {
      columns: ["Senaryo", "Giriş", "Çıkış", "Karar Nedeni", "Sonuç"],
      rows: [
        ["FOMO alımı", "120.000", "108.000", "Hızlı yükselişi kaçırmama", "-12.000"],
        ["Planlı alım", "120.000", "132.000", "Önceden tanımlı seviye ve vade", "+12.000"],
        ["Panik satış", "150.000", "126.000", "Kısa vadeli sert düşüş korkusu", "-24.000"],
      ],
      note: "Aynı piyasa koşulunda karar kalitesi sonuçları ciddi biçimde değiştirebilir. Rakamlar eğitim amaçlıdır.",
    },
    summary: "Yatırım performansında psikoloji en az analiz kadar etkilidir. FOMO ve panik satış, plansız kararlarla zararı büyütebilir; yazılı kural seti ise duygusal hataları azaltır. Kalıcı başarı, doğru sistem ve istikrarlı davranışla mümkündür.",
  },


];

export const guideArticles: GuideArticle[] = definitions.map((definition) => ({
  slug: definition.slug,
  title: definition.title,
  description: definition.description,
  category: definition.category,
  readingTime: definition.readingTime,
  content: renderArticle(definition),
}));
