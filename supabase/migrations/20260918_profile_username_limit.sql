-- Profile username change tracking.

alter table public.app_users add column if not exists username_last_changed_at timestamptz;