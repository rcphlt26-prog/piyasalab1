"use client";

import { useMemo, useState } from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRealtimeCommunity } from "@/hooks/useRealtimeCommunity";
import { portfolioBands, tickerTabs, type TickerTab } from "@/data/demoRealtime";
import { formatNumber } from "@/lib/utils";

type ForumCategory = {
  id: string;
  label: string;
  description: string;
  tickers: readonly TickerTab[];
};

const forumCategories: ForumCategory[] = [
  {
    id: "genel",
    label: "Genel Borsa",
    description: "BİST geneli, endeks ve piyasa gündemi sohbeti.",
    tickers: tickerTabs,
  },
  {
    id: "bist100",
    label: "BIST 100 Hisseleri",
    description: "Popüler BİST 100 hisseleri hakkında tartışmalar.",
    tickers: ["THYAO", "EREGL", "ASELS", "GARAN", "AKBNK", "BIMAS", "TUPRS", "FROTO"],
  },
  {
    id: "doviz-altin",
    label: "Döviz & Altın",
    description: "Dolar, euro ve altın tarafındaki beklentiler.",
    tickers: ["SASA", "SISE", "TCELL"],
  },
  {
    id: "ekonomi",
    label: "Ekonomi & Makro",
    description: "Enflasyon, faiz ve makroekonomik veri yorumları.",
    tickers: ["ISCTR", "YKBNK", "GARAN", "AKBNK"],
  },
  {
    id: "kripto",
    label: "Kripto",
    description: "Kripto para gündemi ve risk sohbeti.",
    tickers: ["SASA", "ASELS"],
  },
  {
    id: "yeni-baslayanlar",
    label: "Yeni Başlayanlar",
    description: "Borsaya yeni başlayanlar için soru-cevap.",
    tickers: ["THYAO", "TCELL", "BIMAS"],
  },
];

const reactionEmojis: Array<{ emoji: "🚀" | "🔥" | "😭"; key: "rocket" | "fire" | "cry" }> = [
  { emoji: "🚀", key: "rocket" },
  { emoji: "🔥", key: "fire" },
  { emoji: "😭", key: "cry" },
];

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.round(hours / 24);
  return `${days} gün önce`;
}

export function ForumSection() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const community = useRealtimeCommunity(supabase);
  const {
    activeTicker,
    setActiveTicker,
    tickerComments,
    reactionCount,
    postComment,
    reactComment,
    castSentimentVote,
    tickerSentiment,
    hypeIndex,
    poll,
    pollStats,
    castPollVote,
    onlineCount,
    demoMode,
  } = community;

  const [activeCategory, setActiveCategory] = useState<ForumCategory>(forumCategories[0]);
  const [nickname, setNickname] = useState("");
  const [band, setBand] = useState<string>(portfolioBands[0]);
  const [body, setBody] = useState("");
  const [pollChoice, setPollChoice] = useState<string | null>(null);

  const categoryTickers = activeCategory.tickers;

  function handlePost() {
    const text = body.trim();
    if (!text) return;
    postComment({
      ticker: activeTicker,
      nickname: nickname.trim() || "Anonim Yatırımcı",
      portfolioBand: band,
      body: text,
    });
    setBody("");
  }

  return (
    <section className="section-card fade-in">
      <SectionTitle
        eyebrow="Topluluk"
        title="Yatırımcı Forumu"
        description="Kullanıcı yorumları kişisel görüştür, yatırım tavsiyesi değildir. Lütfen saygılı bir dil kullanın."
      />

      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
        <span className="app-surface-2 app-border inline-flex items-center gap-1 rounded-full border px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-[var(--color-bull)]" /> {onlineCount} çevrimiçi
        </span>
        <span className={`rounded-full px-3 py-1 ${demoMode ? "bg-[var(--color-gold)]/15 text-gold" : "bg-[var(--color-bull)]/15 text-bull"}`}>
          {demoMode ? "Demo modu (canlı bağlantı yok)" : "Canlı"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr_260px]">
        {/* Sol: Kategoriler */}
        <aside className="app-surface-2 app-border rounded-xl border p-3">
          <h3 className="app-muted mb-2 text-xs font-semibold uppercase tracking-wide">Kategoriler</h3>
          <nav className="space-y-1">
            {forumCategories.map((cat) => {
              const active = cat.id === activeCategory.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat);
                    if (!cat.tickers.includes(activeTicker)) {
                      setActiveTicker(cat.tickers[0]);
                    }
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    active ? "bg-[var(--color-primary)] text-white" : "app-text hover:app-surface-3"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </nav>
          <p className="app-muted mt-3 text-xs">{activeCategory.description}</p>
        </aside>

        {/* Orta: Akış */}
        <div className="space-y-3">
          <div className="app-surface-2 app-border rounded-xl border p-3">
            <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
              {categoryTickers.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTicker(t)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    t === activeTicker ? "bg-[var(--color-primary)] text-white" : "app-surface app-border app-text border"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Yorum formu */}
            <div className="app-surface app-border rounded-xl border p-3">
              <div className="mb-2 flex flex-wrap gap-2">
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Takma ad"
                  className="app-surface-2 app-border app-text flex-1 rounded-lg border px-3 py-2 text-sm"
                />
                <select
                  value={band}
                  onChange={(e) => setBand(e.target.value)}
                  className="app-surface-2 app-border app-text rounded-lg border px-3 py-2 text-sm"
                  title="Portföy getiri bandı rozeti"
                >
                  {portfolioBands.map((b) => (
                    <option key={b} value={b}>
                      Getiri {b}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`${activeTicker} hakkında görüşünü paylaş...`}
                rows={2}
                className="app-surface-2 app-border app-text w-full resize-none rounded-lg border px-3 py-2 text-sm"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="app-muted text-xs">Nezaket kuralları geçerlidir. Yatırım tavsiyesi paylaşmayın.</span>
                <button
                  onClick={handlePost}
                  className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
                >
                  Gönder
                </button>
              </div>
            </div>

            {/* Akış */}
            <div className="mt-3 space-y-2">
              {tickerComments.length === 0 ? (
                <p className="app-muted py-6 text-center text-sm">Bu başlıkta henüz yorum yok. İlk yorumu sen yaz!</p>
              ) : (
                tickerComments.map((c) => {
                  const counts = reactionCount.get(c.id) ?? { rocket: 0, fire: 0, cry: 0 };
                  return (
                    <article key={c.id} className="app-surface app-border card-hover rounded-xl border p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong className="app-text text-sm">{c.nickname}</strong>
                          <span className="rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            Getiri {c.portfolio_band}
                          </span>
                          <span className="app-muted text-[10px]">{c.ticker}</span>
                        </div>
                        <span className="app-muted text-[10px]">{relativeTime(c.created_at)}</span>
                      </div>
                      <p className="app-text-secondary text-sm">{c.body}</p>
                      <div className="mt-2 flex gap-2">
                        {reactionEmojis.map(({ emoji, key }) => (
                          <button
                            key={emoji}
                            onClick={() => reactComment(c.id, emoji)}
                            className="app-surface-2 app-border inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition hover:app-surface-3"
                          >
                            <span>{emoji}</span>
                            <span className="app-muted">{counts[key]}</span>
                          </button>
                        ))}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sağ: Boğa/Ayı + Hype + Anket */}
        <aside className="space-y-3">
          <div className="app-surface-2 app-border rounded-xl border p-3">
            <h3 className="app-text mb-2 text-sm font-semibold">{activeTicker} Boğa / Ayı Barometresi</h3>
            <div className="app-surface-3 mb-2 h-3 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-[var(--color-bull)] transition-all"
                style={{ width: `${tickerSentiment.bogaPct}%` }}
              />
            </div>
            <div className="mb-3 flex justify-between text-xs">
              <span className="text-bull">Boğa %{formatNumber(tickerSentiment.bogaPct, 0)}</span>
              <span className="text-bear">Ayı %{formatNumber(100 - tickerSentiment.bogaPct, 0)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => castSentimentVote("boga", band)}
                className="flex-1 rounded-lg bg-[var(--color-bull)]/15 px-2 py-2 text-xs font-semibold text-bull transition hover:bg-[var(--color-bull)]/25"
              >
                🐂 Boğa oyu
              </button>
              <button
                onClick={() => castSentimentVote("ayi", band)}
                className="flex-1 rounded-lg bg-[var(--color-bear)]/15 px-2 py-2 text-xs font-semibold text-bear transition hover:bg-[var(--color-bear)]/25"
              >
                🐻 Ayı oyu
              </button>
            </div>
            <p className="app-muted mt-2 text-[10px]">Oy ağırlığı seçtiğin getiri bandına göre belirlenir.</p>
          </div>

          <div className="app-surface-2 app-border rounded-xl border p-3">
            <h3 className="app-text mb-2 text-sm font-semibold">🔥 Hype Endeksi</h3>
            <div className="space-y-2">
              {hypeIndex.map((h, i) => (
                <button
                  key={h.ticker}
                  onClick={() => setActiveTicker(h.ticker as TickerTab)}
                  className="app-surface app-border flex w-full items-center justify-between rounded-lg border px-2 py-1.5 text-xs transition hover:app-surface-3"
                >
                  <span className="app-text font-semibold">
                    {i + 1}. {h.ticker}
                  </span>
                  <span className="app-muted">{h.score} puan</span>
                </button>
              ))}
            </div>
          </div>

          <div className="app-surface-2 app-border rounded-xl border p-3">
            <h3 className="app-text mb-2 text-sm font-semibold">📊 Haftanın Anketi</h3>
            <p className="app-text-secondary mb-2 text-xs">{poll.question}</p>
            <div className="space-y-2">
              {pollStats.byChoice.map((opt) => (
                <button
                  key={opt.option}
                  onClick={() => {
                    setPollChoice(opt.option);
                    castPollVote(opt.option);
                  }}
                  className="app-surface app-border w-full overflow-hidden rounded-lg border text-left"
                >
                  <div className="relative px-2 py-1.5">
                    <div
                      className="absolute inset-y-0 left-0 bg-[var(--color-primary)]/15"
                      style={{ width: `${opt.pct}%` }}
                    />
                    <div className="relative flex justify-between text-xs">
                      <span className={`app-text ${pollChoice === opt.option ? "font-semibold text-primary" : ""}`}>{opt.option}</span>
                      <span className="app-muted">%{formatNumber(opt.pct, 0)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="app-muted mt-2 text-[10px]">Toplam {pollStats.total} oy</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
