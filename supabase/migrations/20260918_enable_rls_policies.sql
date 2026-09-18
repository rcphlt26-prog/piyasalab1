-- VeriAkış authenticated data RLS migration
--
-- Prisma model adlarının Supabase karşılıkları:
-- User                 -> app_users
-- Portfolio            -> portfolios
-- PortfolioTransaction -> portfolio_transactions
-- Watchlist            -> watchlists
-- PriceAlert           -> price_alerts
--
-- This migration is safe to re-run.

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.app_users
  where supabase_user_id = auth.uid()
  limit 1;
$$;

alter table public.app_users enable row level security;
alter table public.portfolios enable row level security;
alter table public.portfolio_transactions enable row level security;
alter table public.watchlists enable row level security;
alter table public.price_alerts enable row level security;

-- app_users: a user can only access their own profile row.
drop policy if exists app_users_select_self on public.app_users;
create policy app_users_select_self
  on public.app_users for select to authenticated
  using (supabase_user_id = auth.uid());

drop policy if exists app_users_insert_self on public.app_users;
create policy app_users_insert_self
  on public.app_users for insert to authenticated
  with check (supabase_user_id = auth.uid());

drop policy if exists app_users_update_self on public.app_users;
create policy app_users_update_self
  on public.app_users for update to authenticated
  using (supabase_user_id = auth.uid())
  with check (supabase_user_id = auth.uid());

drop policy if exists app_users_delete_self on public.app_users;
create policy app_users_delete_self
  on public.app_users for delete to authenticated
  using (supabase_user_id = auth.uid());

-- portfolios: ownership is resolved through app_users.id.
drop policy if exists portfolios_select_owner on public.portfolios;
create policy portfolios_select_owner
  on public.portfolios for select to authenticated
  using (user_id = public.current_app_user_id());

drop policy if exists portfolios_insert_owner on public.portfolios;
create policy portfolios_insert_owner
  on public.portfolios for insert to authenticated
  with check (user_id = public.current_app_user_id());

drop policy if exists portfolios_update_owner on public.portfolios;
create policy portfolios_update_owner
  on public.portfolios for update to authenticated
  using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

drop policy if exists portfolios_delete_owner on public.portfolios;
create policy portfolios_delete_owner
  on public.portfolios for delete to authenticated
  using (user_id = public.current_app_user_id());

-- portfolio_transactions: ownership is inherited from the parent portfolio.
drop policy if exists portfolio_transactions_select_owner on public.portfolio_transactions;
create policy portfolio_transactions_select_owner
  on public.portfolio_transactions for select to authenticated
  using (exists (
    select 1 from public.portfolios p
    where p.id = portfolio_id
      and p.user_id = public.current_app_user_id()
  ));

drop policy if exists portfolio_transactions_insert_owner on public.portfolio_transactions;
create policy portfolio_transactions_insert_owner
  on public.portfolio_transactions for insert to authenticated
  with check (exists (
    select 1 from public.portfolios p
    where p.id = portfolio_id
      and p.user_id = public.current_app_user_id()
  ));

drop policy if exists portfolio_transactions_update_owner on public.portfolio_transactions;
create policy portfolio_transactions_update_owner
  on public.portfolio_transactions for update to authenticated
  using (exists (
    select 1 from public.portfolios p
    where p.id = portfolio_id
      and p.user_id = public.current_app_user_id()
  ))
  with check (exists (
    select 1 from public.portfolios p
    where p.id = portfolio_id
      and p.user_id = public.current_app_user_id()
  ));

drop policy if exists portfolio_transactions_delete_owner on public.portfolio_transactions;
create policy portfolio_transactions_delete_owner
  on public.portfolio_transactions for delete to authenticated
  using (exists (
    select 1 from public.portfolios p
    where p.id = portfolio_id
      and p.user_id = public.current_app_user_id()
  ));

-- watchlists: each row belongs to one app user.
drop policy if exists watchlists_select_owner on public.watchlists;
create policy watchlists_select_owner
  on public.watchlists for select to authenticated
  using (user_id = public.current_app_user_id());

drop policy if exists watchlists_insert_owner on public.watchlists;
create policy watchlists_insert_owner
  on public.watchlists for insert to authenticated
  with check (user_id = public.current_app_user_id());

drop policy if exists watchlists_update_owner on public.watchlists;
create policy watchlists_update_owner
  on public.watchlists for update to authenticated
  using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

drop policy if exists watchlists_delete_owner on public.watchlists;
create policy watchlists_delete_owner
  on public.watchlists for delete to authenticated
  using (user_id = public.current_app_user_id());

-- price_alerts: each row belongs to one app user.
drop policy if exists price_alerts_select_owner on public.price_alerts;
create policy price_alerts_select_owner
  on public.price_alerts for select to authenticated
  using (user_id = public.current_app_user_id());

drop policy if exists price_alerts_insert_owner on public.price_alerts;
create policy price_alerts_insert_owner
  on public.price_alerts for insert to authenticated
  with check (user_id = public.current_app_user_id());

drop policy if exists price_alerts_update_owner on public.price_alerts;
create policy price_alerts_update_owner
  on public.price_alerts for update to authenticated
  using (user_id = public.current_app_user_id())
  with check (user_id = public.current_app_user_id());

drop policy if exists price_alerts_delete_owner on public.price_alerts;
create policy price_alerts_delete_owner
  on public.price_alerts for delete to authenticated
  using (user_id = public.current_app_user_id());

-- The browser and server clients already use @supabase/ssr and carry the
-- authenticated Supabase session cookies. No service-role key is used here.
