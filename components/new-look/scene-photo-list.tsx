"use client";

import { useRef, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { pickAndUpload } from "@/lib/image/upload-photo";
import type { PhotoResult } from "@/lib/actions/photos";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ScenePhotoList({
  photos,
  selectedId,
  onSelect,
  onUploaded,
}: {
  photos: PhotoResult[];
  selectedId: string | null;
  onSelect: (photo: PhotoResult) => void;
  onUploaded: (photo: PhotoResult) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const label = window.prompt("Nome do cenário (ex: Quarto, Elevador, Sala):")?.trim();
    if (!label) return;

    setError(null);
    setUploading(true);
    try {
      const result = await pickAndUpload(file, { type: "scene", label });
      onUploaded(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar a foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
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
      <div
        className="grid max-h-48 gap-2 overflow-y-auto pr-1"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))" }}
      >
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="hotspot-empty flex aspect-square items-center justify-center rounded-2xl text-muted"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>

        {photos.map((photo) => {
          const selected = selectedId === photo.id;
          // Fade the other scenes once one is chosen; hover brings it back.
          const dimmed = selectedId !== null && !selected;
          return (
            <button
              key={photo.id}
              onClick={() => onSelect(photo)}
              title={photo.label ?? undefined}
              className={cx(
                "aspect-square overflow-hidden rounded-2xl border transition-all hover:opacity-100",
                selected ? "selected-ring" : "border-line hover:border-line-strong",
                dimmed && "opacity-40"
              )}
            >
              <img src={photo.signedUrl} alt={photo.label ?? ""} className="h-full w-full object-cover" />
            </button>
          );
        })}
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
