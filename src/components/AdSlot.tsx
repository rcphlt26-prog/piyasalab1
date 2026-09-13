type Props = {
  label: string;
  width: number;
  height: number;
  className?: string;
};

export function AdSlot({ label, width, height, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-2 ${className}`}
      style={{ minHeight: height + 18, minWidth: Math.min(width, 320) }}
      data-ad-slot={label}
      data-ad-width={width}
      data-ad-height={height}
      aria-label={`${label} reklam alanı`}
    >
      <div className="flex h-full min-h-[120px] items-center justify-center rounded-lg bg-slate-800/40 text-center text-xs text-slate-400">
        {label} · {width}x{height}
      </div>
      {/* Gerçek AdSense için README'deki adımları uygulayarak yayıncı ve slot kimliklerini girin. */}
    </div>
  );
}
