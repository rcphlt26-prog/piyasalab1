-- Forum: yalnızca giriş yapanlar yazabilir; yazar adı hesabın kullanıcı adıdır ve istemci tarafından değiştirilemez.
alter table public.comments add column if not exists user_id uuid references public.app_users(id) on delete set null;

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

drop policy if exists comments_insert_anon on public.comments;
drop policy if exists comments_insert_authenticated on public.comments;
create policy comments_insert_authenticated on public.comments for insert to authenticated with check (auth.uid() is not null);

drop policy if exists comments_select_authenticated on public.comments;
create policy comments_select_authenticated on public.comments for select to authenticated using (true);
