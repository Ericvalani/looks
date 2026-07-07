"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { pickAndUpload, type UploadTarget } from "@/lib/image/upload-photo";
import { listModelPhotos, listScenePhotos, type PhotoResult } from "@/lib/actions/photos";
import type { ModelPhotoKind } from "@/lib/supabase/database.types";
import { MODEL_KIND_LABELS } from "@/lib/model-kinds";

type Target = { type: "model"; kind: ModelPhotoKind } | { type: "scene" };

type Selected = PhotoResult & { kind?: ModelPhotoKind };

interface PhotoPickerSheetProps {
  target: Target;
  onClose: () => void;
  onSelected: (photo: Selected) => void;
}

/** Single-select sheet for model (rosto/corpo) and scene photos — pick or
 * upload one, and the sheet closes. Garment pieces use GarmentPickerSheet
 * instead, since a piece can carry more than one reference photo (angles). */
export function PhotoPickerSheet({ target, onClose, onSelected }: PhotoPickerSheetProps) {
  const [items, setItems] = useState<Selected[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const targetKey = target.type === "model" ? `model:${target.kind}` : "scene";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = target.type === "model" ? await listModelPhotos(target.kind) : await listScenePhotos();
      if (!cancelled) setItems(list);
    })().catch((err) => setError(err.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey]);

  async function handleFile(file: File) {
    setError(null);

    let uploadTarget: UploadTarget = target;
    if (target.type === "scene") {
      const label = window.prompt("Nome do cenário (ex: Quarto, Elevador, Sala):")?.trim();
      if (!label) return;
      uploadTarget = { type: "scene", label };
    }

    setUploading(true);
    try {
      const result = await pickAndUpload(file, uploadTarget);
      onSelected(result);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar a foto.");
    } finally {
      setUploading(false);
    }
  }

  const title = target.type === "model" ? MODEL_KIND_LABELS[target.kind] : "Cenário";
  const newPhotoLabel = target.type === "model" ? MODEL_KIND_LABELS[target.kind] : "Nova foto";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <GlassCard className="w-full max-w-md rounded-b-none p-6 sm:rounded-b-[20px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted">Enviando para</p>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="hairline rounded-full p-2">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
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

        <div className="mt-5 grid grid-cols-3 gap-3 pb-safe">
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
                <span className="px-1 text-center text-xs leading-tight">{newPhotoLabel}</span>
              </>
            )}
          </button>

          {items?.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelected(item);
                onClose();
              }}
              className="hairline relative aspect-[3/4] overflow-hidden rounded-2xl"
            >
              {/* Supabase signed URLs are ephemeral/dynamic; plain <img> avoids
                  coupling next/image remotePatterns to a specific project host. */}
              <img
                src={item.signedUrl}
                alt={item.label ?? ""}
                className="h-full w-full object-cover"
              />
              {target.type === "scene" && item.label && (
                <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1 text-[10px]">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </GlassCard>
    </div>
  );
}
