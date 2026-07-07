"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database, ModelPhotoKind } from "@/lib/supabase/database.types";

type PreferencesInsert = Database["public"]["Tables"]["preferences"]["Insert"];

export interface Preferences {
  defaultModelFacePhotoId: string | null;
  defaultModelBodyPhotoId: string | null;
  defaultScenePhotoId: string | null;
  defaultScenePresetId: string | null;
  defaultPosePresetId: string | null;
  defaultLightingPresetId: string | null;
  defaultExpressionPresetId: string | null;
  defaultDirectionPresetId: string | null;
  defaultEnvironmentPresetId: string | null;
  defaultHandPresetId: string | null;
  defaultShotPresetId: string | null;
  defaultHairstylePresetId: string | null;
  defaultHairTexturePresetId: string | null;
  defaultMakeupPresetId: string | null;
  defaultSkinPresetId: string | null;
}

export async function getPreferences(): Promise<Preferences> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const empty: Preferences = {
    defaultModelFacePhotoId: null,
    defaultModelBodyPhotoId: null,
    defaultScenePhotoId: null,
    defaultScenePresetId: null,
    defaultPosePresetId: null,
    defaultLightingPresetId: null,
    defaultExpressionPresetId: null,
    defaultDirectionPresetId: null,
    defaultEnvironmentPresetId: null,
    defaultHandPresetId: null,
    defaultShotPresetId: null,
    defaultHairstylePresetId: null,
    defaultHairTexturePresetId: null,
    defaultMakeupPresetId: null,
    defaultSkinPresetId: null,
  };
  if (!user) return empty;

  const { data } = await supabase
    .from("preferences")
    .select(
      "default_model_face_photo_id, default_model_body_photo_id, default_scene_photo_id, default_scene_preset_id, default_pose_preset_id, default_lighting_preset_id, default_expression_preset_id, default_direction_preset_id, default_environment_preset_id, default_hand_preset_id, default_shot_preset_id, default_hairstyle_preset_id, default_hair_texture_preset_id, default_makeup_preset_id, default_skin_preset_id"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    defaultModelFacePhotoId: data?.default_model_face_photo_id ?? null,
    defaultModelBodyPhotoId: data?.default_model_body_photo_id ?? null,
    defaultScenePhotoId: data?.default_scene_photo_id ?? null,
    defaultScenePresetId: data?.default_scene_preset_id ?? null,
    defaultPosePresetId: data?.default_pose_preset_id ?? null,
    defaultLightingPresetId: data?.default_lighting_preset_id ?? null,
    defaultExpressionPresetId: data?.default_expression_preset_id ?? null,
    defaultDirectionPresetId: data?.default_direction_preset_id ?? null,
    defaultEnvironmentPresetId: data?.default_environment_preset_id ?? null,
    defaultHandPresetId: data?.default_hand_preset_id ?? null,
    defaultShotPresetId: data?.default_shot_preset_id ?? null,
    defaultHairstylePresetId: data?.default_hairstyle_preset_id ?? null,
    defaultHairTexturePresetId: data?.default_hair_texture_preset_id ?? null,
    defaultMakeupPresetId: data?.default_makeup_preset_id ?? null,
    defaultSkinPresetId: data?.default_skin_preset_id ?? null,
  };
}

type PreferenceColumn =
  | "default_model_face_photo_id"
  | "default_model_body_photo_id"
  | "default_scene_photo_id"
  | "default_scene_preset_id"
  | "default_pose_preset_id"
  | "default_lighting_preset_id"
  | "default_expression_preset_id"
  | "default_direction_preset_id"
  | "default_environment_preset_id"
  | "default_hand_preset_id"
  | "default_shot_preset_id"
  | "default_hairstyle_preset_id"
  | "default_hair_texture_preset_id"
  | "default_makeup_preset_id"
  | "default_skin_preset_id";

async function upsertDefault(column: PreferenceColumn, id: string | null): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const payload: PreferencesInsert = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
    [column]: id,
  };
  const { error } = await supabase.from("preferences").upsert(payload);
  if (error) throw error;
}

export async function setDefaultModelPhoto(kind: ModelPhotoKind, id: string | null): Promise<void> {
  return upsertDefault(
    kind === "rosto" ? "default_model_face_photo_id" : "default_model_body_photo_id",
    id
  );
}

export async function setDefaultScenePhoto(id: string | null) {
  return upsertDefault("default_scene_photo_id", id);
}
export async function setDefaultScenePreset(id: string | null) {
  return upsertDefault("default_scene_preset_id", id);
}
export async function setDefaultPosePreset(id: string | null) {
  return upsertDefault("default_pose_preset_id", id);
}
export async function setDefaultLightingPreset(id: string | null) {
  return upsertDefault("default_lighting_preset_id", id);
}
export async function setDefaultExpressionPreset(id: string | null) {
  return upsertDefault("default_expression_preset_id", id);
}
export async function setDefaultDirectionPreset(id: string | null) {
  return upsertDefault("default_direction_preset_id", id);
}
export async function setDefaultEnvironmentPreset(id: string | null) {
  return upsertDefault("default_environment_preset_id", id);
}
export async function setDefaultHandPreset(id: string | null) {
  return upsertDefault("default_hand_preset_id", id);
}
export async function setDefaultShotPreset(id: string | null) {
  return upsertDefault("default_shot_preset_id", id);
}
export async function setDefaultHairstylePreset(id: string | null) {
  return upsertDefault("default_hairstyle_preset_id", id);
}
export async function setDefaultHairTexturePreset(id: string | null) {
  return upsertDefault("default_hair_texture_preset_id", id);
}
export async function setDefaultMakeupPreset(id: string | null) {
  return upsertDefault("default_makeup_preset_id", id);
}
export async function setDefaultSkinPreset(id: string | null) {
  return upsertDefault("default_skin_preset_id", id);
}
