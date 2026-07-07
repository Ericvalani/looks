"use client";

import { useState } from "react";
import {
  MapPin,
  Sparkles,
  SunMoon,
  Smile,
  ArrowLeftRight,
  Sofa,
  PersonStanding,
  Hand,
  Camera,
  Scissors,
  Waves,
  Palette,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { StepHeader } from "./step-header";
import { ModelPhotoSlot } from "./model-photo-slot";
import { ScenePhotoList } from "./scene-photo-list";
import { PresetChips, type ChipPreset } from "./preset-chips";
import { GarmentZoneGrid } from "./garment-zone-grid";
import { GarmentPreviewStack } from "./garment-preview-stack";
import { PhotoPickerSheet } from "@/components/photos/photo-picker-sheet";
import { GarmentPickerSheet } from "@/components/photos/garment-picker-sheet";
import type { PhotoResult } from "@/lib/actions/photos";
import type { GarmentZone, ModelPhotoKind } from "@/lib/supabase/database.types";
import {
  setDefaultModelPhoto,
  setDefaultScenePhoto,
  setDefaultScenePreset,
  setDefaultPosePreset,
  setDefaultLightingPreset,
  setDefaultExpressionPreset,
  setDefaultDirectionPreset,
  setDefaultEnvironmentPreset,
  setDefaultHandPreset,
  setDefaultShotPreset,
  setDefaultHairstylePreset,
  setDefaultHairTexturePreset,
  setDefaultMakeupPreset,
  setDefaultSkinPreset,
} from "@/lib/actions/preferences";

type ModelTarget = { type: "model"; kind: ModelPhotoKind };

export interface GenerateLookPayload {
  modelFacePhotoId: string;
  modelBodyPhotoId: string;
  // Exactly one of these is set, depending on the scene mode.
  scenePhotoId?: string;
  scenePresetId?: string;
  posePresetId: string;
  lightingPresetId: string;
  expressionPresetId: string;
  directionPresetId: string;
  environmentPresetId: string;
  handPresetId: string;
  shotPresetId: string;
  hairstylePresetId: string;
  hairTexturePresetId: string;
  makeupPresetId: string;
  skinPresetId: string;
  garments: Record<string, string[]>;
}

export interface GenerateOutcome {
  ok: boolean;
  error?: string;
}

export interface NewLookPresets {
  pose: ChipPreset[];
  lighting: ChipPreset[];
  expression: ChipPreset[];
  direction: ChipPreset[];
  environment: ChipPreset[];
  hand: ChipPreset[];
  shot: ChipPreset[];
  scene: ChipPreset[];
  hairstyle: ChipPreset[];
  hairTexture: ChipPreset[];
  makeup: ChipPreset[];
  skin: ChipPreset[];
}

export interface NewLookInitialPresetIds {
  pose: string | null;
  lighting: string | null;
  expression: string | null;
  direction: string | null;
  environment: string | null;
  hand: string | null;
  shot: string | null;
  scene: string | null;
  hairstyle: string | null;
  hairTexture: string | null;
  makeup: string | null;
  skin: string | null;
}

export function NewLookClient({
  initialModelFace = null,
  initialModelBody = null,
  initialScenePhotos,
  initialScenePhotoId = null,
  presets,
  initialPresetIds,
  onGenerate,
}: {
  initialModelFace?: PhotoResult | null;
  initialModelBody?: PhotoResult | null;
  initialScenePhotos: PhotoResult[];
  initialScenePhotoId?: string | null;
  presets: NewLookPresets;
  initialPresetIds: NewLookInitialPresetIds;
  onGenerate: (payload: GenerateLookPayload) => Promise<GenerateOutcome>;
}) {
  const [modelFace, setModelFace] = useState<PhotoResult | null>(initialModelFace);
  const [modelBody, setModelBody] = useState<PhotoResult | null>(initialModelBody);
  const [scenePhotos, setScenePhotos] = useState<PhotoResult[]>(initialScenePhotos);
  const [scenePhotoId, setScenePhotoId] = useState<string | null>(initialScenePhotoId);

  const [poseId, setPoseId] = useState<string | null>(initialPresetIds.pose ?? presets.pose[0]?.id ?? null);
  const [lightingId, setLightingId] = useState<string | null>(
    initialPresetIds.lighting ?? presets.lighting[0]?.id ?? null
  );
  const [expressionId, setExpressionId] = useState<string | null>(
    initialPresetIds.expression ?? presets.expression[0]?.id ?? null
  );
  const [directionId, setDirectionId] = useState<string | null>(
    initialPresetIds.direction ?? presets.direction[0]?.id ?? null
  );
  const [environmentId, setEnvironmentId] = useState<string | null>(
    initialPresetIds.environment ?? presets.environment[0]?.id ?? null
  );
  const [handId, setHandId] = useState<string | null>(
    initialPresetIds.hand ?? presets.hand[0]?.id ?? null
  );
  const [shotId, setShotId] = useState<string | null>(
    initialPresetIds.shot ?? presets.shot[0]?.id ?? null
  );
  const [hairstyleId, setHairstyleId] = useState<string | null>(
    initialPresetIds.hairstyle ?? presets.hairstyle[0]?.id ?? null
  );
  const [hairTextureId, setHairTextureId] = useState<string | null>(
    initialPresetIds.hairTexture ?? presets.hairTexture[0]?.id ?? null
  );
  const [makeupId, setMakeupId] = useState<string | null>(
    initialPresetIds.makeup ?? presets.makeup[0]?.id ?? null
  );
  const [skinId, setSkinId] = useState<string | null>(
    initialPresetIds.skin ?? presets.skin[0]?.id ?? null
  );

  // Scene can be a real uploaded photo ("foto") or a ready-made text location
  // ("pronto"). Start on whichever the user already has selected; fall back to
  // photo mode, or to "pronto" when there are no photos to choose from.
  const [scenePresetId, setScenePresetId] = useState<string | null>(
    initialPresetIds.scene ?? presets.scene[0]?.id ?? null
  );
  const [sceneMode, setSceneMode] = useState<"foto" | "pronto">(
    initialScenePhotoId || initialScenePhotos.length > 0 ? "foto" : "pronto"
  );

  const [garments, setGarments] = useState<Partial<Record<GarmentZone, PhotoResult[]>>>({});
  const [openSheet, setOpenSheet] = useState<ModelTarget | null>(null);
  const [openGarmentZone, setOpenGarmentZone] = useState<GarmentZone | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Per-step completion, used to light up the step headers and drive the
  // sticky footer's "faltando" hint so the user always knows what's left.
  const sceneChosen = sceneMode === "foto" ? scenePhotoId !== null : scenePresetId !== null;
  const modelDone = modelFace !== null && modelBody !== null;
  const sceneDone =
    sceneChosen && environmentId !== null && lightingId !== null && shotId !== null;
  const styleDone =
    poseId !== null &&
    expressionId !== null &&
    directionId !== null &&
    handId !== null &&
    hairstyleId !== null &&
    hairTextureId !== null &&
    makeupId !== null &&
    skinId !== null;
  const garmentsDone = Object.keys(garments).length > 0;

  const steps = [
    { done: modelDone, label: "Modelo" },
    { done: sceneDone, label: "Cenário" },
    { done: styleDone, label: "Estilo" },
    { done: garmentsDone, label: "Peças" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const nextMissing = steps.find((s) => !s.done)?.label ?? null;

  const canGenerate = modelDone && sceneDone && styleDone && garmentsDone;

  function removeZone(zone: GarmentZone) {
    setGarments((prev) => {
      const next = { ...prev };
      delete next[zone];
      return next;
    });
  }

  // Each selection is persisted as the profile's default so it stays chosen
  // the next time this screen loads.
  function selectModelPhoto(kind: ModelPhotoKind, photo: PhotoResult) {
    if (kind === "rosto") setModelFace(photo);
    else setModelBody(photo);
    setDefaultModelPhoto(kind, photo.id).catch(() => {});
  }

  function selectScenePhoto(photo: PhotoResult) {
    setScenePhotoId(photo.id);
    setDefaultScenePhoto(photo.id).catch(() => {});
  }

  function pick(
    id: string,
    setter: (v: string) => void,
    persist: (v: string | null) => Promise<void>
  ) {
    setter(id);
    persist(id).catch(() => {});
  }

  async function handleGenerate() {
    // The scene comes from whichever mode is active.
    const activeScenePhotoId = sceneMode === "foto" ? scenePhotoId : null;
    const activeScenePresetId = sceneMode === "pronto" ? scenePresetId : null;
    if (
      !modelFace ||
      !modelBody ||
      (!activeScenePhotoId && !activeScenePresetId) ||
      !poseId ||
      !lightingId ||
      !expressionId ||
      !directionId ||
      !environmentId ||
      !handId ||
      !shotId ||
      !hairstyleId ||
      !hairTextureId ||
      !makeupId ||
      !skinId
    )
      return;
    setGenerating(true);
    setError(null);

    const outcome = await onGenerate({
      modelFacePhotoId: modelFace.id,
      modelBodyPhotoId: modelBody.id,
      scenePhotoId: activeScenePhotoId ?? undefined,
      scenePresetId: activeScenePresetId ?? undefined,
      posePresetId: poseId,
      lightingPresetId: lightingId,
      expressionPresetId: expressionId,
      directionPresetId: directionId,
      environmentPresetId: environmentId,
      handPresetId: handId,
      shotPresetId: shotId,
      hairstylePresetId: hairstyleId,
      hairTexturePresetId: hairTextureId,
      makeupPresetId: makeupId,
      skinPresetId: skinId,
      garments: Object.fromEntries(
        Object.entries(garments).map(([zone, photos]) => [zone, photos!.map((p) => p.id)])
      ),
    });

    setGenerating(false);
    if (!outcome.ok) setError(outcome.error ?? "Falha ao gerar o look.");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step 1 — Modelo */}
      <section className="step-block p-4 sm:p-5">
        <StepHeader index={1} title="Modelo" subtitle="Rosto e corpo de referência" done={modelDone} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ModelPhotoSlot
            kind="rosto"
            photo={modelFace}
            onOpen={() => setOpenSheet({ type: "model", kind: "rosto" })}
          />
          <ModelPhotoSlot
            kind="corpo"
            photo={modelBody}
            onOpen={() => setOpenSheet({ type: "model", kind: "corpo" })}
          />
        </div>
      </section>

      {/* Step 2 — Cenário */}
      <section className="step-block p-4 sm:p-5">
        <StepHeader
          index={2}
          title="Cenário"
          subtitle="Local, ambiente, luz e tipo de foto"
          done={sceneDone}
        />
        <div className="mt-4 flex flex-col gap-5">
          <div>
            <SectionLabel
              icon={MapPin}
              hint={
                <span className="inline-flex overflow-hidden rounded-full border border-line">
                  <button
                    type="button"
                    onClick={() => setSceneMode("foto")}
                    className={
                      "px-2.5 py-1 text-[11px] transition-colors " +
                      (sceneMode === "foto"
                        ? "bg-foreground text-background"
                        : "text-muted hover:text-foreground")
                    }
                  >
                    Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setSceneMode("pronto")}
                    className={
                      "px-2.5 py-1 text-[11px] transition-colors " +
                      (sceneMode === "pronto"
                        ? "bg-foreground text-background"
                        : "text-muted hover:text-foreground")
                    }
                  >
                    Pronto
                  </button>
                </span>
              }
            >
              LOCAL
            </SectionLabel>

            {sceneMode === "foto" ? (
              <ScenePhotoList
                photos={scenePhotos}
                selectedId={scenePhotoId}
                onSelect={selectScenePhoto}
                onUploaded={(photo) => {
                  setScenePhotos((prev) => [photo, ...prev]);
                  selectScenePhoto(photo);
                }}
              />
            ) : (
              <PresetChips
                presets={presets.scene}
                value={scenePresetId}
                onChange={(id) => pick(id, setScenePresetId, setDefaultScenePreset)}
                fallbackIcon={MapPin}
              />
            )}
          </div>

          {presets.environment.length > 0 && (
            <div>
              <SectionLabel icon={Sofa}>AMBIENTE</SectionLabel>
              <PresetChips
                presets={presets.environment}
                value={environmentId}
                onChange={(id) => pick(id, setEnvironmentId, setDefaultEnvironmentPreset)}
                fallbackIcon={Sofa}
              />
            </div>
          )}

          {presets.lighting.length > 0 && (
            <div>
              <SectionLabel icon={SunMoon}>ILUMINAÇÃO</SectionLabel>
              <PresetChips
                presets={presets.lighting}
                value={lightingId}
                onChange={(id) => pick(id, setLightingId, setDefaultLightingPreset)}
                fallbackIcon={SunMoon}
              />
            </div>
          )}

          {presets.shot.length > 0 && (
            <div>
              <SectionLabel icon={Camera}>TIPO DE FOTO</SectionLabel>
              <PresetChips
                presets={presets.shot}
                value={shotId}
                onChange={(id) => pick(id, setShotId, setDefaultShotPreset)}
                fallbackIcon={Camera}
              />
            </div>
          )}
        </div>
      </section>

      {/* Step 3 — Estilo */}
      <section className="step-block p-4 sm:p-5">
        <StepHeader
          index={3}
          title="Estilo"
          subtitle="Pose, expressão, cabelo, maquiagem, pele e mais"
          done={styleDone}
        />
        <div className="mt-4 flex flex-col gap-5">
          {presets.pose.length > 0 && (
            <div>
              <SectionLabel icon={Sparkles}>POSE</SectionLabel>
              <PresetChips
                presets={presets.pose}
                value={poseId}
                onChange={(id) => pick(id, setPoseId, setDefaultPosePreset)}
                fallbackIcon={PersonStanding}
              />
            </div>
          )}

          {presets.expression.length > 0 && (
            <div>
              <SectionLabel icon={Smile}>ROSTO</SectionLabel>
              <PresetChips
                presets={presets.expression}
                value={expressionId}
                onChange={(id) => pick(id, setExpressionId, setDefaultExpressionPreset)}
                fallbackIcon={Smile}
              />
            </div>
          )}

          {presets.direction.length > 0 && (
            <div>
              <SectionLabel icon={ArrowLeftRight}>DIREÇÃO</SectionLabel>
              <PresetChips
                presets={presets.direction}
                value={directionId}
                onChange={(id) => pick(id, setDirectionId, setDefaultDirectionPreset)}
                fallbackIcon={ArrowLeftRight}
              />
            </div>
          )}

          {presets.hand.length > 0 && (
            <div>
              <SectionLabel icon={Hand} hint="mão livre">
                OBJETO / GESTO
              </SectionLabel>
              <PresetChips
                presets={presets.hand}
                value={handId}
                onChange={(id) => pick(id, setHandId, setDefaultHandPreset)}
                fallbackIcon={Hand}
              />
            </div>
          )}

          {presets.hairstyle.length > 0 && (
            <div>
              <SectionLabel icon={Scissors}>PENTEADO</SectionLabel>
              <PresetChips
                presets={presets.hairstyle}
                value={hairstyleId}
                onChange={(id) => pick(id, setHairstyleId, setDefaultHairstylePreset)}
                fallbackIcon={Scissors}
              />
            </div>
          )}

          {presets.hairTexture.length > 0 && (
            <div>
              <SectionLabel icon={Waves}>TEXTURA DO CABELO</SectionLabel>
              <PresetChips
                presets={presets.hairTexture}
                value={hairTextureId}
                onChange={(id) => pick(id, setHairTextureId, setDefaultHairTexturePreset)}
                fallbackIcon={Waves}
              />
            </div>
          )}

          {presets.makeup.length > 0 && (
            <div>
              <SectionLabel icon={Palette}>MAQUIAGEM</SectionLabel>
              <PresetChips
                presets={presets.makeup}
                value={makeupId}
                onChange={(id) => pick(id, setMakeupId, setDefaultMakeupPreset)}
                fallbackIcon={Palette}
              />
            </div>
          )}

          {presets.skin.length > 0 && (
            <div>
              <SectionLabel icon={Sun} hint="marca de sol">
                PELE
              </SectionLabel>
              <PresetChips
                presets={presets.skin}
                value={skinId}
                onChange={(id) => pick(id, setSkinId, setDefaultSkinPreset)}
                fallbackIcon={Sun}
              />
            </div>
          )}
        </div>
      </section>

      {/* Step 4 — Peças */}
      <section className="step-block p-4 sm:p-5">
        <StepHeader
          index={4}
          title="Peças"
          subtitle="As roupas do look"
          done={garmentsDone}
        />
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <GarmentZoneGrid
              garments={garments}
              onOpenZone={(zone) => setOpenGarmentZone(zone)}
              onRemoveZone={removeZone}
            />
          </div>
          <GarmentPreviewStack garments={garments} />
        </div>
      </section>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Sticky action footer — the Gerar button never scrolls out of reach, and
          a live hint tells the user exactly which step still needs attention. */}
      <div className="sticky bottom-0 -mx-0.5 mt-1 border-t border-line bg-background/80 px-0.5 pb-safe pt-3 backdrop-blur-xl lg:-mx-1 lg:px-1">
        <div className="mb-2.5 flex items-center gap-2 text-[11px]">
          <div className="flex gap-1">
            {steps.map((s, i) => (
              <span
                key={i}
                className={
                  "h-1 w-6 rounded-full transition-colors " +
                  (s.done ? "bg-[color:var(--accent-blue-glow)]" : "bg-line")
                }
              />
            ))}
          </div>
          <span className="text-muted">
            {canGenerate ? (
              "Tudo pronto"
            ) : (
              <>
                {doneCount}/4 · falta <span className="text-foreground">{nextMissing}</span>
              </>
            )}
          </span>
        </div>
        <Button onClick={handleGenerate} disabled={!canGenerate || generating} className="w-full">
          {generating ? "Gerando..." : "Gerar look"}
        </Button>
      </div>

      {openSheet && (
        <PhotoPickerSheet
          target={openSheet}
          onClose={() => setOpenSheet(null)}
          onSelected={(photo) => selectModelPhoto(openSheet.kind, photo)}
        />
      )}

      {openGarmentZone && (
        <GarmentPickerSheet
          zone={openGarmentZone}
          initialSelectedIds={(garments[openGarmentZone] ?? []).map((p) => p.id)}
          onClose={() => setOpenGarmentZone(null)}
          onConfirm={(photos) => {
            setGarments((prev) => {
              const next = { ...prev };
              if (photos.length === 0) delete next[openGarmentZone];
              else next[openGarmentZone] = photos;
              return next;
            });
          }}
        />
      )}
    </div>
  );
}
