export type MarketSymbol = {
  code: string;
  label: string;
  yahooSymbol: string;
  category: "endeks" | "hisse" | "doviz" | "emtia";
};

export const marketSymbols: MarketSymbol[] = [
  { code: "XU100", label: "BIST 100", yahooSymbol: "^XU100", category: "endeks" },
  { code: "THYAO", label: "THYAO", yahooSymbol: "THYAO.IS", category: "hisse" },
  { code: "ASELS", label: "ASELS", yahooSymbol: "ASELS.IS", category: "hisse" },
  { code: "GARAN", label: "GARAN", yahooSymbol: "GARAN.IS", category: "hisse" },
  { code: "AKBNK", label: "AKBNK", yahooSymbol: "AKBNK.IS", category: "hisse" },
  { code: "EREGL", label: "EREGL", yahooSymbol: "EREGL.IS", category: "hisse" },
  { code: "SASA", label: "SASA", yahooSymbol: "SASA.IS", category: "hisse" },
  { code: "KCHOL", label: "KCHOL", yahooSymbol: "KCHOL.IS", category: "hisse" },
  { code: "TUPRS", label: "TUPRS", yahooSymbol: "TUPRS.IS", category: "hisse" },
  { code: "BIMAS", label: "BIMAS", yahooSymbol: "BIMAS.IS", category: "hisse" },
  { code: "PGSUS", label: "PGSUS", yahooSymbol: "PGSUS.IS", category: "hisse" },
  { code: "FROTO", label: "FROTO", yahooSymbol: "FROTO.IS", category: "hisse" },
  { code: "TCELL", label: "TCELL", yahooSymbol: "TCELL.IS", category: "hisse" },
  { code: "SISE", label: "SISE", yahooSymbol: "SISE.IS", category: "hisse" },
  { code: "ISCTR", label: "ISCTR", yahooSymbol: "ISCTR.IS", category: "hisse" },
  { code: "YKBNK", label: "YKBNK", yahooSymbol: "YKBNK.IS", category: "hisse" },
  { code: "USDTRY", label: "USD/TRY", yahooSymbol: "TRY=X", category: "doviz" },
  { code: "EURTRY", label: "EUR/TRY", yahooSymbol: "EURTRY=X", category: "doviz" },
  { code: "XAUTRY", label: "Gram Altın", yahooSymbol: "GC=F", category: "emtia" },
];

export const demoQuotes = marketSymbols.map((item, index) => ({
  code: item.code,
  label: item.label,
  price: Number((120 + index * 17.3 + (index % 3) * 2.2).toFixed(2)),
  changePct: Number((((index % 2 ? -1 : 1) * ((index % 7) + 1)) / 10).toFixed(2)),
  source: "Demo veri",
  timestamp: new Date().toISOString(),
}));
