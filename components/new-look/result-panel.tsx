"use client";

import { ImageOff, Trash2, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { DownloadButton } from "@/components/looks/download-button";
import { Button } from "@/components/ui/button";
import { GameOfLifeLoader } from "./game-of-life-loader";
import type { LookStatus } from "@/lib/supabase/database.types";

export interface DisplayLook {
  id: string;
  status: LookStatus;
  signedUrl: string | null;
  errorMessage?: string | null;
}

const FRAME = "mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-[20px]";

export function ResultPanel({
  look,
  loading,
  onDelete,
}: {
  look: DisplayLook | null;
  loading: boolean;
  onDelete: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className={`${FRAME} frame-breathe relative glass-card p-0`}>
        <GameOfLifeLoader className="h-full w-full" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-[color:var(--accent-blue-glow)]" strokeWidth={1.5} />
          <p className="text-sm text-muted">Gerando…</p>
        </div>
      </div>
    );
  }

  if (!look) {
    return (
      <GlassCard className={`${FRAME} flex flex-col items-center justify-center gap-3 text-center`}>
        <ImageOff className="h-8 w-8 text-muted" strokeWidth={1.5} />
        <p className="px-6 text-sm text-muted">
          Nenhum resultado ainda. Monte um look à esquerda e gere para ver aqui.
        </p>
      </GlassCard>
    );
  }

  if (look.status === "failed") {
    return (
      <GlassCard className={`${FRAME} flex flex-col items-center justify-center gap-3 p-6 text-center`}>
        <p className="text-sm font-medium">Não foi possível gerar este look.</p>
        {look.errorMessage && <p className="text-xs text-muted">{look.errorMessage}</p>}
      </GlassCard>
    );
  }

  if (!look.signedUrl) {
    return (
      <GlassCard className={`${FRAME} flex items-center justify-center text-center`}>
        <p className="text-sm text-muted">Ainda processando…</p>
      </GlassCard>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <GlassCard className="aspect-[9/16] w-full overflow-hidden p-0">
        <img src={look.signedUrl} alt="Look gerado" className="h-full w-full object-cover" />
      </GlassCard>
      <div className="flex gap-3">
        <DownloadButton url={look.signedUrl} filename={`look-${look.id}.png`} className="flex-1" />
        <Button variant="glass" onClick={() => onDelete(look.id)} className="flex-1">
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          Excluir
        </Button>
      </div>
    </div>
  );
}
