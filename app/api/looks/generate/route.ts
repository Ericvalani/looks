import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { buildLookPrompt, type GarmentGroup, type SceneInput } from "@/lib/prompt";
import { ZONE_ORDER } from "@/lib/zones";
import type { GarmentZone } from "@/lib/supabase/database.types";

export const runtime = "nodejs";
// Image generation can take up to ~3 min. Render runs a long-lived container
// (no serverless function timeout), so this is a generous ceiling rather than
// the hard 60s cap a serverless host like Vercel Hobby would impose.
export const maxDuration = 300;

const BUCKET = "user-content";
const SIZE = "1024x1792";
const QUALITY = "high";

const zoneEnum = z.enum(ZONE_ORDER as [GarmentZone, ...GarmentZone[]]);

const bodySchema = z
  .object({
    modelFacePhotoId: z.string().uuid(),
    modelBodyPhotoId: z.string().uuid(),
    // Exactly one of these must be set: a real scene photo, or a text scene preset.
    scenePhotoId: z.string().uuid().optional(),
    scenePresetId: z.string().optional(),
    posePresetId: z.string(),
    lightingPresetId: z.string(),
    expressionPresetId: z.string(),
    directionPresetId: z.string(),
    environmentPresetId: z.string(),
    handPresetId: z.string(),
    shotPresetId: z.string(),
    hairstylePresetId: z.string(),
    hairTexturePresetId: z.string(),
    makeupPresetId: z.string(),
    skinPresetId: z.string(),
    // partialRecord: the user attaches only some zones, so not every enum key
    // is required (plain z.record(enum, …) in Zod v4 demands all keys present).
    garments: z.partialRecord(zoneEnum, z.array(z.string().uuid()).min(1)),
  })
  .refine((v) => !!v.scenePhotoId !== !!v.scenePresetId, {
    message: "Escolha uma foto de cenário OU um cenário pronto.",
  });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const {
    modelFacePhotoId,
    modelBodyPhotoId,
    scenePhotoId,
    scenePresetId,
    posePresetId,
    lightingPresetId,
    expressionPresetId,
    directionPresetId,
    environmentPresetId,
    handPresetId,
    shotPresetId,
    hairstylePresetId,
    hairTexturePresetId,
    makeupPresetId,
    skinPresetId,
    garments,
  } = parsed.data;
  const garmentEntries = Object.entries(garments) as [GarmentZone, string[]][];
  if (garmentEntries.length === 0) {
    return NextResponse.json({ error: "Selecione ao menos uma peça." }, { status: 400 });
  }

  const allGarmentPhotoIds = garmentEntries.flatMap(([, ids]) => ids);

  const [
    faceResult,
    bodyResult,
    garmentResult,
    poseResult,
    lightingResult,
    expressionResult,
    directionResult,
    environmentResult,
    handResult,
    shotResult,
    hairstyleResult,
    hairTextureResult,
    makeupResult,
    skinResult,
  ] = await Promise.all([
    supabase
      .from("model_photos")
      .select("id, storage_path, kind")
      .eq("id", modelFacePhotoId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("model_photos")
      .select("id, storage_path, kind")
      .eq("id", modelBodyPhotoId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("garment_photos")
      .select("id, storage_path, zone")
      .eq("user_id", user.id)
      .in("id", allGarmentPhotoIds),
    supabase.from("pose_presets").select("id, prompt_fragment").eq("id", posePresetId).single(),
    supabase
      .from("lighting_presets")
      .select("id, prompt_fragment")
      .eq("id", lightingPresetId)
      .single(),
    supabase
      .from("expression_presets")
      .select("id, prompt_fragment")
      .eq("id", expressionPresetId)
      .single(),
    supabase
      .from("direction_presets")
      .select("id, prompt_fragment")
      .eq("id", directionPresetId)
      .single(),
    supabase
      .from("environment_presets")
      .select("id, prompt_fragment")
      .eq("id", environmentPresetId)
      .single(),
    supabase.from("hand_presets").select("id, prompt_fragment").eq("id", handPresetId).single(),
    supabase.from("shot_presets").select("id, prompt_fragment").eq("id", shotPresetId).single(),
    supabase
      .from("hairstyle_presets")
      .select("id, prompt_fragment")
      .eq("id", hairstylePresetId)
      .single(),
    supabase
      .from("hair_texture_presets")
      .select("id, prompt_fragment")
      .eq("id", hairTexturePresetId)
      .single(),
    supabase.from("makeup_presets").select("id, prompt_fragment").eq("id", makeupPresetId).single(),
    supabase.from("skin_presets").select("id, prompt_fragment").eq("id", skinPresetId).single(),
  ]);

  if (faceResult.error || !faceResult.data || faceResult.data.kind !== "rosto") {
    return NextResponse.json({ error: "Foto de rosto inválida." }, { status: 400 });
  }
  if (bodyResult.error || !bodyResult.data || bodyResult.data.kind !== "corpo") {
    return NextResponse.json({ error: "Foto de corpo inválida." }, { status: 400 });
  }
  if (garmentResult.error || !garmentResult.data) {
    return NextResponse.json({ error: "Peças inválidas." }, { status: 400 });
  }
  if (poseResult.error || !poseResult.data) {
    return NextResponse.json({ error: "Pose inválida." }, { status: 400 });
  }
  if (lightingResult.error || !lightingResult.data) {
    return NextResponse.json({ error: "Iluminação inválida." }, { status: 400 });
  }
  if (expressionResult.error || !expressionResult.data) {
    return NextResponse.json({ error: "Expressão inválida." }, { status: 400 });
  }
  if (directionResult.error || !directionResult.data) {
    return NextResponse.json({ error: "Direção inválida." }, { status: 400 });
  }
  if (environmentResult.error || !environmentResult.data) {
    return NextResponse.json({ error: "Ambiente inválido." }, { status: 400 });
  }
  if (handResult.error || !handResult.data) {
    return NextResponse.json({ error: "Objeto/mão inválido." }, { status: 400 });
  }
  if (shotResult.error || !shotResult.data) {
    return NextResponse.json({ error: "Tipo de foto inválido." }, { status: 400 });
  }
  if (hairstyleResult.error || !hairstyleResult.data) {
    return NextResponse.json({ error: "Penteado inválido." }, { status: 400 });
  }
  if (hairTextureResult.error || !hairTextureResult.data) {
    return NextResponse.json({ error: "Textura de cabelo inválida." }, { status: 400 });
  }
  if (makeupResult.error || !makeupResult.data) {
    return NextResponse.json({ error: "Maquiagem inválida." }, { status: 400 });
  }
  if (skinResult.error || !skinResult.data) {
    return NextResponse.json({ error: "Pele inválida." }, { status: 400 });
  }

  const modelFacePhoto = faceResult.data;
  const modelBodyPhoto = bodyResult.data;
  const posePreset = poseResult.data;
  const lightingPreset = lightingResult.data;
  const expressionPreset = expressionResult.data;
  const directionPreset = directionResult.data;
  const environmentPreset = environmentResult.data;
  const handPreset = handResult.data;
  const shotPreset = shotResult.data;
  const hairstylePreset = hairstyleResult.data;
  const hairTexturePreset = hairTextureResult.data;
  const makeupPreset = makeupResult.data;
  const skinPreset = skinResult.data;

  // Resolve the scene: either a real reference photo (image 3, downloaded and
  // attached below) or a text-described preset (no image). Exactly one of
  // scenePhotoId / scenePresetId is present (enforced by the schema refine).
  let scenePhoto: { storage_path: string } | null = null;
  let sceneInput: SceneInput;
  if (scenePhotoId) {
    const { data, error } = await supabase
      .from("scene_photos")
      .select("storage_path, label")
      .eq("id", scenePhotoId)
      .eq("user_id", user.id)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Cenário inválido." }, { status: 400 });
    }
    scenePhoto = { storage_path: data.storage_path };
    sceneInput = { kind: "photo", label: data.label };
  } else {
    const { data, error } = await supabase
      .from("scene_presets")
      .select("label, prompt_fragment")
      .eq("id", scenePresetId!)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Cenário inválido." }, { status: 400 });
    }
    sceneInput = { kind: "text", label: data.label, fragment: data.prompt_fragment };
  }

  const garmentByZone = new Map<GarmentZone, { id: string; storage_path: string }[]>();
  for (const [claimedZone, ids] of garmentEntries) {
    const rows: { id: string; storage_path: string }[] = [];
    for (const id of ids) {
      const row = garmentResult.data.find((r) => r.id === id);
      if (!row || row.zone !== claimedZone) {
        return NextResponse.json(
          { error: "Peça não corresponde à zona informada." },
          { status: 400 }
        );
      }
      rows.push(row);
    }
    garmentByZone.set(claimedZone, rows);
  }

  const orderedZones = ZONE_ORDER.filter((zone) => garmentByZone.has(zone));
  const garmentGroups: GarmentGroup[] = orderedZones.map((zone) => ({
    zone,
    count: garmentByZone.get(zone)!.length,
  }));
  const prompt = buildLookPrompt({
    garmentGroups,
    scene: sceneInput,
    poseFragment: posePreset.prompt_fragment,
    lightingFragment: lightingPreset.prompt_fragment,
    environmentFragment: environmentPreset.prompt_fragment,
    expressionFragment: expressionPreset.prompt_fragment,
    directionFragment: directionPreset.prompt_fragment,
    handFragment: handPreset.prompt_fragment,
    shotFragment: shotPreset.prompt_fragment,
    hairstyleFragment: hairstylePreset.prompt_fragment,
    hairTextureFragment: hairTexturePreset.prompt_fragment,
    makeupFragment: makeupPreset.prompt_fragment,
    skinFragment: skinPreset.prompt_fragment,
  });

  const lookId = randomUUID();

  const { error: insertLookError } = await supabase.from("looks").insert({
    id: lookId,
    user_id: user.id,
    model_face_photo_id: modelFacePhotoId,
    model_body_photo_id: modelBodyPhotoId,
    scene_photo_id: scenePhotoId ?? null,
    scene_preset_id: scenePresetId ?? null,
    pose_preset_id: posePresetId,
    lighting_preset_id: lightingPresetId,
    expression_preset_id: expressionPresetId,
    direction_preset_id: directionPresetId,
    environment_preset_id: environmentPresetId,
    hand_preset_id: handPresetId,
    shot_preset_id: shotPresetId,
    hairstyle_preset_id: hairstylePresetId,
    hair_texture_preset_id: hairTexturePresetId,
    makeup_preset_id: makeupPresetId,
    skin_preset_id: skinPresetId,
    prompt,
    size: SIZE,
    quality: QUALITY,
    status: "processing",
  });
  if (insertLookError) {
    return NextResponse.json({ error: "Falha ao registrar o look." }, { status: 500 });
  }

  const { error: insertGarmentsError } = await supabase.from("look_garments").insert(
    orderedZones.flatMap((zone) =>
      garmentByZone.get(zone)!.map((row) => ({
        look_id: lookId,
        garment_photo_id: row.id,
        zone,
        storage_path_snapshot: row.storage_path,
      }))
    )
  );
  if (insertGarmentsError) {
    await supabase
      .from("looks")
      .update({ status: "failed", error_message: "Falha ao registrar peças." })
      .eq("id", lookId);
    return NextResponse.json({ error: "Falha ao registrar peças." }, { status: 500 });
  }

  try {
    const paths = [
      modelFacePhoto.storage_path,
      modelBodyPhoto.storage_path,
      // Scene photo is image 3 only when a real photo was chosen; a text scene
      // attaches no image, and buildLookPrompt numbers the garments accordingly.
      ...(scenePhoto ? [scenePhoto.storage_path] : []),
      ...orderedZones.flatMap((zone) => garmentByZone.get(zone)!.map((row) => row.storage_path)),
    ];

    const blobs = await Promise.all(
      paths.map(async (path) => {
        const { data, error } = await supabase.storage.from(BUCKET).download(path);
        if (error || !data) throw new Error(`Falha ao baixar referência: ${path}`);
        return data;
      })
    );

    const form = new FormData();
    form.set("model", "gpt-image-2");
    form.set("prompt", prompt);
    form.set("size", SIZE);
    form.set("quality", QUALITY);
    blobs.forEach((blob, i) => form.append("image[]", blob, `ref-${i}.jpg`));

    const openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      throw new Error(`OpenAI: ${errText.slice(0, 500)}`);
    }

    const payload = await openaiRes.json();
    const base64: string | undefined = payload.data?.[0]?.b64_json;
    if (!base64) throw new Error("Resposta da OpenAI sem imagem.");

    const resultBytes = Buffer.from(base64, "base64");
    const resultPath = `${user.id}/looks/${lookId}.png`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(resultPath, resultBytes, { contentType: "image/png", upsert: true });
    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase
      .from("looks")
      .update({
        status: "completed",
        storage_path: resultPath,
        completed_at: new Date().toISOString(),
      })
      .eq("id", lookId);
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, lookId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha desconhecida.";
    await supabase.from("looks").update({ status: "failed", error_message: message }).eq("id", lookId);
    return NextResponse.json({ error: message, lookId }, { status: 500 });
  }
}
