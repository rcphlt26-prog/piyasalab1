"use client";

import { toPng } from "html-to-image";
import { Download, Image as ImageIcon, Share2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type Props = {
  title: string;
  subtitle: string;
  metrics: Array<{ label: string; value: string }>;
  shareText: string;
};

export function ShareCard({ title, subtitle, metrics, shareText }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const xIntent = useMemo(() => {
    const text = encodeURIComponent(`${shareText} \n#Piyasalab`);
    const url = encodeURIComponent("https://piyasalab.com.tr");
    return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  }, [shareText]);

  const generate = async (size: "square" | "landscape") => {
    if (!cardRef.current) return;
    const options =
      size === "square"
        ? { width: 1080, height: 1080, pixelRatio: 2 }
        : { width: 1200, height: 630, pixelRatio: 2 };
    const png = await toPng(cardRef.current, {
      cacheBust: true,
      backgroundColor: "#020617",
      ...options,
    });
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
      await navigator.share({
        title,
        text: shareText,
        files: [file],
      });
    } catch {
      // kullanıcı iptal etmiş olabilir
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div ref={cardRef} className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-950 to-slate-900 p-5">
        <div className="mb-3 flex items-center justify-between">
          <strong className="text-lg text-emerald-400">Piyasalab</strong>
          <span className="text-xs text-slate-400">piyasalab.com.tr</span>
        </div>
        <h4 className="text-xl font-bold text-slate-100">{title}</h4>
        <p className="mb-4 mt-1 text-sm text-slate-300">{subtitle}</p>
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-2">
              <p className="text-[11px] text-slate-400">{m.label}</p>
              <p className="text-sm font-semibold text-slate-100">{m.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <button onClick={() => generate("square")} className="rounded-lg border border-slate-700 px-3 py-2 hover:border-emerald-400">
          <ImageIcon className="mr-1 inline h-3.5 w-3.5" /> Görsel Oluştur
        </button>
        <button onClick={() => generate("landscape")} className="rounded-lg border border-slate-700 px-3 py-2 hover:border-sky-400">
          1200×630 Oluştur
        </button>
        <button onClick={downloadPng} disabled={!imageUrl} className="rounded-lg border border-slate-700 px-3 py-2 disabled:opacity-40">
          <Download className="mr-1 inline h-3.5 w-3.5" /> PNG indir
        </button>
        {typeof navigator !== "undefined" && "share" in navigator ? (
          <button onClick={nativeShare} disabled={!imageUrl} className="rounded-lg border border-slate-700 px-3 py-2 disabled:opacity-40">
            <Share2 className="mr-1 inline h-3.5 w-3.5" /> Paylaş
          </button>
        ) : null}
        <a href={xIntent} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-700 px-3 py-2 hover:border-slate-500">
          X&apos;te Paylaş
        </a>
      </div>
      {imageUrl ? <p className="text-xs text-emerald-300">Kart hazır. PNG indir veya paylaş butonunu kullanabilirsiniz.</p> : null}
    </div>
  );
}
