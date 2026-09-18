-- Reset forum content and enforce strict profanity blocking at database level.

truncate table public.comment_reactions, public.comments, public.sentiment_votes, public.poll_votes restart identity cascade;

create or replace function public.reject_blocked_content()
returns trigger
language plpgsql
as $$
declare
  content text := lower(coalesce(to_jsonb(new)->>'body', '') || ' ' || coalesce(to_jsonb(new)->>'nickname', ''));
  compact_content text := regexp_replace(content, '[^a-zçğıöşü0-9]', '', 'g');
  blocked_terms text[] := array[
    'aq', 'amina', 'orospu', 'amk', 'sik', 'piç', 'mal', 'gerizekalı',
    'salak', 'aptal', 'şerefsiz', 'haysiyetsiz', 'ibne', 'yavşak',
    'pezevenk', 'kahpe', 'sürtük', 'bok', 'boktan', 'siktir', 'sikik',
    'ananı', 'avradını', 'göt', 'götveren', 'dalyarak', 'it', 'eşek',
    'lan', 'ulan'
  ];
  term text;
begin
  foreach term in array blocked_terms loop
    if content ~ ('(^|[^a-zçğıöşü0-9])' || term || '([^a-zçğıöşü0-9]|$)') or compact_content ~ term then
      raise exception 'İçerik topluluk kurallarına aykırı argo içeriyor.' using errcode = 'check_violation';
    end if;
  end loop;
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
