export const tickerTabs = [
  "THYAO",
  "EREGL",
  "SASA",
  "ASELS",
  "GARAN",
  "AKBNK",
  "BIMAS",
  "TUPRS",
  "FROTO",
  "TCELL",
  "SISE",
  "ISCTR",
  "YKBNK",
] as const;

export type TickerTab = (typeof tickerTabs)[number];

export const portfolioBands = ["%0-10", "%10-20", "%20-30", "%30-40", "%40-50", "%50-75", "%75-100"] as const;

export const demoComments = [
  {
    id: "d1",
    ticker: "THYAO",
    nickname: "BorsaGezgini",
    portfolio_band: "%30-40",
    body: "Hacim güçlü, 320 üzeri kalıcılık gelirse yeni ivme bekliyorum.",
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "d2",
    ticker: "EREGL",
    nickname: "TemettüAvcısı",
    portfolio_band: "%50-75",
    body: "Çelik tarafı zayıf ama bilanço savunması iyi, kademeli birikim devam.",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

export const demoReactions = [
  { id: "r1", comment_id: "d1", emoji: "🚀", created_at: new Date().toISOString() },
  { id: "r2", comment_id: "d1", emoji: "🔥", created_at: new Date().toISOString() },
  { id: "r3", comment_id: "d2", emoji: "😭", created_at: new Date().toISOString() },
];

export const demoPoll = {
  id: "poll-demo",
  question: "Bu hafta BİST 100 nasıl kapanır?",
  options: ["Güçlü yükseliş", "Hafif yükseliş", "Yatay", "Hafif düşüş", "Sert düşüş"],
};

export const demoPollVotes = [
  { id: "pv1", poll_id: "poll-demo", choice: "Hafif yükseliş", created_at: new Date().toISOString() },
  { id: "pv2", poll_id: "poll-demo", choice: "Yatay", created_at: new Date().toISOString() },
  { id: "pv3", poll_id: "poll-demo", choice: "Hafif yükseliş", created_at: new Date().toISOString() },
  { id: "pv4", poll_id: "poll-demo", choice: "Sert düşüş", created_at: new Date().toISOString() },
];

export const demoSentimentVotes = [
  { id: "s1", ticker: "THYAO", side: "boga", weight: 4, created_at: new Date().toISOString() },
  { id: "s2", ticker: "THYAO", side: "ayi", weight: 1, created_at: new Date().toISOString() },
  { id: "s3", ticker: "EREGL", side: "boga", weight: 5, created_at: new Date().toISOString() },
  { id: "s4", ticker: "SASA", side: "ayi", weight: 2, created_at: new Date().toISOString() },
];
