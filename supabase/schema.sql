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
