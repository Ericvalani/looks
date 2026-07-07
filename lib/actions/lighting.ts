"use server";

import { createClient } from "@/lib/supabase/server";

export interface LightingPreset {
  id: string;
  label: string;
}

export async function listLightingPresets(): Promise<LightingPreset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lighting_presets")
    .select("id, label")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
