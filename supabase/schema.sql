-- VeriAkış Supabase şeması
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
drop policy if exists comments_insert_authenticated on public.comments;
create policy comments_insert_authenticated on public.comments for insert to authenticated with check (auth.uid() is not null);
drop policy if exists comments_select_authenticated on public.comments;
create policy comments_select_authenticated on public.comments for select to authenticated using (true);
alter table public.comments add column if not exists user_id uuid;
create or replace function public.set_comment_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author record;
begin
  select id, username into author from public.app_users where supabase_user_id = auth.uid();
  if author.id is null then
    raise exception 'Yorum yazmak için giriş yapmalısınız.';
  end if;
  new.user_id := author.id;
  new.nickname := author.username;
  return new;
end;
$$;
drop trigger if exists aa_set_comment_author on public.comments;
create trigger aa_set_comment_author before insert on public.comments for each row execute function public.set_comment_author();
drop policy if exists comments_delete_admin on public.comments;
create policy comments_delete_admin on public.comments for delete to authenticated using (exists (select 1 from public.app_users where supabase_user_id = auth.uid() and role = 'ADMIN'));

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

do $$
begin
  begin alter publication supabase_realtime add table public.comments; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.comment_reactions; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.polls; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.poll_votes; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.sentiment_votes; exception when duplicate_object then null; end;
end $$;

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

alter table public.ipos add column if not exists company text;
alter table public.ipos add column if not exists company_name text;
alter table public.ipos add column if not exists ticker text;
alter table public.ipos add column if not exists sector text;
alter table public.ipos add column if not exists price_min numeric;
alter table public.ipos add column if not exists price_max numeric;
alter table public.ipos add column if not exists price numeric;
alter table public.ipos add column if not exists date_range text;
alter table public.ipos add column if not exists lot integer;
alter table public.ipos add column if not exists lots integer;
alter table public.ipos add column if not exists ipo_date date;
alter table public.ipos add column if not exists status text default 'Bekliyor';
alter table public.ipos add column if not exists lot_size integer default 1;
alter table public.ipos add column if not exists created_at timestamptz default now();
update public.ipos set company_name = coalesce(company_name, company) where company_name is null;
update public.ipos set price = coalesce(price, price_min, price_max, 0) where price is null;
update public.ipos set date_range = coalesce(date_range, ipo_date::text, '') where date_range is null;
update public.ipos set lot = coalesce(lot, lot_size, 1) where lot is null;
update public.ipos set lots = coalesce(lots, lot_size, 1) where lots is null;

-- Haber akışı — kod tarafındaki NewsItem tipiyle eşleşir
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  category text not null,                     -- 'Ekonomi' | 'BIST' | 'Döviz' | 'Emtia'
  source text,
  news_date date,
  url text unique,
  breaking boolean not null default false,
  related_tickers text[] default '{}',
  created_at timestamptz not null default now()
);

alter table public.news add column if not exists url text;
alter table public.news add column if not exists slug text;
alter table public.news add column if not exists title text;
alter table public.news add column if not exists summary text;
alter table public.news add column if not exists category text;
alter table public.news add column if not exists source text;
alter table public.news add column if not exists news_date date;
alter table public.news add column if not exists breaking boolean default false;
alter table public.news add column if not exists related_tickers text[] default '{}';
alter table public.news add column if not exists related_symbols text[] not null default '{}';
alter table public.news add column if not exists created_at timestamptz default now();
update public.news set related_symbols = coalesce(related_tickers, '{}') where related_symbols = '{}';
create unique index if not exists news_url_unique_idx on public.news(url) where url is not null;
create index if not exists news_related_symbols_idx on public.news using gin(related_symbols);

-- Kullanıcı izleme listeleri — anonim tarayıcı client_id bazlı
create table if not exists public.user_watchlists (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,                    -- localStorage'da tutulan anonim uuid
  ticker text not null,
  created_at timestamptz not null default now(),
  unique (client_id, ticker)
);

alter table public.user_watchlists add column if not exists client_id text;
alter table public.user_watchlists add column if not exists ticker text;
alter table public.user_watchlists add column if not exists created_at timestamptz default now();

create index if not exists ipos_ipo_date_idx on public.ipos(ipo_date desc);
create index if not exists news_news_date_idx on public.news(news_date desc);
create unique index if not exists news_url_unique_idx on public.news(url) where url is not null;
create index if not exists user_watchlists_client_id_idx on public.user_watchlists(client_id);
create unique index if not exists user_watchlists_client_ticker_unique_idx on public.user_watchlists(client_id, ticker);

alter table public.ipos enable row level security;
alter table public.news enable row level security;
alter table public.user_watchlists enable row level security;

-- ipos ve news: yalnızca okuma (veri Supabase panelinden eklenir)
drop policy if exists ipos_select_anon on public.ipos;
create policy ipos_select_anon on public.ipos for select to anon using (true);

drop policy if exists news_select_anon on public.news;
create policy news_select_anon on public.news for select to anon using (true);
drop policy if exists news_insert_anon on public.news;
create policy news_insert_anon on public.news for insert to anon with check (true);

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
insert into public.ipos (company, company_name, ticker, sector, price, date_range, lot, lots, price_min, price_max, ipo_date, status, lot_size)
select * from (values
  ('Anadolu Güneş Enerji', 'Anadolu Güneş Enerji', 'ANGES', 'Enerji', 18::numeric, '2026-09-22', 1, 1, 18::numeric, 21::numeric, date '2026-09-22', 'Bekliyor', 1),
  ('Marmara Teknoloji', 'Marmara Teknoloji', 'MRTEK', 'Bilişim', 32::numeric, '2026-09-18', 1, 1, 32::numeric, 36::numeric, date '2026-09-18', 'Bekliyor', 1),
  ('Ege Gıda Sanayi', 'Ege Gıda Sanayi', 'EGEGD', 'Gıda & İçecek', 12::numeric, '2026-09-15', 1, 1, 12::numeric, 14::numeric, date '2026-09-15', 'Bekliyor', 1),
  ('Toros Lojistik', 'Toros Lojistik', 'TRLOJ', 'Ulaştırma', 24::numeric, '2026-09-08', 1, 1, 24::numeric, 27::numeric, date '2026-09-08', 'Tamamlandı', 1)
) as t(company, company_name, ticker, sector, price, date_range, lot, lots, price_min, price_max, ipo_date, status, lot_size)
where not exists (select 1 from public.ipos);

-- Örnek haber kayıtları (test için) — yalnızca yoksa eklenir
insert into public.news (slug, title, summary, category, source, news_date, breaking, related_symbols)
select * from (values
  ('tcmb-faiz-karari-piyasa', 'TCMB faiz kararı öncesi piyasalarda temkinli seyir', 'Merkez Bankası toplantısı öncesinde yatırımcılar pozisyonlarını sadeleştirdi.', 'Ekonomi', 'VeriAkış Ekonomi', date '2026-09-12', true, array[]::text[]),
  ('bist100-rekor-kapanis', 'BIST 100 haftayı rekor kapanışla tamamladı', 'Bankacılık ve holding hisselerindeki alımlarla endeks gün içi zirvesini yeniledi.', 'BIST', 'Borsa Gündem', date '2026-09-12', false, array['GARAN','AKBNK','KCHOL']),
  ('gram-altin-yeni-zirve', 'Gram altın ons ve kur etkisiyle yeni zirvede', 'Güvenli liman talebi ve kur etkisiyle gram altın tarihi yüksek seviyelere ulaştı.', 'Emtia', 'Emtia Bülteni', date '2026-09-11', true, array[]::text[])
) as t(slug, title, summary, category, source, news_date, breaking, related_symbols)
where not exists (select 1 from public.news);

-- =====================================================================
-- ÜYELİK, PORTFÖY VE FİYAT UYARILARI
-- Supabase Auth kullanıcılarıyla eşleşen, yalnızca sahibinin erişebildiği tablolar.
-- =====================================================================

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  supabase_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  username text not null unique,
  is_kvkk_accepted boolean not null default false,
  kvkk_accepted_at timestamptz,
  name text,
  avatar_url text,
  role text not null default 'USER' check (role in ('USER', 'PREMIUM', 'ADMIN')),
  created_at timestamptz not null default now()
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  name text not null default 'Ana Portföy',
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_transactions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  symbol text not null,
  asset_type text not null,
  buy_price double precision not null check (buy_price >= 0),
  quantity double precision not null check (quantity > 0),
  transaction_date timestamptz not null default now(),
  type text not null check (type in ('BUY', 'SELL'))
);

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  symbols text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  symbol text not null,
  target_value double precision not null,
  condition text not null check (condition in ('ABOVE', 'BELOW')),
  metric_type text not null check (metric_type in ('PRICE', 'DAILY_CHANGE', 'PE_RATIO', 'MA200')),
  is_triggered boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.price_alerts drop constraint if exists price_alerts_metric_type_check;
alter table public.price_alerts add constraint price_alerts_metric_type_check check (metric_type in ('PRICE', 'DAILY_CHANGE', 'PE_RATIO', 'MA200'));

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

alter table public.app_users add column if not exists username text;
alter table public.app_users add column if not exists is_kvkk_accepted boolean not null default false;
alter table public.app_users add column if not exists kvkk_accepted_at timestamptz;
update public.app_users set username = 'user_' || replace(substr(id::text, 1, 8), '-', '') where username is null or btrim(username) = '';
create unique index if not exists app_users_username_unique_idx on public.app_users(lower(username));
alter table public.app_users alter column username set not null;
alter table public.app_users drop constraint if exists app_users_username_format_check;
alter table public.app_users add constraint app_users_username_format_check check (username ~ '^[A-Za-z0-9_]{3,30}$');

create index if not exists portfolios_user_id_idx on public.portfolios(user_id);
create index if not exists portfolio_transactions_portfolio_date_idx on public.portfolio_transactions(portfolio_id, transaction_date desc);
create index if not exists watchlists_user_id_idx on public.watchlists(user_id);
create index if not exists price_alerts_user_triggered_idx on public.price_alerts(user_id, is_triggered);
create index if not exists forum_posts_user_created_idx on public.forum_posts(user_id, created_at desc);
create index if not exists forum_comments_user_created_idx on public.forum_comments(user_id, created_at desc);

alter table public.app_users enable row level security;
alter table public.portfolios enable row level security;
alter table public.portfolio_transactions enable row level security;
alter table public.watchlists enable row level security;
alter table public.price_alerts enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_comments enable row level security;

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.app_users where supabase_user_id = auth.uid();
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_users (supabase_user_id, email, username, is_kvkk_accepted, kvkk_accepted_at, name, avatar_url)
  values (
    new.id,
    coalesce(new.email, concat(new.id::text, '@unknown.local')),
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'username'), ''), 'user_' || replace(substr(new.id::text, 1, 8), '-', '')),
    coalesce((new.raw_user_meta_data ->> 'isKvkkAccepted')::boolean, false),
    case when coalesce((new.raw_user_meta_data ->> 'isKvkkAccepted')::boolean, false) then coalesce((new.raw_user_meta_data ->> 'kvkkAcceptedAt')::timestamptz, now()) else null end,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (supabase_user_id) do update set email = excluded.email;
  return new;
end;
$$;

create or replace function public.reject_blocked_content()
returns trigger
language plpgsql
as $$
declare
  content text := lower(coalesce(to_jsonb(new)->>'body', '') || ' ' || coalesce(to_jsonb(new)->>'nickname', ''));
  compact_content text := regexp_replace(content, '[^a-zçğıöşü0-9]', '', 'g');
  blocked_terms text[] := array['aq', 'amina', 'orospu', 'amk', 'sik', 'piç', 'mal', 'gerizekalı', 'salak', 'aptal', 'şerefsiz', 'haysiyetsiz', 'ibne', 'yavşak', 'pezevenk', 'kahpe', 'sürtük', 'bok', 'boktan', 'siktir', 'sikik', 'ananı', 'avradını', 'göt', 'götveren', 'dalyarak', 'it', 'eşek', 'lan', 'ulan'];
  term text;
begin
  foreach term in array blocked_terms loop
    if content ~ ('(^|[^a-zçğıöşü0-9])' || term || '([^a-zçğıöşü0-9]|$)') or compact_content ~ term then
      raise exception 'İçerik topluluk kurallarına aykırı argo içeriyor.' using errcode = 'check_violation';
    end if;
  end loop;
  return new;
end;
$$;

drop trigger if exists reject_comments_blocked_content on public.comments;
create trigger reject_comments_blocked_content before insert or update on public.comments for each row execute function public.reject_blocked_content();
drop trigger if exists reject_forum_posts_blocked_content on public.forum_posts;
create trigger reject_forum_posts_blocked_content before insert or update on public.forum_posts for each row execute function public.reject_blocked_content();
drop trigger if exists reject_forum_comments_blocked_content on public.forum_comments;
create trigger reject_forum_comments_blocked_content before insert or update on public.forum_comments for each row execute function public.reject_blocked_content();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

drop policy if exists app_users_self on public.app_users;
create policy app_users_self on public.app_users for select to authenticated using (supabase_user_id = auth.uid());
drop policy if exists app_users_update_self on public.app_users;
create policy app_users_update_self on public.app_users for update to authenticated using (supabase_user_id = auth.uid()) with check (supabase_user_id = auth.uid());

drop policy if exists portfolios_owner on public.portfolios;
create policy portfolios_owner on public.portfolios for all to authenticated using (user_id = public.current_app_user_id()) with check (user_id = public.current_app_user_id());
drop policy if exists portfolio_transactions_owner on public.portfolio_transactions;
create policy portfolio_transactions_owner on public.portfolio_transactions for all to authenticated using (exists (select 1 from public.portfolios p where p.id = portfolio_id and p.user_id = public.current_app_user_id())) with check (exists (select 1 from public.portfolios p where p.id = portfolio_id and p.user_id = public.current_app_user_id()));
drop policy if exists watchlists_owner on public.watchlists;
create policy watchlists_owner on public.watchlists for all to authenticated using (user_id = public.current_app_user_id()) with check (user_id = public.current_app_user_id());
drop policy if exists price_alerts_owner on public.price_alerts;
create policy price_alerts_owner on public.price_alerts for all to authenticated using (user_id = public.current_app_user_id()) with check (user_id = public.current_app_user_id());
drop policy if exists forum_posts_owner on public.forum_posts;
create policy forum_posts_owner on public.forum_posts for all to authenticated using (user_id = public.current_app_user_id()) with check (user_id = public.current_app_user_id());
drop policy if exists forum_comments_owner on public.forum_comments;
create policy forum_comments_owner on public.forum_comments for all to authenticated using (user_id = public.current_app_user_id()) with check (user_id = public.current_app_user_id());

-- =====================================================================
-- GERCEK KAP BILDIRIMLERI VE FINANSAL TABLOLAR
-- Bu tablolara yazma islemi server-side ingestion ile yapilmalidir.
-- =====================================================================

create table if not exists public.kap_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  kap_url text not null unique,
  symbols text[] not null default '{}',
  category text,
  publish_date timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists kap_notifications_publish_date_idx on public.kap_notifications(publish_date desc);
create index if not exists kap_notifications_symbols_idx on public.kap_notifications using gin(symbols);
alter table public.kap_notifications add column if not exists related_symbols text[] not null default '{}';
update public.kap_notifications set related_symbols = coalesce(symbols, '{}') where related_symbols = '{}';
create index if not exists kap_notifications_related_symbols_idx on public.kap_notifications using gin(related_symbols);

create table if not exists public.financial_statements (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  year integer not null,
  quarter integer not null check (quarter in (3, 6, 9, 12)),
  net_profit double precision not null,
  revenue double precision not null,
  ebitda double precision,
  total_debt double precision,
  pe_ratio double precision,
  pb_ratio double precision,
  updated_at timestamptz not null default now(),
  unique(symbol, year, quarter)
);

create index if not exists financial_statements_symbol_idx on public.financial_statements(symbol);
alter table public.kap_notifications enable row level security;
alter table public.financial_statements enable row level security;
drop policy if exists kap_notifications_select_public on public.kap_notifications;
create policy kap_notifications_select_public on public.kap_notifications for select to anon, authenticated using (true);
drop policy if exists financial_statements_select_public on public.financial_statements;
create policy financial_statements_select_public on public.financial_statements for select to anon, authenticated using (true);

-- =====================================================================
-- 100.000 TL SANAL PORTFOY OYUNU
-- =====================================================================

create table if not exists public.game_portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  display_name text not null default 'Anonim Oyuncu',
  initial_cash numeric not null default 100000,
  cash_balance numeric not null default 100000,
  current_value numeric not null default 100000,
  total_return_pct numeric not null default 0,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.game_portfolios add column if not exists status text not null default 'ACTIVE';
alter table public.game_portfolios add column if not exists removed_at timestamptz;
alter table public.game_portfolios drop constraint if exists game_portfolios_status_check;
alter table public.game_portfolios add constraint game_portfolios_status_check check (status in ('ACTIVE', 'REMOVED'));
alter table public.game_portfolios add column if not exists entry_day date not null default ((now() at time zone 'Europe/Istanbul')::date);
alter table public.game_portfolios add column if not exists is_admin_entry boolean not null default false;
create unique index if not exists game_portfolios_user_day_idx on public.game_portfolios(user_id, entry_day) where not is_admin_entry;
create index if not exists game_portfolios_user_started_idx on public.game_portfolios(user_id, started_at desc);
alter table public.game_portfolios drop constraint if exists game_portfolios_cash_check;
alter table public.game_portfolios add constraint game_portfolios_cash_check check (cash_balance >= 0 and cash_balance <= 100000 * 100);

create table if not exists public.game_orders (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.game_portfolios(id) on delete cascade,
  symbol text not null,
  side text not null check (side in ('BUY', 'SELL')),
  quantity numeric not null check (quantity > 0),
  execution_price numeric not null check (execution_price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists game_orders_portfolio_created_idx on public.game_orders(portfolio_id, created_at desc);
alter table public.game_portfolios enable row level security;
alter table public.game_orders enable row level security;
drop policy if exists game_portfolios_owner on public.game_portfolios;
drop policy if exists game_portfolios_owner_select on public.game_portfolios;
create policy game_portfolios_owner_select on public.game_portfolios for select to authenticated using (user_id = public.current_app_user_id());
drop policy if exists game_portfolios_leaderboard on public.game_portfolios;
create policy game_portfolios_leaderboard on public.game_portfolios for select to anon, authenticated using (status = 'ACTIVE');
drop policy if exists game_portfolios_admin on public.game_portfolios;
create policy game_portfolios_admin on public.game_portfolios for all to authenticated using (exists (select 1 from public.app_users where supabase_user_id = auth.uid() and role = 'ADMIN')) with check (exists (select 1 from public.app_users where supabase_user_id = auth.uid() and role = 'ADMIN'));
drop policy if exists game_orders_owner on public.game_orders;
drop policy if exists game_orders_owner_select on public.game_orders;
create policy game_orders_owner_select on public.game_orders for select to authenticated using (exists (select 1 from public.game_portfolios p where p.id = portfolio_id and p.user_id = public.current_app_user_id()));

do $$
begin
  begin alter publication supabase_realtime add table public.game_portfolios; exception when duplicate_object then null; end;
end $$;
