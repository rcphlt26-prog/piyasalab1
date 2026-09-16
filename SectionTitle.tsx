type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: Props) {
  return (
    <div className="mb-5">
      {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p> : null}
      <h2 className="app-text text-2xl font-bold md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      {description ? <p className="app-text-secondary mt-2 max-w-3xl text-sm leading-6">{description}</p> : null}
    </div>
  );
}
