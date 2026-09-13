# Piyasalab

Piyasalab, **Borsa İstanbul odaklı canlı piyasa akışı**, **enflasyon ve reel getiri hesaplayıcıları**, **topluluk forumu/sentiment**, **hisse karnesi**, **nostalji simülatörü** ve **viral mini-oyunlar** içeren tek sayfa (SPA hissi veren) bir Next.js finans platformudur.

> ⚠️ Bu uygulamadaki tüm veriler ve çıktılar bilgilendirme amaçlıdır. **Yatırım tavsiyesi değildir.**

---

## Teknoloji Yığını

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- `lucide-react` (ikonlar)
- `@supabase/supabase-js` (Realtime forum, anket ve sentiment)
- `recharts` (istemci tarafı grafikler)
- TradingView embed widget’ları
- `html-to-image` (paylaşım kartı üretimi)

---

## Özellik Özeti

- Saniyelik canlı akış (BIST, hisse, döviz, altın) + demo fallback
- Supabase realtime forum + emoji reaksiyon + topluluk anketleri
- Boğa/Ayı sentiment ve hype endeksi
- Hisse karnesi (temsili veri), radar + bar skorlar
- Patron/insider takibi (temsili veri)
- Gelişmiş getiri hesaplayıcı (DRIP + ABD TÜFE reel USD toggle)
- Alım gücü / nostalji simülatörü
- Halka arz & tavan serisi hesaplayıcı
- Mini oyunlar (Tarot, Pişmanlık Ölçeri, Hisse Düellosu, Risk Quiz)
- PNG paylaşım kartı üretici (1080x1080 ve 1200x630)
- SEO metadata + JSON-LD + robots + sitemap
- AdSense placeholder alanları

---

## Yerel Kurulum

### 1) Bağımlılıkları yükleyin

```bash
npm install
```

### 2) Ortam değişkenlerini tanımlayın

Proje kökünde `.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wjpptnqotjpxccpoiifo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...sizin_anahtariniz...
```

> Güvenlik için gerçek anahtarları repoya commit etmeyin.

### 3) Geliştirme sunucusunu başlatın

```bash
npm run dev
```

### 4) Production derleme testi

```bash
npm run build
npm run start
```

---

## Supabase Kurulum Adımları (Zorunlu)

Realtime forum/anket/sentiment için aşağıdaki SQL dosyasını **Supabase SQL Editor** içinde bir kez çalıştırın:

- `supabase/schema.sql`

Bu dosya şunları yapar:

1. Gerekli tabloları oluşturur:
   - `comments`
   - `comment_reactions`
   - `polls`
   - `poll_votes`
   - `sentiment_votes`
2. RLS (Row Level Security) açar.
3. `anon` rolüne yalnızca `SELECT` ve `INSERT` izni veren policy’leri ekler.
4. İndeksleri oluşturur.
5. Tabloları `supabase_realtime` publication’a ekler.
6. Haftalık anket için seed kayıt ekler.

> Bu SQL çalıştırılmadan uygulama yine açılır; ilgili modüller otomatik olarak **Demo mod**a düşer.

---

## Vercel’e Yayınlama (Kendi Hesabınızda)

1. Projeyi GitHub’a gönderin.
2. Vercel’de **New Project → Import Repository** ile içe alın.
3. **Project Settings → Environment Variables** bölümüne şunları ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy edin.

Uygulama Vercel’de olduğu gibi çalışır; server tarafında sadece ince quote proxy route’u bulunur (`/api/quotes`).

---

## AdSense Entegrasyonu

Bu projede 3 adet güvenli placeholder alan vardır:

- Üst leaderboard: 728x90
- Hesaplayıcı altında inline: 300x250
- Sağ kolon banner: 300x250

### Yayına alma adımı

1. Vercel (veya local) env’e ekleyin:

```env
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXX
```

2. `src/components/AdSlot.tsx` içindeki `data-ad-slot` alanlarını gerçek slot ID’leriniz ile eşleştirin.
3. Gerekirse slot yapısına `ins.adsbygoogle` etiketlerini ekleyin.

---

## Veri Kaynakları ve Yaklaşık Veri Notu

Bu projedeki tarihsel seriler, eğitim/karşılaştırma amaçlıdır ve bazı yıllarda yaklaşıklaştırılmıştır.

Kullanılan kaynak türleri:

- TÜİK enflasyon/TÜFE yayınları
- TCMB/EVDS döviz kuru zaman serileri
- Borsa İstanbul / Investing / TradingEconomics tarihsel endeks referansları
- BLS CPI-U (ABD TÜFE) tarihsel veri
- Kamuya açık arşiv-haber kaynaklarından asgari ücret, altın ve ürün fiyatları

Önemli not:

- Bazı uzun dönem değerler noktasal olarak kesin resmi veriyle birebir olmayabilir.
- Uygulama bunları **yaklaşık-temsili** bir modelde sunar.
- Finansal kararlar için resmi kaynaklardan doğrulama yapın.

---

## Hukuki Uyarı

Bu uygulamadaki hiçbir içerik yatırım danışmanlığı kapsamında değildir. Buradaki araçlar; eğitim, simülasyon ve genel bilgilendirme amaçlıdır.

**Yatırım tavsiyesi değildir.**
