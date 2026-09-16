import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const parser = new Parser();

// Güvenli ve telifsiz akış için RSS kaynağı
const RSS_URL = 'https://finance.yahoo.com/news/rssindex'; 

export async function GET() {
  try {
    const feed = await parser.parseURL(RSS_URL);
    let addedCount = 0;

    for (const item of feed.items.slice(0, 5)) {
      if (!item.title || !item.link) continue;

      // Aynı haber veritabanında var mı kontrol et ( mükerrer eklenmesin )
      const { data: existing } = await supabase
        .from('news')
        .select('id')
        .eq('url', item.link)
        .single();

      if (!existing) {
        const { error } = await supabase.from('news').insert([
          {
            title: item.title,
            content: item.contentSnippet || item.title,
            url: item.link, // Orijinal kaynak linki (Yasal yönlendirme için şart)
            ticker: 'GENEL',
            created_at: new Date().toISOString(),
          },
        ]);

        if (!error) addedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${addedCount} yasal ve yönlendirmeli haber başarıyla eklendi.` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}