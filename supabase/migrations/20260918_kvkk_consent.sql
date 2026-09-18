-- KVKK / privacy / cookie consent fields for app_users.

alter table public.app_users add column if not exists is_kvkk_accepted boolean not null default false;
alter table public.app_users add column if not exists kvkk_accepted_at timestamptz;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
  generated_username text;
  accepted boolean;
  accepted_at timestamptz;
begin
  requested_username := lower(nullif(btrim(new.raw_user_meta_data ->> 'username'), ''));
  generated_username := coalesce(requested_username, 'user_' || replace(substr(new.id::text, 1, 8), '-', ''));
  accepted := coalesce((new.raw_user_meta_data ->> 'isKvkkAccepted')::boolean, false);
  accepted_at := case when accepted then coalesce((new.raw_user_meta_data ->> 'kvkkAcceptedAt')::timestamptz, now()) else null end;

  insert into public.app_users (supabase_user_id, email, username, is_kvkk_accepted, kvkk_accepted_at, name, avatar_url)
  values (
    new.id,
    coalesce(new.email, concat(new.id::text, '@unknown.local')),
    generated_username,
    accepted,
    accepted_at,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (supabase_user_id) do update set
    email = excluded.email,
    username = coalesce(public.app_users.username, excluded.username),
    is_kvkk_accepted = public.app_users.is_kvkk_accepted or excluded.is_kvkk_accepted,
    kvkk_accepted_at = coalesce(public.app_users.kvkk_accepted_at, excluded.kvkk_accepted_at);
  return new;
end;
$$;
