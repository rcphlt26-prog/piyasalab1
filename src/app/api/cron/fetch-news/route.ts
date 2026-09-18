import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const RSS_URL = 'https://news.google.com/rss/search?q=ekonomi&hl=tr&gl=TR&ceid=TR:tr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil.');
  }
  return createClient(supabaseUrl, supabaseKey);
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function categoryFor(title: string) {
  const text = title.toLocaleLowerCase('tr-TR');
  if (/borsa|bist|hisse|endeks|şirket/.test(text)) return 'BIST';
  if (/dolar|euro|kur|sterlin|faiz|merkez bankası/.test(text)) return 'Döviz';
  if (/altın|gümüş|petrol|emtia/.test(text)) return 'Emtia';
  return 'Ekonomi';
}

export async function GET() {
  try {
    const response = await fetch(RSS_URL, {
      cache: 'no-store',
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
        'User-Agent': 'VeriAkisNewsBot/1.0 (+https://veriakis.com)',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      throw new Error(`Google News RSS HTTP ${response.status}`);
    }

    const feed = await new Parser().parseString(await response.text());
    const supabase = supabaseUrl && supabaseKey ? getSupabase() : null;
    let addedCount = 0;
    const items = [];

    for (const item of feed.items.slice(0, 10)) {
      if (!item.title || !item.link) continue;

      const slug = `${slugify(item.title)}-${Buffer.from(item.link).toString('base64url').slice(-8)}`;
      const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();
      const newsItem = {
        slug,
        title: item.title,
        summary: 'Başlık ve güncel içerik için yayıncının sayfasını ziyaret edin.',
        category: categoryFor(item.title),
        source: item.source?.trim() || 'Yayıncı bağlantısı',
        date: publishedAt,
        url: item.link,
        relatedTickers: [],
      };
      items.push(newsItem);

      if (!supabase) continue;

      const { data: existing } = await supabase
        .from('news')
        .select('id')
        .eq('url', item.link)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from('news').insert([
          {
            slug: newsItem.slug,
            title: newsItem.title,
            summary: newsItem.summary,
            category: newsItem.category,
            source: newsItem.source,
            news_date: new Date(newsItem.date).toISOString().slice(0, 10),
            url: newsItem.url,
            related_tickers: [],
          },
        ]);

        if (!error) addedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${items.length} Google News haberi alındı, ${addedCount} yeni kayıt eklendi.`,
      items,
    });

  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : '';
    const message = rawMessage.includes('Feed not recognized')
      ? 'Google News RSS geçerli bir RSS yanıtı döndürmedi.'
      : rawMessage || 'Haber akışı alınamadı.';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}