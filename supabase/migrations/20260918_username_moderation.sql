-- Username, strict content moderation, and community rules migration.

alter table public.app_users add column if not exists username text;

update public.app_users
set username = 'user_' || replace(substr(id::text, 1, 8), '-', '')
where username is null or btrim(username) = '';

create unique index if not exists app_users_username_unique_idx
  on public.app_users (lower(username));

alter table public.app_users alter column username set not null;

alter table public.app_users drop constraint if exists app_users_username_format_check;
alter table public.app_users add constraint app_users_username_format_check
  check (username ~ '^[A-Za-z0-9_]{3,30}$');

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
  generated_username text;
begin
  requested_username := lower(nullif(btrim(new.raw_user_meta_data ->> 'username'), ''));
  generated_username := coalesce(requested_username, 'user_' || replace(substr(new.id::text, 1, 8), '-', ''));

  insert into public.app_users (supabase_user_id, email, username, name, avatar_url)
  values (
    new.id,
    coalesce(new.email, concat(new.id::text, '@unknown.local')),
    generated_username,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (supabase_user_id) do update set
    email = excluded.email,
    username = coalesce(public.app_users.username, excluded.username);
  return new;
end;
$$;

create or replace function public.reject_blocked_content()
returns trigger
language plpgsql
as $$
declare
  content text := lower(coalesce(new.body, ''));
begin
  if content ~ '(^|[^a-zçğıöşü0-9])(aq|amina|orospu|amk|sik|piç|mal|gerizekalı)([^a-zçğıöşü0-9]|$)' then
    raise exception 'İçerik topluluk kurallarına aykırı argo içeriyor.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists reject_comments_blocked_content on public.comments;
create trigger reject_comments_blocked_content
before insert or update on public.comments
for each row execute function public.reject_blocked_content();

drop trigger if exists reject_forum_posts_blocked_content on public.forum_posts;
create trigger reject_forum_posts_blocked_content
before insert or update on public.forum_posts
for each row execute function public.reject_blocked_content();

drop trigger if exists reject_forum_comments_blocked_content on public.forum_comments;
create trigger reject_forum_comments_blocked_content
before insert or update on public.forum_comments
for each row execute function public.reject_blocked_content();
