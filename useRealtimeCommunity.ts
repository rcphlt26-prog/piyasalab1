"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  demoComments,
  demoPoll,
  demoPollVotes,
  demoReactions,
  demoSentimentVotes,
  tickerTabs,
  type TickerTab,
} from "@/data/demoRealtime";

export type CommentItem = {
  id: string;
  ticker: string;
  nickname: string;
  portfolio_band: string;
  body: string;
  created_at: string;
};

export type ReactionItem = {
  id: string;
  comment_id: string;
  emoji: string;
  created_at: string;
};

export type PollItem = {
  id: string;
  question: string;
  options: string[];
  active?: boolean;
  created_at?: string;
};

export type PollVote = {
  id: string;
  poll_id: string;
  choice: string;
  created_at: string;
};

export type SentimentVote = {
  id: string;
  ticker: string;
  side: "boga" | "ayi";
  weight: number;
  created_at: string;
};

const bandWeight: Record<string, number> = {
  "%0-10": 1,
  "%10-20": 1.2,
  "%20-30": 1.6,
  "%30-40": 2,
  "%40-50": 2.5,
  "%50-75": 3.5,
  "%75-100": 5,
};

export function useRealtimeCommunity(supabase: SupabaseClient | null) {
  const [comments, setComments] = useState<CommentItem[]>(demoComments);
  const [reactions, setReactions] = useState<ReactionItem[]>(demoReactions);
  const [poll, setPoll] = useState<PollItem>(demoPoll);
  const [pollVotes, setPollVotes] = useState<PollVote[]>(demoPollVotes);
  const [sentimentVotes, setSentimentVotes] = useState<SentimentVote[]>(demoSentimentVotes as SentimentVote[]);
  const [activeTicker, setActiveTicker] = useState<TickerTab>("THYAO");
  const [onlineCount, setOnlineCount] = useState<number>(24);
  const [demoMode, setDemoMode] = useState(true);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    const init = async () => {
      try {
        const [cRes, rRes, pRes, pvRes, sRes] = await Promise.all([
          supabase.from("comments").select("*").order("created_at", { ascending: false }).limit(400),
          supabase.from("comment_reactions").select("*").order("created_at", { ascending: false }).limit(1000),
          supabase.from("polls").select("*").eq("active", true).limit(1).single(),
          supabase.from("poll_votes").select("*").order("created_at", { ascending: false }).limit(1000),
          supabase.from("sentiment_votes").select("*").order("created_at", { ascending: false }).limit(1000),
        ]);

        if (!isMounted) return;

        const hasHardError = [cRes.error, rRes.error, pRes.error, pvRes.error, sRes.error].some(
          (x) => x && x.code !== "PGRST116",
        );

        if (hasHardError) {
          setDemoMode(true);
          return;
        }

        if (cRes.data) setComments(cRes.data as CommentItem[]);
        if (rRes.data) setReactions(rRes.data as ReactionItem[]);
        if (pRes.data) {
          setPoll({
            id: pRes.data.id,
            question: pRes.data.question,
            options: Array.isArray(pRes.data.options) ? pRes.data.options : demoPoll.options,
            active: pRes.data.active,
            created_at: pRes.data.created_at,
          });
        }
        if (pvRes.data) setPollVotes(pvRes.data as PollVote[]);
        if (sRes.data) setSentimentVotes(sRes.data as SentimentVote[]);
        setDemoMode(false);
      } catch {
        setDemoMode(true);
      }
    };

    init();

    const commentsChannel = supabase
      .channel("comments-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, (payload) => {
        if (payload.eventType === "INSERT" && payload.new) {
          setComments((prev) => [payload.new as CommentItem, ...prev]);
        }
      })
      .subscribe();

    const reactionsChannel = supabase
      .channel("reactions-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "comment_reactions" }, (payload) => {
        if (payload.eventType === "INSERT" && payload.new) {
          setReactions((prev) => [payload.new as ReactionItem, ...prev]);
        }
      })
      .subscribe();

    const pollVotesChannel = supabase
      .channel("pollvotes-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "poll_votes" }, (payload) => {
        if (payload.eventType === "INSERT" && payload.new) {
          setPollVotes((prev) => [payload.new as PollVote, ...prev]);
        }
      })
      .subscribe();

    const sentimentChannel = supabase
      .channel("sentiment-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "sentiment_votes" }, (payload) => {
        if (payload.eventType === "INSERT" && payload.new) {
          setSentimentVotes((prev) => [payload.new as SentimentVote, ...prev]);
        }
      })
      .subscribe();

    const presence = supabase.channel("presence-izleyici", {
      config: {
        presence: { key: `${Date.now()}-${Math.random().toString(16).slice(2)}` },
      },
    });

    presence.on("presence", { event: "sync" }, () => {
      const state = presence.presenceState();
      setOnlineCount(Object.keys(state).length || 1);
    });

    presence.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presence.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      isMounted = false;
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(pollVotesChannel);
      supabase.removeChannel(sentimentChannel);
      supabase.removeChannel(presence);
    };
  }, [supabase]);

  const tickerComments = useMemo(
    () => comments.filter((item) => item.ticker === activeTicker).slice(0, 80),
    [comments, activeTicker],
  );

  const reactionCount = useMemo(() => {
    const countMap = new Map<string, { rocket: number; fire: number; cry: number }>();
    reactions.forEach((r) => {
      if (!countMap.has(r.comment_id)) {
        countMap.set(r.comment_id, { rocket: 0, fire: 0, cry: 0 });
      }
      const item = countMap.get(r.comment_id)!;
      if (r.emoji === "🚀") item.rocket += 1;
      if (r.emoji === "🔥") item.fire += 1;
      if (r.emoji === "😭") item.cry += 1;
    });
    return countMap;
  }, [reactions]);

  const tickerSentiment = useMemo(() => {
    const relevant = sentimentVotes.filter((x) => x.ticker === activeTicker);
    const boga = relevant.filter((x) => x.side === "boga").reduce((sum, x) => sum + Number(x.weight || 1), 0);
    const ayi = relevant.filter((x) => x.side === "ayi").reduce((sum, x) => sum + Number(x.weight || 1), 0);
    const total = boga + ayi;
    return {
      boga,
      ayi,
      total,
      bogaPct: total ? (boga / total) * 100 : 50,
      dominant: boga >= ayi ? "Boğa" : "Ayı",
    };
  }, [sentimentVotes, activeTicker]);

  const hypeIndex = useMemo(() => {
    return tickerTabs
      .map((ticker) => {
        const cm = comments.filter((c) => c.ticker === ticker).length;
        const relCommentIds = new Set(comments.filter((c) => c.ticker === ticker).map((c) => c.id));
        const rx = reactions.filter((r) => relCommentIds.has(r.comment_id)).length;
        const score = cm * 7 + rx * 2;
        return { ticker, cm, rx, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [comments, reactions]);

  async function postComment(payload: { ticker: string; nickname: string; portfolioBand: string; body: string }) {
    const newItem: CommentItem = {
      id: crypto.randomUUID(),
      ticker: payload.ticker,
      nickname: payload.nickname,
      portfolio_band: payload.portfolioBand,
      body: payload.body,
      created_at: new Date().toISOString(),
    };

    setComments((prev) => [newItem, ...prev]);

    if (!supabase) {
      setDemoMode(true);
      return;
    }

    const { error } = await supabase.from("comments").insert({
      id: newItem.id,
      ticker: newItem.ticker,
      nickname: newItem.nickname,
      portfolio_band: newItem.portfolio_band,
      body: newItem.body,
    });

    if (error) {
      setDemoMode(true);
    }
  }

  async function reactComment(commentId: string, emoji: "🚀" | "🔥" | "😭") {
    const newReaction: ReactionItem = {
      id: crypto.randomUUID(),
      comment_id: commentId,
      emoji,
      created_at: new Date().toISOString(),
    };
    setReactions((prev) => [newReaction, ...prev]);

    if (!supabase) return;
    const { error } = await supabase.from("comment_reactions").insert(newReaction);
    if (error) setDemoMode(true);
  }

  async function castPollVote(choice: string) {
    const vote: PollVote = {
      id: crypto.randomUUID(),
      poll_id: poll.id,
      choice,
      created_at: new Date().toISOString(),
    };
    setPollVotes((prev) => [vote, ...prev]);
    if (!supabase) return;
    const { error } = await supabase.from("poll_votes").insert(vote);
    if (error) setDemoMode(true);
  }

  async function castSentimentVote(side: "boga" | "ayi", band: string) {
    const vote: SentimentVote = {
      id: crypto.randomUUID(),
      ticker: activeTicker,
      side,
      weight: bandWeight[band] ?? 1,
      created_at: new Date().toISOString(),
    };

    setSentimentVotes((prev) => [vote, ...prev]);
    if (!supabase) return;
    const { error } = await supabase.from("sentiment_votes").insert(vote);
    if (error) setDemoMode(true);
  }

  const pollStats = useMemo(() => {
    const relevant = pollVotes.filter((x) => x.poll_id === poll.id);
    const total = relevant.length;
    const byChoice = poll.options.map((option) => {
      const count = relevant.filter((vote) => vote.choice === option).length;
      return { option, count, pct: total ? (count / total) * 100 : 0 };
    });
    return { total, byChoice };
  }, [pollVotes, poll]);

  return {
    activeTicker,
    setActiveTicker,
    tickerComments,
    reactionCount,
    postComment,
    reactComment,
    castPollVote,
    castSentimentVote,
    tickerSentiment,
    hypeIndex,
    poll,
    pollStats,
    onlineCount,
    demoMode,
  };
}
