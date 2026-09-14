"use client";

import { Star } from "lucide-react";

/**
 * İzleme listesi yıldız butonu. Bir Link içine yerleştirildiğinde
 * tıklama olayının detay sayfasına yönlendirmesini engeller.
 */
export function WatchStar({
  watched,
  onToggle,
  size = 16,
  className = "",
}: {
  watched: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={watched ? "İzleme listesinden çıkar" : "İzleme listesine ekle"}
      title={watched ? "İzleme listesinden çıkar" : "İzleme listesine ekle"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`inline-flex items-center justify-center rounded-md p-1 transition hover:scale-110 ${className}`}
    >
      <Star
        style={{ width: size, height: size }}
        className={watched ? "text-gold" : "app-muted"}
        fill={watched ? "currentColor" : "none"}
      />
    </button>
  );
}
