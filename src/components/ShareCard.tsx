"use client";

import { toPng } from "html-to-image";
import { Download, Image as ImageIcon, Share2, TrendingUp } from "lucide-react";
import { useMemo, useRef, useState } from "react";

export type ShareTemplate = "getiri" | "karne" | "regret" | "tarot" | "tavan";

type Props = {
  title: string;
  subtitle: string;
  metrics: Array<{ label: string; value: string }>;
  shareText: string;
  template?: ShareTemplate;
  highlight?: { label: string; value: string };
};

const templates: Record<ShareTemplate, { name: string; gradient: string }> = {
  getiri: { name: "Getiri Özeti", gradient: "linear-gradient(135deg, #1e3a8a, #10b981)" },
  karne: { name: "Hisse Karnesi", gradient: "linear-gradient(135deg, #0f172a, #1d4ed8)" },
  regret: { name: "Pişmanlık Skoru", gradient: "linear-gradient(135deg, #7f1d1d, #f43f5e)" },
  tarot: { name: "Tarot Falı", gradient: "linear-gradient(135deg, #4c1d95, #a78bfa)" },
  tavan: { name: "Tavan Serisi", gradient: "linear-gradient(135deg, #78350f, #f59e0b)" },
};

export function ShareCard({ title, subtitle, metrics, shareText, template = "getiri", highlight }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [selected, setSelected] = useState<ShareTemplate>(template);

  const xIntent = useMemo(() => {
    const text = encodeURIComponent(`${shareText} \n#Piyasalab`);
    const url = encodeURIComponent("https://piyasalab.com.tr");
    return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  }, [shareText]);

  const today = useMemo(() => new Date().toLocaleDateString("tr-TR"), []);

  const generate = async (size: "square" | "landscape") => {
    if (!cardRef.current) return;
    const options =
      size === "square"
        ? { width: 1080, height: 1080, pixelRatio: 2 }
        : { width: 1200, height: 630, pixelRatio: 2 };
    const png = await toPng(cardRef.current, { cacheBust: true, ...options });
    setImageUrl(png);
  };

  const downloadPng = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "piyasalab-sonuc-karti.png";
    a.click();
  };

  const nativeShare = async () => {
    if (!imageUrl || !("share" in navigator)) return;
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], "piyasalab.png", { type: "image/png" });
      await navigator.share({ title, text: shareText, files: [file] });
    } catch {
      // kullanıcı iptal etmiş olabilir
    }
  };

  return (
    <div className="app-surface-2 app-border space-y-3 rounded-2xl border p-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(templates) as ShareTemplate[]).map((key) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition ${
              selected === key ? "border-transparent text-white" : "app-border app-text-secondary"
            }`}
            style={selected === key ? { background: templates[key].gradient } : undefined}
          >
            <span className="h-3 w-5 rounded" style={{ background: templates[key].gradient }} />
            {templates[key].name}
          </button>
        ))}
      </div>

      <div
        ref={cardRef}
        className="rounded-2xl p-6 text-white"
        style={{ background: templates[selected].gradient }}
      >
        <div className="mb-4 flex items-center justify-between">
          <strong className="flex items-center gap-1 text-lg">
            <TrendingUp className="h-5 w-5" /> Piyasalab
          </strong>
          <span className="text-xs opacity-80">piyasalab.com.tr</span>
        </div>
        <h4 className="text-2xl font-bold">{title}</h4>
        <p className="mb-4 mt-1 text-sm opacity-90">{subtitle}</p>
        {highlight ? (
          <div className="mb-4 rounded-xl bg-white/15 p-4 text-center">
            <p className="text-xs uppercase tracking-wide opacity-80">{highlight.label}</p>
            <p className="text-4xl font-black">{highlight.value}</p>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl bg-white/10 p-2">
              <p className="text-[11px] opacity-80">{m.label}</p>
              <p className="text-sm font-semibold">{m.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] opacity-70">{today} · Yatırım tavsiyesi değildir</p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button onClick={() => generate("square")} className="app-border app-text rounded-lg border px-3 py-2 hover:border-[var(--color-bull)]">
          <ImageIcon className="mr-1 inline h-3.5 w-3.5" /> Kare 1080×1080
        </button>
        <button onClick={() => generate("landscape")} className="app-border app-text rounded-lg border px-3 py-2 hover:border-[var(--color-primary-light)]">
          Yatay 1200×630
        </button>
        <button onClick={downloadPng} disabled={!imageUrl} className="app-border app-text rounded-lg border px-3 py-2 disabled:opacity-40">
          <Download className="mr-1 inline h-3.5 w-3.5" /> PNG indir
        </button>
        {typeof navigator !== "undefined" && "share" in navigator ? (
          <button onClick={nativeShare} disabled={!imageUrl} className="app-border app-text rounded-lg border px-3 py-2 disabled:opacity-40">
            <Share2 className="mr-1 inline h-3.5 w-3.5" /> Paylaş
          </button>
        ) : null}
        <a href={xIntent} target="_blank" rel="noreferrer" className="app-border app-text rounded-lg border px-3 py-2 hover:border-[var(--border-strong)]">
          X&apos;te Paylaş
        </a>
      </div>
      {imageUrl ? <p className="text-bull text-xs">Kart hazır. PNG indir veya paylaş butonunu kullanabilirsiniz.</p> : null}
    </div>
  );
}
