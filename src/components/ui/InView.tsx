"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Çocukları ekrana yaklaşınca bir kez render eder; ağır veri isteklerini ekran dışında başlatmamak için kullanılır. */
export function InView({ children, fallback, rootMargin = "200px", className }: { children: ReactNode; fallback?: ReactNode; rootMargin?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref} className={className}>{visible ? children : fallback ?? null}</div>;
}
