import { type ComponentProps } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-opacity disabled:opacity-40 disabled:pointer-events-none";

const variants = {
  primary: "bg-foreground text-background hover:opacity-90",
  glass: "glass-chip text-foreground hover:bg-glass-strong",
  ghost: "text-muted hover:text-foreground",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof variants }) {
  return (
    <button className={cx(base, variants[variant], className)} {...props} />
  );
}
