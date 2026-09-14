-- Piyasalab Supabase şeması
-- Bu SQL dosyasını Supabase SQL Editor içinde bir kez çalıştırın.

create extension if not exists pgcrypto;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  nickname text not null,
  portfolio_band text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  choice text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sentiment_votes (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  side text not null,
  weight numeric not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists comments_ticker_created_at_idx on public.comments(ticker, created_at desc);
create index if not exists sentiment_votes_ticker_created_at_idx on public.sentiment_votes(ticker, created_at desc);
create index if not exists comment_reactions_comment_id_created_at_idx on public.comment_reactions(comment_id, created_at desc);
create index if not exists poll_votes_poll_id_created_at_idx on public.poll_votes(poll_id, created_at desc);

alter table public.comments enable row level security;
alter table public.comment_reactions enable row level security;
alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
alter table public.sentiment_votes enable row level security;

drop policy if exists comments_select_anon on public.comments;
create policy comments_select_anon on public.comments for select to anon using (true);
drop policy if exists comments_insert_anon on public.comments;
create policy comments_insert_anon on public.comments for insert to anon with check (true);

drop policy if exists comment_reactions_select_anon on public.comment_reactions;
create policy comment_reactions_select_anon on public.comment_reactions for select to anon using (true);
drop policy if exists comment_reactions_insert_anon on public.comment_reactions;
create policy comment_reactions_insert_anon on public.comment_reactions for insert to anon with check (true);

drop policy if exists polls_select_anon on public.polls;
create policy polls_select_anon on public.polls for select to anon using (true);
drop policy if exists polls_insert_anon on public.polls;
create policy polls_insert_anon on public.polls for insert to anon with check (true);

drop policy if exists poll_votes_select_anon on public.poll_votes;
create policy poll_votes_select_anon on public.poll_votes for select to anon using (true);
drop policy if exists poll_votes_insert_anon on public.poll_votes;
create policy poll_votes_insert_anon on public.poll_votes for insert to anon with check (true);

drop policy if exists sentiment_votes_select_anon on public.sentiment_votes;
create policy sentiment_votes_select_anon on public.sentiment_votes for select to anon using (true);
drop policy if exists sentiment_votes_insert_anon on public.sentiment_votes;
create policy sentiment_votes_insert_anon on public.sentiment_votes for insert to anon with check (true);

alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.comment_reactions;
alter publication supabase_realtime add table public.polls;
alter publication supabase_realtime add table public.poll_votes;
alter publication supabase_realtime add table public.sentiment_votes;

insert into public.polls (question, options, active)
select 'Bu hafta BİST 100 nasıl kapanır?',
       '["Güçlü yükseliş", "Hafif yükseliş", "Yatay", "Hafif düşüş", "Sert düşüş"]'::jsonb,
       true
where not exists (
  select 1 from public.polls where question = 'Bu hafta BİST 100 nasıl kapanır?'
);



-- =====================================================================
-- YENİ TABLOLAR: ipos, news, user_watchlists
-- (bu bölümü mevcut şemanın üzerine tekrar çalıştırmak güvenlidir)
-- =====================================================================

-- Halka arz (IPO) kayıtları — kod tarafındaki IpoItem tipiyle eşleşir
create table if not exists public.ipos (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  ticker text not null,
  sector text,
  price_min numeric,
  price_max numeric,
  ipo_date date,
  status text not null default 'Bekliyor',   -- 'Bekliyor' | 'Tamamlandı'
  lot_size integer not null default 1,
  created_at timestamptz not null default now()
);

-- Haber akışı — kod tarafındaki NewsItem tipiyle eşleşir
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  category text not null,                     -- 'Ekonomi' | 'BIST' | 'Döviz' | 'Emtia'
  source text,
  news_date date,
  breaking boolean not null default false,
  related_tickers text[] default '{}',
  created_at timestamptz not null default now()
);

-- Kullanıcı izleme listeleri — anonim tarayıcı client_id bazlı
create table if not exists public.user_watchlists (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,                    -- localStorage'da tutulan anonim uuid
  ticker text not null,
  created_at timestamptz not null default now(),
  unique (client_id, ticker)
);

create index if not exists ipos_ipo_date_idx on public.ipos(ipo_date desc);
create index if not exists news_news_date_idx on public.news(news_date desc);
create index if not exists user_watchlists_client_id_idx on public.user_watchlists(client_id);

alter table public.ipos enable row level security;
alter table public.news enable row level security;
alter table public.user_watchlists enable row level security;

-- ipos ve news: yalnızca okuma (veri Supabase panelinden eklenir)
drop policy if exists ipos_select_anon on public.ipos;
create policy ipos_select_anon on public.ipos for select to anon using (true);

drop policy if exists news_select_anon on public.news;
create policy news_select_anon on public.news for select to anon using (true);

-- user_watchlists: anon okuma + ekleme + silme (client_id bazlı, anon anahtarla)
drop policy if exists user_watchlists_select_anon on public.user_watchlists;
create policy user_watchlists_select_anon on public.user_watchlists for select to anon using (true);
drop policy if exists user_watchlists_insert_anon on public.user_watchlists;
create policy user_watchlists_insert_anon on public.user_watchlists for insert to anon with check (true);
drop policy if exists user_watchlists_delete_anon on public.user_watchlists;
create policy user_watchlists_delete_anon on public.user_watchlists for delete to anon using (true);

-- Realtime yayınına ekle (tablo zaten yayında olabilir; hata verirse yok sayın)
do $$
begin
  begin
    alter publication supabase_realtime add table public.ipos;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.news;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.user_watchlists;
  exception when duplicate_object then null;
  end;
end $$;

-- Örnek IPO kayıtları (test için) — yalnızca yoksa eklenir
insert into public.ipos (company, ticker, sector, price_min, price_max, ipo_date, status, lot_size)
select * from (values
  ('Anadolu Güneş Enerji', 'ANGES', 'Enerji', 18::numeric, 21::numeric, date '2026-09-22', 'Bekliyor', 1),
  ('Marmara Teknoloji', 'MRTEK', 'Bilişim', 32::numeric, 36::numeric, date '2026-09-18', 'Bekliyor', 1),
  ('Ege Gıda Sanayi', 'EGEGD', 'Gıda & İçecek', 12::numeric, 14::numeric, date '2026-09-15', 'Bekliyor', 1),
  ('Toros Lojistik', 'TRLOJ', 'Ulaştırma', 24::numeric, 27::numeric, date '2026-09-08', 'Tamamlandı', 1)
) as t(company, ticker, sector, price_min, price_max, ipo_date, status, lot_size)
where not exists (select 1 from public.ipos);

-- Örnek haber kayıtları (test için) — yalnızca yoksa eklenir
insert into public.news (slug, title, summary, category, source, news_date, breaking, related_tickers)
select * from (values
  ('tcmb-faiz-karari-piyasa', 'TCMB faiz kararı öncesi piyasalarda temkinli seyir', 'Merkez Bankası toplantısı öncesinde yatırımcılar pozisyonlarını sadeleştirdi.', 'Ekonomi', 'Piyasalab Ekonomi', date '2026-09-12', true, array[]::text[]),
  ('bist100-rekor-kapanis', 'BIST 100 haftayı rekor kapanışla tamamladı', 'Bankacılık ve holding hisselerindeki alımlarla endeks gün içi zirvesini yeniledi.', 'BIST', 'Borsa Gündem', date '2026-09-12', false, array['GARAN','AKBNK','KCHOL']),
  ('gram-altin-yeni-zirve', 'Gram altın ons ve kur etkisiyle yeni zirvede', 'Güvenli liman talebi ve kur etkisiyle gram altın tarihi yüksek seviyelere ulaştı.', 'Emtia', 'Emtia Bülteni', date '2026-09-11', true, array[]::text[])
) as t(slug, title, summary, category, source, news_date, breaking, related_tickers)
where not exists (select 1 from public.news);
