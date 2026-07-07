"use client";

import { type LucideIcon } from "lucide-react";
import { iconForPreset } from "@/lib/preset-icons";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface ChipPreset {
  id: string;
  label: string;
}

/** Grid of small square cards (icon + label) with internal scroll. Default is
 * a quiet hairline card; selected = a thin vivid blue outline only. */
export function PresetChips({
  presets,
  value,
  onChange,
  fallbackIcon,
}: {
  presets: ChipPreset[];
  value: string | null;
  onChange: (id: string) => void;
  fallbackIcon: LucideIcon;
}) {
  return (
    <div
      className="grid max-h-52 gap-2 overflow-y-auto pr-1"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(78px, 1fr))" }}
    >
      {presets.map((preset) => {
        const selected = value === preset.id;
        // Once something is picked, fade the rest so the chosen chip stands out
        // (still readable, and hover restores full opacity before switching).
        const dimmed = value !== null && !selected;
        const Icon = iconForPreset(preset.id, fallbackIcon);
        return (
          <button
            key={preset.id}
            onClick={() => onChange(preset.id)}
            className={cx(
              "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border bg-white/[0.03] p-2 text-center transition-all hover:opacity-100",
              selected
                ? "selected-ring text-foreground"
                : "border-line text-muted hover:border-line-strong hover:text-foreground",
              dimmed && "opacity-40"
            )}
          >
            <Icon
              className={cx("h-5 w-5 transition-colors", selected && "text-[color:var(--accent-blue-glow)]")}
              strokeWidth={1.5}
            />
            <span className="line-clamp-2 text-[10px] font-medium leading-tight">{preset.label}</span>
          </button>
        );
      })}
    </div>
  );
}
