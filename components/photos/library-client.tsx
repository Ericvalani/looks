"use client";

import { useRef, useState } from "react";
import { Plus, X, Loader2, Star } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { pickAndUpload } from "@/lib/image/upload-photo";
import {
  deleteModelPhoto,
  deleteGarmentPhoto,
  deleteScenePhoto,
  type PhotoResult,
} from "@/lib/actions/photos";
import { setDefaultModelPhoto, setDefaultScenePhoto } from "@/lib/actions/preferences";
import type { GarmentZone, ModelPhotoKind } from "@/lib/supabase/database.types";
import { ZONE_LABELS, ZONE_ORDER } from "@/lib/zones";
import { MODEL_KIND_LABELS, MODEL_KIND_ORDER } from "@/lib/model-kinds";

type ModelPhoto = PhotoResult & { kind: ModelPhotoKind };
type GarmentPhoto = PhotoResult & { zone: GarmentZone };
type Tab = "model" | "garment" | "scene";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function LibraryClient({
  initialModelPhotos,
  initialGarmentPhotos,
  initialScenePhotos,
  initialDefaultModelFacePhotoId,
  initialDefaultModelBodyPhotoId,
  initialDefaultScenePhotoId,
}: {
  initialModelPhotos: ModelPhoto[];
  initialGarmentPhotos: GarmentPhoto[];
  initialScenePhotos: PhotoResult[];
  initialDefaultModelFacePhotoId: string | null;
  initialDefaultModelBodyPhotoId: string | null;
  initialDefaultScenePhotoId: string | null;
}) {
  const [tab, setTab] = useState<Tab>("model");
  const [modelKind, setModelKind] = useState<ModelPhotoKind>("rosto");
  const [zone, setZone] = useState<GarmentZone>("topo");
  const [modelPhotos, setModelPhotos] = useState(initialModelPhotos);
  const [garmentPhotos, setGarmentPhotos] = useState(initialGarmentPhotos);
  const [scenePhotos, setScenePhotos] = useState(initialScenePhotos);
  const [defaultFaceId, setDefaultFaceId] = useState(initialDefaultModelFacePhotoId);
  const [defaultBodyId, setDefaultBodyId] = useState(initialDefaultModelBodyPhotoId);
  const [defaultSceneId, setDefaultSceneId] = useState(initialDefaultScenePhotoId);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultIdForKind = (kind: ModelPhotoKind) => (kind === "rosto" ? defaultFaceId : defaultBodyId);

  async function handleToggleDefaultModel(kind: ModelPhotoKind, id: string) {
    const current = defaultIdForKind(kind);
    const nextId = current === id ? null : id;
    if (kind === "rosto") setDefaultFaceId(nextId);
    else setDefaultBodyId(nextId);
    try {
      await setDefaultModelPhoto(kind, nextId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao definir modelo padrão.");
    }
  }

  async function handleToggleDefaultScene(id: string) {
    const nextId = defaultSceneId === id ? null : id;
    setDefaultSceneId(nextId);
    try {
      await setDefaultScenePhoto(nextId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao definir cenário padrão.");
    }
  }

  const visibleModels = modelPhotos.filter((m) => m.kind === modelKind);
  const visibleGarments = garmentPhotos.filter((g) => g.zone === zone);

  async function handleFile(file: File) {
    setError(null);

    if (tab === "scene") {
      const label = window.prompt("Nome do cenário (ex: Quarto, Elevador, Sala):")?.trim();
      if (!label) return;
      setUploading(true);
      try {
        const result = await pickAndUpload(file, { type: "scene", label });
        setScenePhotos((prev) => [result, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao enviar a foto.");
      } finally {
        setUploading(false);
      }
      return;
    }

    setUploading(true);
    try {
      if (tab === "model") {
        const result = await pickAndUpload(file, { type: "model", kind: modelKind });
        setModelPhotos((prev) => [result as ModelPhoto, ...prev]);
      } else {
        const result = await pickAndUpload(file, { type: "garment", zone });
        setGarmentPhotos((prev) => [result as GarmentPhoto, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar a foto.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(kind: Tab, id: string) {
    setError(null);
    try {
      if (kind === "model") {
        await deleteModelPhoto(id);
        setModelPhotos((prev) => prev.filter((p) => p.id !== id));
      } else if (kind === "garment") {
        await deleteGarmentPhoto(id);
        setGarmentPhotos((prev) => prev.filter((p) => p.id !== id));
      } else {
        await deleteScenePhoto(id);
        setScenePhotos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir a foto.");
    }
  }

  const visibleItems =
    tab === "model" ? visibleModels : tab === "garment" ? visibleGarments : scenePhotos;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {(["model", "garment", "scene"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cx(
              "glass-chip px-4 py-2 text-sm",
              tab === t ? "bg-glass-strong" : "text-muted"
            )}
          >
            {t === "model" ? "Modelos" : t === "garment" ? "Peças" : "Cenários"}
          </button>
        ))}
      </div>

      {tab === "model" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {MODEL_KIND_ORDER.map((k) => (
            <button
              key={k}
              onClick={() => setModelKind(k)}
              className={cx(
                "glass-chip px-3 py-1.5 text-xs",
                modelKind === k ? "bg-glass-strong" : "text-muted"
              )}
            >
              {MODEL_KIND_LABELS[k]}
            </button>
          ))}
        </div>
      )}

      {tab === "garment" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {ZONE_ORDER.map((z) => (
            <button
              key={z}
              onClick={() => setZone(z)}
              className={cx(
                "glass-chip px-3 py-1.5 text-xs",
                zone === z ? "bg-glass-strong" : "text-muted"
              )}
            >
              {ZONE_LABELS[z]}
            </button>
          ))}
        </div>
      )}

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

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
              <span className="text-xs">Adicionar</span>
            </>
          )}
        </button>

        {visibleItems.map((item) => (
          <GlassCard key={item.id} className="relative aspect-[3/4] overflow-hidden p-0">
            <img
              src={item.signedUrl}
              alt={item.label ?? ""}
              className="h-full w-full object-cover"
            />
            {tab === "scene" && item.label && (
              <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-1 text-[10px]">
                {item.label}
              </span>
            )}
            {tab === "model" && (
              <button
                onClick={() => handleToggleDefaultModel(modelKind, item.id)}
                className="absolute left-2 top-2 rounded-full bg-black/50 p-2 backdrop-blur-sm active:scale-95"
                aria-label="Definir como padrão"
              >
                <Star
                  className="h-4 w-4"
                  strokeWidth={1.5}
                  fill={defaultIdForKind(modelKind) === item.id ? "currentColor" : "none"}
                />
              </button>
            )}
            {tab === "scene" && (
              <button
                onClick={() => handleToggleDefaultScene(item.id)}
                className="absolute left-2 top-2 rounded-full bg-black/50 p-2 backdrop-blur-sm active:scale-95"
                aria-label="Definir como padrão"
              >
                <Star
                  className="h-4 w-4"
                  strokeWidth={1.5}
                  fill={defaultSceneId === item.id ? "currentColor" : "none"}
                />
              </button>
            )}
            <button
              onClick={() => handleDelete(tab, item.id)}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-2 backdrop-blur-sm active:scale-95"
              aria-label="Excluir"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </GlassCard>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}
