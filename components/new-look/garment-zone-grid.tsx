"use client";

import { X, HatGlasses, Layers, Combine, Shirt, PersonStanding, Footprints, Watch } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { PhotoResult } from "@/lib/actions/photos";
import type { GarmentZone } from "@/lib/supabase/database.types";
import { ZONE_LABELS, ZONE_ORDER } from "@/lib/zones";

export const ZONE_ICONS: Record<GarmentZone, typeof Shirt> = {
  cabeca: HatGlasses,
  casaco: Layers,
  conjunto: Combine,
  topo: Shirt,
  inferior: PersonStanding,
  calcado: Footprints,
  acessorio: Watch,
};

export function GarmentZoneGrid({
  garments,
  onOpenZone,
  onRemoveZone,
}: {
  garments: Partial<Record<GarmentZone, PhotoResult[]>>;
  onOpenZone: (zone: GarmentZone) => void;
  onRemoveZone: (zone: GarmentZone) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ZONE_ORDER.map((zone) => {
        const photos = garments[zone];
        const cover = photos?.[0];
        const Icon = ZONE_ICONS[zone];

        const filled = !!(photos && photos.length > 0);

        return (
          <div key={zone} className="relative min-w-0">
            <button onClick={() => onOpenZone(zone)} className="group w-full min-w-0">
              <GlassCard className="flex min-w-0 items-center gap-3 p-3 text-left transition-colors group-hover:bg-glass-strong">
                <div
                  className={
                    "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border " +
                    (filled ? "border-[color:var(--accent-blue)]/60" : "border-line")
                  }
                >
                  {cover ? (
                    <img src={cover.signedUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Icon
                      className="h-5 w-5 text-muted transition-colors group-hover:text-foreground"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{ZONE_LABELS[zone]}</p>
                  <p className="truncate text-[11px] text-muted">
                    {filled
                      ? `${photos!.length} foto${photos!.length > 1 ? "s" : ""}`
                      : "Toque para adicionar"}
                  </p>
                </div>
              </GlassCard>
            </button>

            {filled && (
              <button
                onClick={() => onRemoveZone(zone)}
                className="absolute -right-1.5 -top-1.5 rounded-full border border-line bg-black/80 p-1 transition-colors hover:bg-black"
                aria-label={`Remover ${ZONE_LABELS[zone]}`}
              >
                <X className="h-3 w-3" strokeWidth={1.5} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
