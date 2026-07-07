"use server";

import { createClient } from "@/lib/supabase/server";

export interface Preset {
  id: string;
  label: string;
}

async function listActive(
  table:
    | "expression_presets"
    | "direction_presets"
    | "environment_presets"
    | "hand_presets"
    | "shot_presets"
    | "scene_presets"
    | "hairstyle_presets"
    | "hair_texture_presets"
    | "makeup_presets"
    | "skin_presets"
): Promise<Preset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("id, label")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listExpressionPresets(): Promise<Preset[]> {
  return listActive("expression_presets");
}

export async function listDirectionPresets(): Promise<Preset[]> {
  return listActive("direction_presets");
}

export async function listEnvironmentPresets(): Promise<Preset[]> {
  return listActive("environment_presets");
}

export async function listHandPresets(): Promise<Preset[]> {
  return listActive("hand_presets");
}

export async function listShotPresets(): Promise<Preset[]> {
  return listActive("shot_presets");
}

export async function listScenePresets(): Promise<Preset[]> {
  return listActive("scene_presets");
}

export async function listHairstylePresets(): Promise<Preset[]> {
  return listActive("hairstyle_presets");
}

export async function listHairTexturePresets(): Promise<Preset[]> {
  return listActive("hair_texture_presets");
}

export async function listMakeupPresets(): Promise<Preset[]> {
  return listActive("makeup_presets");
}

export async function listSkinPresets(): Promise<Preset[]> {
  return listActive("skin_presets");
}
