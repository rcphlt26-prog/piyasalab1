"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { MostCurious } from "@/components/MostCurious";

export function MarketSidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className="fixed right-3 top-24 z-30 hidden 2xl:flex items-start gap-1" aria-label="Canlı piyasa özeti">
      {isOpen ? <MostCurious compact /> : null}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="app-surface app-border app-text mt-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-lg"
        aria-label={isOpen ? "Piyasa özetini gizle" : "Piyasa özetini göster"}
        title={isOpen ? "Gizle" : "Göster"}
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}