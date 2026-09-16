"use client";

import { useEffect, useRef } from "react";

const tapeConfig = JSON.stringify({
  symbols: [
    { proName: "BIST:XU100", title: "BIST 100" },
    { proName: "BIST:THYAO", title: "THYAO" },
    { proName: "BIST:ASELS", title: "ASELS" },
    { proName: "FX:USDTRY", title: "USDTRY" },
    { proName: "FX:EURTRY", title: "EURTRY" },
    { proName: "TVC:GOLD", title: "Ons Altın" },
  ],
  showSymbolLogo: true,
  isTransparent: true,
  displayMode: "adaptive",
  colorTheme: "dark",
  locale: "tr",
});

const miniConfig = JSON.stringify({
  symbols: [["BIST:XU100|1D"], ["BIST:THYAO|1D"], ["FX:USDTRY|1D"]],
  chartOnly: false,
  width: "100%",
  height: 380,
  colorTheme: "dark",
  locale: "tr",
  showVolume: false,
});

const advancedConfig = JSON.stringify({
  autosize: true,
  symbol: "BIST:XU100",
  interval: "60",
  timezone: "Europe/Istanbul",
  theme: "dark",
  style: "1",
  locale: "tr",
  hide_top_toolbar: false,
  allow_symbol_change: true,
  save_image: false,
});

function useTradingViewScript(containerId: string, src: string, configJson: string) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = configJson;
    container.appendChild(script);

    initialized.current = true;
    return () => {
      container.innerHTML = "";
      initialized.current = false;
    };
  }, [containerId, src, configJson]);
}

export function TradingViewTape() {
  useTradingViewScript("tv-tape", "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js", tapeConfig);
  return <div id="tv-tape" className="min-h-[68px]" />;
}

export function TradingViewMiniOverview() {
  useTradingViewScript("tv-mini", "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js", miniConfig);
  return <div id="tv-mini" className="min-h-[380px]" />;
}

export function TradingViewAdvancedChart() {
  useTradingViewScript("tv-chart", "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js", advancedConfig);
  return <div id="tv-chart" className="h-[430px] w-full" />;
}

export function TradingViewSymbolChart({ symbol }: { symbol: string }) {
  const containerId = `tv-chart-${symbol.replace(/[^a-zA-Z0-9]/g, "-")}`;
  const config = JSON.stringify({
    autosize: true,
    symbol,
    interval: "D",
    timezone: "Europe/Istanbul",
    theme: "dark",
    style: "1",
    locale: "tr",
    hide_top_toolbar: false,
    allow_symbol_change: true,
    save_image: false,
  });
  useTradingViewScript(containerId, "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js", config);
  return <div id={containerId} className="h-[430px] w-full" />;
}
