"use client";

import { Eye } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { PhotoResult } from "@/lib/actions/photos";
import type { GarmentZone } from "@/lib/supabase/database.types";
import { ZONE_ICONS } from "./garment-zone-grid";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Cell({
  zone,
  photo,
  className,
}: {
  zone: GarmentZone;
  photo?: PhotoResult;
  className?: string;
}) {
  const Icon = ZONE_ICONS[zone];
  return (
    <div className={cx("overflow-hidden", photo ? "hairline" : "hotspot-empty", className)}>
      {photo ? (
        <img src={photo.signedUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted/50">
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

/** Small stacked mockup of the selected pieces in body order (head, torso,
 * legs, feet), purely visual — not clickable. Approximates "how it looks on
 * a body" using the real photos, without any actual image compositing. */
export function GarmentPreviewStack({
  garments,
}: {
  garments: Partial<Record<GarmentZone, PhotoResult[]>>;
}) {
  const cabeca = garments.cabeca?.[0];
  const casaco = garments.casaco?.[0];
  const conjunto = garments.conjunto?.[0];
  const topo = garments.topo?.[0];
  const inferior = garments.inferior?.[0];
  const calcado = garments.calcado?.[0];
  const acessorio = garments.acessorio?.[0];
  const hasConjunto = Boolean(conjunto);

  return (
    <div className="w-full shrink-0 sm:w-32">
      <div className="mb-2 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest text-muted">
        <Eye className="h-3 w-3" strokeWidth={1.5} />
        Prévia
      </div>

      <GlassCard className="relative flex flex-col gap-1 p-2">
        <Cell zone="cabeca" photo={cabeca} className="aspect-square rounded-lg" />

        {hasConjunto ? (
          <Cell zone="conjunto" photo={conjunto} className="aspect-[3/5] rounded-lg" />
        ) : (
          <>
            <div className="flex gap-1">
              <Cell zone="casaco" photo={casaco} className="aspect-square flex-1 rounded-lg" />
              <Cell zone="topo" photo={topo} className="aspect-square flex-1 rounded-lg" />
            </div>
            <Cell zone="inferior" photo={inferior} className="aspect-[4/3] rounded-lg" />
          </>
        )}

        <Cell zone="calcado" photo={calcado} className="aspect-[3/1] rounded-lg" />

        {acessorio && (
          <div className="absolute -right-2 top-8 h-9 w-9 overflow-hidden rounded-full ring-2 ring-background">
            <img src={acessorio.signedUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </GlassCard>
    </div>
  );
}
