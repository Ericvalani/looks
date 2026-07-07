"use server";

import { createClient } from "@/lib/supabase/server";
import type { LookStatus } from "@/lib/supabase/database.types";

const BUCKET = "user-content";
const SIGNED_URL_TTL = 3600;

export interface LookDetail {
  id: string;
  status: LookStatus;
  errorMessage: string | null;
  signedUrl: string | null;
  prompt: string;
  createdAt: string;
}

export interface LookSummary {
  id: string;
  status: LookStatus;
  signedUrl: string | null;
  createdAt: string;
}

export async function getLook(id: string): Promise<LookDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: look, error } = await supabase
    .from("looks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error || !look) return null;

  let signedUrl: string | null = null;
  if (look.storage_path) {
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(look.storage_path, SIGNED_URL_TTL);
    signedUrl = data?.signedUrl ?? null;
  }

  return {
    id: look.id,
    status: look.status,
    errorMessage: look.error_message,
    signedUrl,
    prompt: look.prompt,
    createdAt: look.created_at,
  };
}

export async function listLooks(limit = 20): Promise<LookSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("looks")
    .select("id, status, storage_path, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];

  return Promise.all(
    data.map(async (row) => {
      let signedUrl: string | null = null;
      if (row.storage_path) {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(row.storage_path, SIGNED_URL_TTL);
        signedUrl = signed?.signedUrl ?? null;
      }
      return { id: row.id, status: row.status, signedUrl, createdAt: row.created_at };
    })
  );
}

export async function deleteLook(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: look, error: fetchError } = await supabase
    .from("looks")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (fetchError || !look) throw new Error("Look não encontrado.");

  if (look.storage_path) {
    await supabase.storage.from(BUCKET).remove([look.storage_path]);
  }

  const { error } = await supabase.from("looks").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;
}
