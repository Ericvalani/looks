"use client";

import { useEffect, useRef, useState } from "react";
import { History } from "lucide-react";
import {
  NewLookClient,
  type GenerateLookPayload,
  type GenerateOutcome,
  type NewLookPresets,
  type NewLookInitialPresetIds,
} from "./new-look-client";
import { ResultPanel, type DisplayLook } from "./result-panel";
import { HistoryCarousel } from "./history-carousel";
import { HistoryGrid } from "./history-grid";
import { GenerationModal } from "./generation-modal";
import { SectionLabel } from "@/components/ui/section-label";
import { getLook, deleteLook, type LookSummary } from "@/lib/actions/looks";
import type { PhotoResult } from "@/lib/actions/photos";

export function NewLookDashboard({
  initialModelFace,
  initialModelBody,
  initialScenePhotos,
  initialScenePhotoId,
  presets,
  initialPresetIds,
  initialHistory,
}: {
  initialModelFace: PhotoResult | null;
  initialModelBody: PhotoResult | null;
  initialScenePhotos: PhotoResult[];
  initialScenePhotoId: string | null;
  presets: NewLookPresets;
  initialPresetIds: NewLookInitialPresetIds;
  initialHistory: LookSummary[];
}) {
  const [history, setHistory] = useState<LookSummary[]>(initialHistory);
  const [currentLook, setCurrentLook] = useState<DisplayLook | null>(initialHistory[0] ?? null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopProgress() {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  }

  useEffect(() => stopProgress, []);

  async function handleGenerate(payload: GenerateLookPayload): Promise<GenerateOutcome> {
    setLoadingResult(true);
    setProgress(4);
    // Asymptotically approach ~92% while the real request is in flight; the
    // actual completion snaps it to 100%.
    stopProgress();
    progressTimer.current = setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + Math.max(0.5, (92 - p) * 0.06)));
    }, 360);

    try {
      const res = await fetch("/api/looks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        stopProgress();
        setLoadingResult(false);
        return { ok: false, error: json.error ?? "Falha ao gerar o look." };
      }

      const look = await getLook(json.lookId);
      if (!look) {
        stopProgress();
        setLoadingResult(false);
        return { ok: false, error: "Look gerado, mas não encontrado." };
      }

      stopProgress();
      setProgress(100);
      await new Promise((r) => setTimeout(r, 650));

      setCurrentLook(look);
      setHistory((prev) => [
        { id: look.id, status: look.status, signedUrl: look.signedUrl, createdAt: look.createdAt },
        ...prev,
      ]);
      setLoadingResult(false);
      return { ok: true };
    } catch {
      stopProgress();
      setLoadingResult(false);
      return { ok: false, error: "Falha de conexão ao gerar o look." };
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este look?")) return;
    await deleteLook(id);
    setHistory((prev) => prev.filter((item) => item.id !== id));
    setCurrentLook((prev) => (prev?.id === id ? null : prev));
  }

  function handleSelectHistory(item: LookSummary) {
    setCurrentLook(item);
  }

  return (
    <div className="mx-auto h-full w-full max-w-6xl">
      <div className="grid h-full gap-6 overflow-y-auto p-4 lg:grid-cols-2 lg:gap-10 lg:overflow-hidden lg:p-6">
        <section
          className="animate-rise px-0.5 lg:min-h-0 lg:overflow-y-auto lg:px-1"
          style={{ animationDelay: "1.95s" }}
        >
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Novo look</h1>
          <p className="mt-1.5 text-sm text-muted">
            Monte tudo e gere uma selfie de espelho ultra-realista.
          </p>
          <div className="mt-6 sm:mt-7">
            <NewLookClient
              initialModelFace={initialModelFace}
              initialModelBody={initialModelBody}
              initialScenePhotos={initialScenePhotos}
              initialScenePhotoId={initialScenePhotoId}
              presets={presets}
              initialPresetIds={initialPresetIds}
              onGenerate={handleGenerate}
            />
          </div>
        </section>

        <section
          className="animate-rise px-0.5 lg:min-h-0 lg:overflow-y-auto lg:px-1"
          style={{ animationDelay: "2.1s" }}
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Resultado</h2>
          <p className="mt-1.5 text-sm text-muted">A foto gerada aparece aqui.</p>
          <div className="mt-5 sm:mt-6">
            <ResultPanel look={currentLook} loading={loadingResult} onDelete={handleDelete} />
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <SectionLabel icon={History}>HISTÓRICO</SectionLabel>
              {history.length > 0 && (
                <button
                  onClick={() => setShowAllHistory((prev) => !prev)}
                  className="text-xs text-muted underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  {showAllHistory ? "Ver menos" : "Ver mais"}
                </button>
              )}
            </div>

            {showAllHistory ? (
              <HistoryGrid items={history} onSelect={handleSelectHistory} onDelete={handleDelete} />
            ) : (
              <HistoryCarousel items={history} onSelect={handleSelectHistory} onDelete={handleDelete} />
            )}
          </div>
        </section>
      </div>

      {loadingResult && <GenerationModal progress={progress} />}
    </div>
  );
}
