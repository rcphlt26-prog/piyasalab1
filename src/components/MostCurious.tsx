"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ItemData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export default function MostCurious() {
  const [data, setData] = useState<ItemData[]>([
    { title: "BIST 100", value: "10.450,20", change: "+1.45%", isPositive: true },
    { title: "Gram Altın", value: "2.850,40", change: "+0.85%", isPositive: true },
    { title: "Gram Gümüş", value: "34,20", change: "-0.30%", isPositive: false },
    { title: "Dolar / TL", value: "34,15", change: "+0.12%", isPositive: true },
    { title: "Euro / TL", value: "37,80", change: "+0.25%", isPositive: true },
  ]);

  // Burada gelecekte canlı API bağlantını (örneğin Supabase veya finans API'n) entegre edebilirsin.

  return (
    <div className="w-full my-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          🔥 En Çok Merak Edilenler
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">Canlı Veri</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between transition-transform hover:scale-[1.02]"
          >
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {item.title}
            </span>
            <div className="mt-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {item.value}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {item.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-xs font-semibold ${
                  item.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}