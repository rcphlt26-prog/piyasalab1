-- Sanal portföy oyunu: yarışmacı durumu (admin çıkarma), tek katılım hakkı ve taslak işlemleri.
alter table public.game_portfolios add column if not exists status text not null default 'ACTIVE';
alter table public.game_portfolios add column if not exists removed_at timestamptz;
alter table public.game_portfolios drop constraint if exists game_portfolios_status_check;
alter table public.game_portfolios add constraint game_portfolios_status_check check (status in ('ACTIVE', 'REMOVED'));
create index if not exists game_portfolios_status_started_idx on public.game_portfolios(status, started_at desc);

-- Çıkarılan yarışmacı kendi satırını değiştiremez; user_id unique olduğu için yeniden katılım da yapılamaz.
drop policy if exists game_portfolios_owner on public.game_portfolios;
create policy game_portfolios_owner on public.game_portfolios for all to authenticated
  using (user_id = public.current_app_user_id() and status = 'ACTIVE')
  with check (user_id = public.current_app_user_id() and status = 'ACTIVE');

drop policy if exists game_portfolios_owner_select on public.game_portfolios;
create policy game_portfolios_owner_select on public.game_portfolios for select to authenticated
  using (user_id = public.current_app_user_id());

-- Liderlik tablosu yalnızca aktif yarışmacıları gösterir.
drop policy if exists game_portfolios_leaderboard on public.game_portfolios;
create policy game_portfolios_leaderboard on public.game_portfolios for select to anon, authenticated using (status = 'ACTIVE');

-- Yöneticiler yarışmacıları görebilir ve çıkarabilir.
drop policy if exists game_portfolios_admin on public.game_portfolios;
create policy game_portfolios_admin on public.game_portfolios for all to authenticated
  using (exists (select 1 from public.app_users where supabase_user_id = auth.uid() and role = 'ADMIN'))
  with check (exists (select 1 from public.app_users where supabase_user_id = auth.uid() and role = 'ADMIN'));
