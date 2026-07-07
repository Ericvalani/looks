import { type ComponentProps } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function GlassCard({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("glass-card", className)} {...props} />;
}
