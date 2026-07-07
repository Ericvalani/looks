"use server";

import { createClient } from "@/lib/supabase/server";

export interface PosePreset {
  id: string;
  label: string;
}

export async function listPosePresets(): Promise<PosePreset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pose_presets")
    .select("id, label")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
