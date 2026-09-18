"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { Flame, MessageCircle, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRealtimeCommunity } from "@/hooks/useRealtimeCommunity";

export function StockCommunityWidget({ ticker }: { ticker: string }) {
  const supabase = getSupabaseBrowserClient();
  const community = useRealtimeCommunity(supabase);
  const { setActiveTicker } = community;
  const [body, setBody] = useState("");
  const [nickname, setNickname] = useState("Anonim Yatırımcı");

  useEffect(() => {
    startTransition(() => setActiveTicker(ticker as never));
  }, [ticker, setActiveTicker]);

  const comments = community.tickerComments;
  const recent = useMemo(() => comments.slice(0, 6), [comments]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    await community.postComment({ ticker, nickname: nickname.trim() || "Anonim Yatırımcı", portfolioBand: "%0-10", body: body.trim() });
    setBody("");
  }

  return (
    <div className="space-y-4">
      <div className="app-surface-2 app-border rounded-xl border p-4">
        <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /><h3 className="app-text text-sm font-semibold">{ticker} topluluk akışı</h3></div><span className="app-muted text-xs">{community.demoMode ? "Demo akış" : `${community.onlineCount} kişi çevrimiçi`}</span></div>
        <div className="mb-3 grid grid-cols-2 gap-2"><div className="rounded-lg border border-[var(--color-bull)]/30 bg-[var(--color-bull)]/10 p-3"><div className="flex items-center gap-2 text-bull"><ThumbsUp className="h-4 w-4" /><span className="text-xs font-semibold">Boğa</span></div><p className="app-text mt-1 text-lg font-bold">%{community.tickerSentiment.bogaPct.toFixed(0)}</p></div><div className="rounded-lg border border-[var(--color-bear)]/30 bg-[var(--color-bear)]/10 p-3"><div className="flex items-center gap-2 text-bear"><ThumbsDown className="h-4 w-4" /><span className="text-xs font-semibold">Ayı</span></div><p className="app-text mt-1 text-lg font-bold">%{(100 - community.tickerSentiment.bogaPct).toFixed(0)}</p></div></div>
        <div className="flex gap-2"><button type="button" onClick={() => void community.castSentimentVote("boga", "%0-10")} className="flex-1 rounded-lg bg-[var(--color-bull)]/15 px-3 py-2 text-xs font-semibold text-bull">Boğaya katıl</button><button type="button" onClick={() => void community.castSentimentVote("ayi", "%0-10")} className="flex-1 rounded-lg bg-[var(--color-bear)]/15 px-3 py-2 text-xs font-semibold text-bear">Ayıya katıl</button></div>
      </div>
      <form onSubmit={submit} className="app-surface-2 app-border rounded-xl border p-4"><div className="mb-2 flex items-center gap-2"><Flame className="h-4 w-4 text-gold" /><h3 className="app-text text-sm font-semibold">Tartışmaya katıl</h3></div><div className="grid gap-2 sm:grid-cols-[160px_1fr_auto]"><input value={nickname} onChange={(event) => setNickname(event.target.value)} className="app-surface app-border app-text rounded-lg border px-3 py-2 text-xs" aria-label="Kullanıcı adı" /><input required value={body} onChange={(event) => setBody(event.target.value)} placeholder={`${ticker} hakkında fikrini yaz...`} className="app-surface app-border app-text rounded-lg border px-3 py-2 text-sm outline-none" /><button type="submit" className="inline-flex items-center justify-center gap-1 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white"><Send className="h-4 w-4" /> Gönder</button></div><p className="app-muted mt-2 text-[11px]">Topluluk kuralları: saygılı olun; argo, küfür ve kişisel saldırılar kaydedilmez.</p></form>
      <div className="space-y-2">{recent.length === 0 ? <p className="app-muted rounded-xl border border-dashed p-6 text-center text-sm">Bu hisse için henüz tartışma yok.</p> : recent.map((comment) => <article key={comment.id} className="app-surface-2 app-border rounded-xl border p-3"><div className="mb-1 flex items-center justify-between"><span className="app-text text-xs font-semibold">{comment.nickname}</span><span className="app-muted text-[10px]">{new Date(comment.created_at).toLocaleString("tr-TR")}</span></div><p className="app-text-secondary text-sm">{comment.body}</p><div className="mt-2 flex gap-2 text-xs"><button type="button" onClick={() => void community.reactComment(comment.id, "🚀")} className="app-muted hover:text-primary">🚀 {community.reactionCount.get(comment.id)?.rocket ?? 0}</button><button type="button" onClick={() => void community.reactComment(comment.id, "🔥")} className="app-muted hover:text-gold">🔥 {community.reactionCount.get(comment.id)?.fire ?? 0}</button></div></article>)}</div>
    </div>
  );
}
