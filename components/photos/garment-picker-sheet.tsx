"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, Loader2, Check, Link2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { pickAndUpload } from "@/lib/image/upload-photo";
import { listGarmentPhotos, importGarmentFromUrl, type PhotoResult } from "@/lib/actions/photos";
import type { GarmentZone } from "@/lib/supabase/database.types";
import { ZONE_LABELS } from "@/lib/zones";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface GarmentPickerSheetProps {
  zone: GarmentZone;
  initialSelectedIds: string[];
  onClose: () => void;
  onConfirm: (photos: PhotoResult[]) => void;
}

/** Multi-select sheet for a garment zone: pick and/or upload one or more
 * angle photos of the same real piece, then confirm to attach all of them
 * to that zone for this look. */
export function GarmentPickerSheet({
  zone,
  initialSelectedIds,
  onClose,
  onConfirm,
}: GarmentPickerSheetProps) {
  const [items, setItems] = useState<PhotoResult[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  useEffect(() => {
    let cancelled = false;
    listGarmentPhotos(zone)
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch((err) => setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [zone]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Drag & drop: dragDepth tracks nested enter/leave so the overlay doesn't
  // flicker when the cursor moves over child elements.
  function onDragEnter(e: React.DragEvent) {
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    e.preventDefault();
    dragDepth.current += 1;
    setDragActive(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragActive(false);
    }
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dragDepth.current = 0;
    setDragActive(false);
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) handleFile(file);
    else if (e.dataTransfer.files.length > 0) setError("Arraste um arquivo de imagem.");
  }

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const result = await pickAndUpload(file, { type: "garment", zone });
      setItems((prev) => [result, ...(prev ?? [])]);
      setSelectedIds((prev) => new Set(prev).add(result.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar a foto.");
    } finally {
      setUploading(false);
    }
  }

  async function handleImportUrl() {
    const trimmed = url.trim();
    if (!trimmed || importing) return;
    setError(null);
    setImporting(true);
    try {
      const result = await importGarmentFromUrl(trimmed, zone);
      setItems((prev) => [result, ...(prev ?? [])]);
      setSelectedIds((prev) => new Set(prev).add(result.id));
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não consegui importar desse link.");
    } finally {
      setImporting(false);
    }
  }

  function handleConfirm() {
    const chosen = (items ?? []).filter((item) => selectedIds.has(item.id));
    onConfirm(chosen);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <GlassCard
        onDragEnter={onDragEnter}
        onDragOver={(e) => {
          if (Array.from(e.dataTransfer.types).includes("Files")) e.preventDefault();
        }}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-b-none p-6 sm:rounded-b-[20px]"
      >
        {dragActive && (
          <div className="pointer-events-none absolute inset-2 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[color:var(--accent-blue)] bg-background/80 backdrop-blur-sm">
            <Plus className="h-7 w-7 text-[color:var(--accent-blue-glow)]" strokeWidth={1.5} />
            <p className="text-sm font-medium">Solte a foto aqui</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted">Enviando para</p>
            <h2 className="text-lg font-semibold tracking-tight">{ZONE_LABELS[zone]}</h2>
          </div>
          <button onClick={onClose} className="hairline rounded-full p-2">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <p className="mt-1 text-xs text-muted">
          Selecione, arraste uma foto para cá ou cole o link — envie vários ângulos da mesma peça
          para o resultado ficar mais preciso.
        </p>

        {/* Import straight from a product link (Shein etc.) — best effort. */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-line px-3 py-2">
            <Link2 className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} />
            <input
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleImportUrl();
                }
              }}
              placeholder="Colar link da peça (Shein, etc.)"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
          <Button
            variant="glass"
            onClick={handleImportUrl}
            disabled={!url.trim() || importing}
            className="shrink-0 px-4 py-2"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : "Puxar"}
          </Button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        <div className="mt-4 grid grid-cols-3 gap-3 overflow-y-auto pb-safe">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="hotspot-empty flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-2xl text-muted"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
            ) : (
              <>
                <Plus className="h-5 w-5" strokeWidth={1.5} />
                <span className="px-1 text-center text-xs leading-tight">Novo ângulo</span>
              </>
            )}
          </button>

          {items?.map((item) => {
            const selected = selectedIds.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={cx(
                  "relative aspect-[3/4] overflow-hidden rounded-2xl",
                  selected ? "ring-2 ring-foreground" : "hairline"
                )}
              >
                <img src={item.signedUrl} alt="" className="h-full w-full object-cover" />
                {selected && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-foreground p-1">
                    <Check className="h-3 w-3 text-background" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <Button onClick={handleConfirm} disabled={selectedIds.size === 0} className="mt-4 w-full">
          {selectedIds.size > 0
            ? `Usar ${selectedIds.size} foto${selectedIds.size > 1 ? "s" : ""}`
            : "Selecione ao menos uma foto"}
        </Button>
      </GlassCard>
    </div>
  );
}
