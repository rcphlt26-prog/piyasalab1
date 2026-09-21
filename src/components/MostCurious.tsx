"use client";

import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { getMarketPriceMeta, marketSymbolByCode } from "@/data/marketSymbols";
import { formatMarketPrice } from "@/lib/utils";

interface ItemData {
  code: string;
  title: string;
  value: string;
  currencyLabel: string;
  change: string;
  isPositive: boolean;
}

export function MostCurious({ compact = false }: { compact?: boolean }) {
  const { quotes, liveAvailable, updatedAt } = useLiveQuotes();
  const codes = ["XU100", "GRAMALTIN", "GRAMGUMUS", "USDTRY", "EURTRY", "ETHUSD"];
  const data: ItemData[] = codes.map((code) => {
    const quote = quotes.find((item) => item.code === code);
    const isPositive = (quote?.changePct ?? 0) >= 0;

    return {
      code,
      title: quote?.label ?? code,
      value: quote ? formatMarketPrice(quote.price) : "--",
      currencyLabel: getMarketPriceMeta(marketSymbolByCode.get(code)).currencyLabel,
      change: quote ? `${isPositive ? "+" : ""}${quote.changePct.toFixed(2)}%` : "Veri bekleniyor",
      isPositive,
    };
  });

  const updatedLabel = updatedAt
    ? new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date(updatedAt))
    : null;

  return (
    <section className={compact ? "app-surface app-border w-72 rounded-xl border p-3 shadow-xl" : "w-full"}>
      <div className={compact ? "mb-3 flex items-center justify-between gap-2" : "mb-4 flex items-center justify-between gap-2"}>
        <h2 className={`app-text flex items-center gap-2 font-bold ${compact ? "text-base" : "text-xl"}`}>
          En Çok Merak Edilenler
        </h2>
        <span className="app-muted shrink-0 text-[11px]">
          {liveAvailable ? `Canlı Veri${updatedLabel ? ` · ${updatedLabel}` : ""}` : "Veri bekleniyor"}
        </span>
      </div>

      <div className={compact ? "space-y-1" : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"}>
        {data.map((item) => (
          <Link
            href={`/varlik/${item.code}`}
            key={item.code}
            className={compact ? "app-surface-2 app-border flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2" : "app-surface-2 app-border card-hover min-w-0 rounded-xl border p-3"}
          >
            <div className="min-w-0">
              <span className="app-text block truncate text-sm font-medium">{item.title}</span>
              <span className="app-muted text-[11px]">{item.currencyLabel}</span>
            </div>
            <div className={compact ? "min-w-0 text-right" : "mt-2"}>
              <span className="app-text block truncate text-base font-bold">{item.value} {item.currencyLabel}</span>
              <span className={`flex items-center justify-end gap-1 text-xs font-semibold ${item.isPositive ? "text-bull" : "text-bear"}`}>
                {item.isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {item.change}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default MostCurious;
