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

export type TickerTab = string;

export const portfolioBands = ["%0-10", "%10-20", "%20-30", "%30-40", "%40-50", "%50-75", "%75-100"] as const;

export const demoComments: Array<{ id: string; ticker: string; nickname: string; portfolio_band: string; body: string; created_at: string }> = [];

export const demoReactions: Array<{ id: string; comment_id: string; emoji: string; created_at: string }> = [];

export const demoPoll = {
  id: "poll-demo",
  question: "Bu hafta BİST 100 nasıl kapanır?",
  options: ["Güçlü yükseliş", "Hafif yükseliş", "Yatay", "Hafif düşüş", "Sert düşüş"],
};

export const demoPollVotes: Array<{ id: string; poll_id: string; choice: string; created_at: string }> = [];

export const demoSentimentVotes: Array<{ id: string; ticker: string; side: string; weight: number; created_at: string }> = [];
