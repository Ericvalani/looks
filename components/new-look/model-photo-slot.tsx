"use client";

import { ScanFace, PersonStanding } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { PhotoResult } from "@/lib/actions/photos";
import type { ModelPhotoKind } from "@/lib/supabase/database.types";
import { MODEL_KIND_LABELS } from "@/lib/model-kinds";

const ICONS: Record<ModelPhotoKind, typeof ScanFace> = {
  rosto: ScanFace,
  corpo: PersonStanding,
};

const HINTS: Record<ModelPhotoKind, string> = {
  rosto: "Foto de rosto nítida",
  corpo: "Foto de corpo inteiro",
};

export function ModelPhotoSlot({
  kind,
  photo,
  onOpen,
}: {
  kind: ModelPhotoKind;
  photo: PhotoResult | null;
  onOpen: () => void;
}) {
  const Icon = ICONS[kind];

  return (
    <button onClick={onOpen} className="group w-full min-w-0">
      <GlassCard className="flex min-w-0 items-center gap-3 p-3 text-left transition-colors group-hover:bg-glass-strong sm:gap-4 sm:p-4">
        <div
          className={
            "h-12 w-12 shrink-0 overflow-hidden rounded-xl border sm:h-16 sm:w-16 sm:rounded-2xl " +
            (photo ? "border-[color:var(--accent-blue)]/60" : "hotspot-empty")
          }
        >
          {photo ? (
            <img src={photo.signedUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted transition-colors group-hover:text-foreground">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{MODEL_KIND_LABELS[kind]}</p>
          <p className="truncate text-[11px] text-muted sm:text-xs">
            {photo ? "Toque para trocar" : HINTS[kind]}
          </p>
        </div>
      </GlassCard>
    </button>
  );
}
