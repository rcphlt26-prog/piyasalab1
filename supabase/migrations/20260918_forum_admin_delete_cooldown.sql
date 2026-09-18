-- Admin comment deletion and forum reset/cooldown support.

drop policy if exists comments_delete_admin on public.comments;
create policy comments_delete_admin on public.comments
for delete to authenticated
using (exists (select 1 from public.app_users where supabase_user_id = auth.uid() and role = 'ADMIN'));