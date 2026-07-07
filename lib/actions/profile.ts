"use server";

import { createClient } from "@/lib/supabase/server";

export interface CurrentProfile {
  displayName: string;
  slug: string;
  accentColor: string | null;
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("display_name, slug, accent_color")
    .eq("id", user.id)
    .single();

  if (!data) return null;
  return { displayName: data.display_name, slug: data.slug, accentColor: data.accent_color };
}
