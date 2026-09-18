-- One-time forum cleanup and repeatable moderation cleanup bot.

create or replace function public.cleanup_blocked_forum_content()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed_count integer := 0;
  affected_count integer := 0;
  blocked_pattern text := '(^|[^a-zçğıöşü0-9])(aq|amina|orospu|amk|sik|piç|mal|gerizekalı|salak|aptal|şerefsiz|haysiyetsiz|ibne|yavşak|pezevenk|kahpe|sürtük|bok|boktan|siktir|sikik|ananı|avradını|göt|götveren|dalyarak|it|eşek|lan|ulan)([^a-zçğıöşü0-9]|$)';
begin
  delete from public.comments
  where lower(coalesce(body, '') || ' ' || coalesce(nickname, '')) ~ blocked_pattern;
  get diagnostics affected_count = row_count;
  removed_count := removed_count + affected_count;

  delete from public.forum_posts
  where lower(coalesce(body, '')) ~ blocked_pattern;
  get diagnostics affected_count = row_count;
  removed_count := removed_count + affected_count;

  delete from public.forum_comments
  where lower(coalesce(body, '')) ~ blocked_pattern;
  get diagnostics affected_count = row_count;
  removed_count := removed_count + affected_count;

  return removed_count;
end;
$$;

revoke all on function public.cleanup_blocked_forum_content() from public;
grant execute on function public.cleanup_blocked_forum_content() to service_role;

-- Clean existing forum content once when this migration is applied.
select public.cleanup_blocked_forum_content();
