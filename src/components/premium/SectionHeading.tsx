interface SectionHeadingProps {
  eyebrow: string;
  title: string;
}

// Spans the full bento row to introduce the section beneath it.
export default function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="col-span-full">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
    </div>
  );
}
