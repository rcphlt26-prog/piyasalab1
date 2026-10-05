-- Günlük katılım hakkı (admin sınırsız) ve istemci tarafından bakiye manipülasyonunun kapatılması.
alter table public.game_portfolios drop constraint if exists game_portfolios_user_id_key;
alter table public.game_portfolios add column if not exists entry_day date not null default ((now() at time zone 'Europe/Istanbul')::date);
alter table public.game_portfolios add column if not exists is_admin_entry boolean not null default false;
create unique index if not exists game_portfolios_user_day_idx on public.game_portfolios(user_id, entry_day) where not is_admin_entry;
create index if not exists game_portfolios_user_started_idx on public.game_portfolios(user_id, started_at desc);
alter table public.game_portfolios drop constraint if exists game_portfolios_cash_check;
alter table public.game_portfolios add constraint game_portfolios_cash_check check (cash_balance >= 0 and cash_balance <= 100000 * 100);

-- Yazma işlemleri yalnızca sunucudan (service role) yapılır; kullanıcı kendi bakiyesini değiştiremez.
drop policy if exists game_portfolios_owner on public.game_portfolios;
drop policy if exists game_orders_owner on public.game_orders;
drop policy if exists game_orders_owner_select on public.game_orders;
create policy game_orders_owner_select on public.game_orders for select to authenticated
  using (exists (select 1 from public.game_portfolios p where p.id = portfolio_id and p.user_id = public.current_app_user_id()));
