"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Wrench, Newspaper } from "lucide-react";
import { stockDirectory } from "@/data/marketSymbols";
import { newsData } from "@/data/newsData";

type ToolEntry = { id: string; label: string };

const tools: ToolEntry[] = [
  { id: "hesaplayici", label: "Getiri Hesaplayıcı" },
  { id: "hesaplayici", label: "Alım Gücü Simülatörü" },
  { id: "hesaplayici", label: "IPO Tavan Serisi" },
  { id: "karne", label: "Hisse Karnesi" },
  { id: "oyunlar", label: "Mini Oyunlar" },
  { id: "oyunlar", label: "Pişmanlık Ölçeri" },
  { id: "forum", label: "Topluluk Forumu" },
];

type Result =
  | { type: "stock"; ticker: string; name: string; sector: string }
  | { type: "tool"; id: string; label: string }
  | { type: "news"; slug: string; title: string };

export function SearchBar({ onNavigateTab }: { onNavigateTab?: (tab: string) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const results = useMemo<Result[]>(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return [];
    const stocks: Result[] = stockDirectory
      .filter((s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      .slice(0, 6)
      .map((s) => ({ type: "stock", ticker: s.ticker, name: s.name, sector: s.sector }));
    const toolHits: Result[] = tools
      .filter((t) => t.label.toLowerCase().includes(q))
      .slice(0, 4)
      .map((t) => ({ type: "tool", id: t.id, label: t.label }));
    const newsHits: Result[] = newsData
      .filter((n) => n.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map((n) => ({ type: "news", slug: n.slug, title: n.title }));
    return [...stocks, ...toolHits, ...newsHits];
  }, [debounced]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setActiveIndex(0), [debounced]);

  const choose = (r: Result) => {
    setOpen(false);
    setQuery("");
    if (r.type === "stock") {
      router.push(`/varlik/${r.ticker}`);
    } else if (r.type === "tool") {
      onNavigateTab?.(r.id);
    } else {
      onNavigateTab?.("haberler");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[activeIndex];
      if (r) choose(r);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="app-surface-2 app-border flex items-center gap-2 rounded-full border px-3 py-1.5">
        <Search className="app-muted h-4 w-4 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Hisse, araç veya haber ara..."
          aria-label="Site içi arama"
          className="app-text w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
        />
        <kbd className="app-muted app-border hidden shrink-0 rounded border px-1.5 py-0.5 text-[10px] sm:inline">Ctrl K</kbd>
      </div>

      {open && results.length > 0 ? (
        <div className="app-surface app-border absolute left-0 right-0 top-11 z-50 max-h-80 overflow-auto rounded-2xl border p-2 shadow-xl">
          {results.map((r, idx) => {
            const active = idx === activeIndex;
            const base = `flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${active ? "app-surface-3" : ""}`;
            if (r.type === "stock") {
              return (
                <button key={`s-${r.ticker}`} className={base} onMouseEnter={() => setActiveIndex(idx)} onClick={() => choose(r)}>
                  <TrendingUp className="text-bull h-4 w-4 shrink-0" />
                  <span className="app-text font-semibold">{r.ticker}</span>
                  <span className="app-muted truncate">{r.name}</span>
                  <span className="app-muted ml-auto text-xs">{r.sector}</span>
                </button>
              );
            }
            if (r.type === "tool") {
              return (
                <button key={`t-${r.label}`} className={base} onMouseEnter={() => setActiveIndex(idx)} onClick={() => choose(r)}>
                  <Wrench className="text-primary h-4 w-4 shrink-0" />
                  <span className="app-text">{r.label}</span>
                  <span className="app-muted ml-auto text-xs">Araç</span>
                </button>
              );
            }
            return (
              <button key={`n-${r.slug}`} className={base} onMouseEnter={() => setActiveIndex(idx)} onClick={() => choose(r)}>
                <Newspaper className="text-gold h-4 w-4 shrink-0" />
                <span className="app-text truncate">{r.title}</span>
                <span className="app-muted ml-auto text-xs">Haber</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
