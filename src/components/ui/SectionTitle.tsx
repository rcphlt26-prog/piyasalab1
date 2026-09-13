type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: Props) {
  return (
    <div className="mb-5">
      {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">{eyebrow}</p> : null}
      <h2 className="text-2xl font-bold text-slate-50 md:text-3xl">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{description}</p> : null}
    </div>
  );
}
