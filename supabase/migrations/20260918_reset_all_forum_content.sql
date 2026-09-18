-- Full forum reset.
-- Deletes forum content, reactions, sentiment votes, and poll votes.
-- Keeps users, portfolios, watchlists, alerts, and poll definitions.

truncate table
  public.comment_reactions,
  public.comments,
  public.sentiment_votes,
  public.poll_votes,
  public.forum_comments,
  public.forum_posts
restart identity cascade;
