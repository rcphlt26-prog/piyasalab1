"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";

interface ItemData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export default function MostCurious() {
  const { quotes, liveAvailable, updatedAt } = useLiveQuotes();
  const codes = ["XU100", "GRAMALTIN", "GRAMGUMUS", "USDTRY", "EURTRY"];
  const data: ItemData[] = codes.map((code) => {
    const quote = quotes.find((item) => item.code === code);
    const isPositive = (quote?.changePct ?? 0) >= 0;

    return {
      title: quote?.label ?? code,
      value: quote ? new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(quote.price) : "--",
      change: quote ? `${isPositive ? "+" : ""}${quote.changePct.toFixed(2)}%` : "Veri bekleniyor",
      isPositive,
    };
  });

  const updatedLabel = updatedAt
    ? new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date(updatedAt))
    : null;

  return (
    <div className="w-full my-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          🔥 En Çok Merak Edilenler
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {liveAvailable ? `Canlı Veri${updatedLabel ? ` · ${updatedLabel}` : ""}` : "Veri bekleniyor"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.map((item) => (
          <div
            key={item.title}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between transition-transform hover:scale-[1.02]"
          >
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.title}</span>
            <div className="mt-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {item.isPositive ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
              <span className={`text-xs font-semibold ${item.isPositive ? "text-green-500" : "text-red-500"}`}>{item.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
