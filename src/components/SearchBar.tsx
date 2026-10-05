"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Wrench, Newspaper } from "lucide-react";
import { marketSymbols } from "@/data/marketSymbols";

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
  | { type: "asset"; code: string; label: string; category: string }
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
    const assets: Result[] = marketSymbols
      .filter((asset) => asset.code.toLowerCase().includes(q) || asset.label.toLowerCase().includes(q))
      .slice(0, 6)
      .map((asset) => ({ type: "asset", code: asset.code, label: asset.label, category: asset.category }));
    const toolHits: Result[] = tools
      .filter((t) => t.label.toLowerCase().includes(q))
      .slice(0, 4)
      .map((t) => ({ type: "tool", id: t.id, label: t.label }));
    return [...assets, ...toolHits];
  }, [debounced]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setActiveIndex(0), [debounced]);

  const choose = (r: Result) => {
    setOpen(false);
    setQuery("");
    if (r.type === "asset") {
      router.push(`/varlik/${r.code}`);
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
          placeholder="Hisse, döviz, kripto, emtia veya haber ara..."
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
            if (r.type === "asset") {
              return (
                <button key={`a-${r.code}`} className={base} onMouseEnter={() => setActiveIndex(idx)} onClick={() => choose(r)}>
                  <TrendingUp className="text-bull h-4 w-4 shrink-0" />
                  <span className="app-text font-semibold">{r.code}</span>
                  <span className="app-muted truncate">{r.label}</span>
                  <span className="app-muted ml-auto text-xs">{r.category}</span>
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
