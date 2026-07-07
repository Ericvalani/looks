import type { LucideIcon } from "lucide-react";

export function SectionLabel({
  icon: Icon,
  children,
  hint,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-2">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted">
        <Icon className="h-3.5 w-3.5 self-center" strokeWidth={1.5} />
        {children}
      </p>
      {hint && <span className="shrink-0 text-[11px] font-normal text-muted/80">{hint}</span>}
    </div>
  );
}
