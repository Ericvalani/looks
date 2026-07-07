"use client";

import { useState } from "react";
import { Download, Trash2, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { downloadUrl } from "@/lib/image/download";
import type { LookSummary } from "@/lib/actions/looks";

export function HistoryGrid({
  items,
  onSelect,
  onDelete,
}: {
  items: LookSummary[];
  onSelect: (item: LookSummary) => void;
  onDelete: (id: string) => void;
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (items.length === 0) {
    return <p className="text-sm text-muted">Nenhum look gerado ainda.</p>;
  }

  async function handleDownload(item: LookSummary) {
    if (!item.signedUrl) return;
    setDownloadingId(item.id);
    try {
      await downloadUrl(item.signedUrl, `look-${item.id}.png`);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <GlassCard key={item.id} className="relative aspect-[9/16] overflow-hidden p-0">
          <button onClick={() => onSelect(item)} className="h-full w-full">
            {item.signedUrl ? (
              <img src={item.signedUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                {item.status === "failed" ? "Falhou" : "..."}
              </div>
            )}
          </button>

          {item.signedUrl && (
            <button
              onClick={() => handleDownload(item)}
              disabled={downloadingId === item.id}
              className="absolute left-2 top-2 rounded-full bg-black/50 p-2 backdrop-blur-sm active:scale-95"
              aria-label="Baixar"
            >
              {downloadingId === item.id ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Download className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-2 backdrop-blur-sm active:scale-95"
            aria-label="Excluir"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </GlassCard>
      ))}
    </div>
  );
}
