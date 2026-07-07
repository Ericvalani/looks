import { Check } from "lucide-react";

/** Header for a grouped step block: a numbered badge, a title and a short
 * subtitle. Flips the badge to a check once the step is satisfied so the user
 * can see their progress down the form at a glance. */
export function StepHeader({
  index,
  title,
  subtitle,
  done = false,
}: {
  index: number;
  title: string;
  subtitle?: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="step-index flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-muted transition-colors">
        {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : index}
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold leading-tight tracking-tight">{title}</h3>
        {subtitle && <p className="truncate text-[11px] leading-tight text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
