"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import type { GarmentZone, ModelPhotoKind } from "@/lib/supabase/database.types";

const BUCKET = "user-content";
const SIGNED_URL_TTL = 3600;

export interface PhotoResult {
  id: string;
  storagePath: string;
  label: string | null;
  signedUrl: string;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return { supabase, user };
}

async function signedUrlFor(supabase: SupabaseServerClient, path: string) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data) throw new Error("Não foi possível gerar o link da imagem.");
  return data.signedUrl;
}

export async function uploadModelPhoto(
  formData: FormData
): Promise<PhotoResult & { kind: ModelPhotoKind }> {
  const { supabase, user } = await requireUser();
  const file = formData.get("file");
  const kind = formData.get("kind") as ModelPhotoKind;
  const label = (formData.get("label") as string) || null;
  if (!(file instanceof File)) throw new Error("Arquivo inválido.");
  if (!kind) throw new Error("Tipo (rosto/corpo) obrigatório.");

  const id = randomUUID();
  const storagePath = `${user.id}/model-photos/${kind}/${id}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: "image/jpeg", upsert: false });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("model_photos").insert({
    id,
    user_id: user.id,
    kind,
    storage_path: storagePath,
    label,
  });
  if (insertError) throw insertError;

  return {
    id,
    storagePath,
    label,
    kind,
    signedUrl: await signedUrlFor(supabase, storagePath),
  };
}

export async function uploadGarmentPhoto(
  formData: FormData
): Promise<PhotoResult & { zone: GarmentZone }> {
  const { supabase, user } = await requireUser();
  const file = formData.get("file");
  const zone = formData.get("zone") as GarmentZone;
  const label = (formData.get("label") as string) || null;
  if (!(file instanceof File)) throw new Error("Arquivo inválido.");
  if (!zone) throw new Error("Zona obrigatória.");

  const id = randomUUID();
  const storagePath = `${user.id}/garment-photos/${zone}/${id}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: "image/jpeg", upsert: false });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("garment_photos").insert({
    id,
    user_id: user.id,
    zone,
    storage_path: storagePath,
    label,
  });
  if (insertError) throw insertError;

  return {
    id,
    storagePath,
    label,
    zone,
    signedUrl: await signedUrlFor(supabase, storagePath),
  };
}

// --- Import garment straight from a product URL (Shein etc.) ------------------
// Best-effort, lightweight extraction: we read the page's HTML and pull the
// product image from Open Graph / Twitter meta tags (falling back to the
// largest <img>). No headless browser, no paid scraper — so heavily bot-walled
// pages may fail, in which case the caller falls back to a normal photo upload.

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/*;q=0.8,*/*;q=0.5",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
};
const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB safety cap

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function extractMeta(html: string, ...properties: string[]): string | null {
  for (const prop of properties) {
    // Match <meta property="og:image" content="..."> in either attribute order.
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
        "i"
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
        "i"
      ),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) return m[1];
    }
  }
  return null;
}

function largestImgFallback(html: string, base: string): string | null {
  const srcs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)]
    .map((m) => m[1])
    .filter((s) => /^https?:|^\/\//i.test(s) || s.startsWith("/"));
  // Heuristic: prefer URLs that look like product images (bigger, in a CDN path).
  const scored = srcs
    .map((s) => ({ s, score: /(\d{3,4})x(\d{3,4})|large|zoom|product|goods/i.test(s) ? 1 : 0 }))
    .sort((a, b) => b.score - a.score);
  const pick = scored[0]?.s;
  if (!pick) return null;
  try {
    return new URL(pick, base).toString();
  } catch {
    return null;
  }
}

export async function importGarmentFromUrl(
  rawUrl: string,
  zone: GarmentZone
): Promise<PhotoResult & { zone: GarmentZone }> {
  const { supabase, user } = await requireUser();
  if (!zone) throw new Error("Zona obrigatória.");

  let pageUrl: URL;
  try {
    pageUrl = new URL(rawUrl.trim());
    if (pageUrl.protocol !== "http:" && pageUrl.protocol !== "https:") {
      throw new Error("bad protocol");
    }
  } catch {
    throw new Error("Link inválido. Cole a URL completa da peça.");
  }

  // 1) Fetch the product page HTML.
  let html: string;
  try {
    const pageRes = await fetchWithTimeout(
      pageUrl.toString(),
      { headers: BROWSER_HEADERS, redirect: "follow" },
      12000
    );
    if (!pageRes.ok) throw new Error(`status ${pageRes.status}`);
    html = await pageRes.text();
  } catch {
    throw new Error(
      "Não consegui abrir o link (o site pode estar bloqueando). Tente enviar a foto da peça."
    );
  }

  // 2) Find the product image URL.
  const found =
    extractMeta(html, "og:image", "og:image:secure_url", "twitter:image", "twitter:image:src") ??
    largestImgFallback(html, pageUrl.toString());
  if (!found) {
    throw new Error("Não encontrei a imagem da peça nesse link. Tente enviar a foto.");
  }

  let imageUrl: string;
  try {
    imageUrl = new URL(found, pageUrl.toString()).toString();
  } catch {
    throw new Error("A imagem encontrada tem um endereço inválido.");
  }

  // 3) Download the image bytes.
  let bytes: Buffer;
  let contentType: string;
  try {
    const imgRes = await fetchWithTimeout(
      imageUrl,
      { headers: { ...BROWSER_HEADERS, Referer: pageUrl.origin }, redirect: "follow" },
      12000
    );
    if (!imgRes.ok) throw new Error(`status ${imgRes.status}`);
    contentType = (imgRes.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!contentType.startsWith("image/")) throw new Error("not an image");
    const buf = Buffer.from(await imgRes.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > MAX_IMAGE_BYTES) throw new Error("bad size");
    bytes = buf;
  } catch {
    throw new Error("Não consegui baixar a imagem da peça. Tente enviar a foto.");
  }

  // 4) Store it exactly like an uploaded garment photo.
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const id = randomUUID();
  const storagePath = `${user.id}/garment-photos/${zone}/${id}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType, upsert: false });
  if (uploadError) throw uploadError;

  const label = pageUrl.hostname.replace(/^www\./, "");
  const { error: insertError } = await supabase.from("garment_photos").insert({
    id,
    user_id: user.id,
    zone,
    storage_path: storagePath,
    label,
  });
  if (insertError) throw insertError;

  return {
    id,
    storagePath,
    label,
    zone,
    signedUrl: await signedUrlFor(supabase, storagePath),
  };
}

export async function uploadScenePhoto(formData: FormData): Promise<PhotoResult> {
  const { supabase, user } = await requireUser();
  const file = formData.get("file");
  const label = (formData.get("label") as string)?.trim();
  if (!(file instanceof File)) throw new Error("Arquivo inválido.");
  if (!label) throw new Error("Dê um nome ao cenário (ex: Quarto, Elevador, Sala).");

  const id = randomUUID();
  const storagePath = `${user.id}/scene-photos/${id}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: "image/jpeg", upsert: false });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("scene_photos").insert({
    id,
    user_id: user.id,
    storage_path: storagePath,
    label,
  });
  if (insertError) throw insertError;

  return { id, storagePath, label, signedUrl: await signedUrlFor(supabase, storagePath) };
}

export async function listScenePhotos(): Promise<PhotoResult[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("scene_photos")
    .select("id, storage_path, label")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (row) => ({
      id: row.id,
      storagePath: row.storage_path,
      label: row.label,
      signedUrl: await signedUrlFor(supabase, row.storage_path),
    }))
  );
}

export async function deleteScenePhoto(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { data: row, error: fetchError } = await supabase
    .from("scene_photos")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (fetchError) throw fetchError;

  await supabase.storage.from(BUCKET).remove([row.storage_path]);
  const { error } = await supabase
    .from("scene_photos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}

export async function listModelPhotos(
  kind?: ModelPhotoKind
): Promise<Array<PhotoResult & { kind: ModelPhotoKind }>> {
  const { supabase, user } = await requireUser();
  let query = supabase
    .from("model_photos")
    .select("id, storage_path, label, kind")
    .eq("user_id", user.id);
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (row) => ({
      id: row.id,
      storagePath: row.storage_path,
      label: row.label,
      kind: row.kind,
      signedUrl: await signedUrlFor(supabase, row.storage_path),
    }))
  );
}

export async function listGarmentPhotos(
  zone?: GarmentZone
): Promise<Array<PhotoResult & { zone: GarmentZone }>> {
  const { supabase, user } = await requireUser();
  let query = supabase
    .from("garment_photos")
    .select("id, storage_path, label, zone")
    .eq("user_id", user.id);
  if (zone) query = query.eq("zone", zone);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (row) => ({
      id: row.id,
      storagePath: row.storage_path,
      label: row.label,
      zone: row.zone,
      signedUrl: await signedUrlFor(supabase, row.storage_path),
    }))
  );
}

export async function deleteModelPhoto(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { data: row, error: fetchError } = await supabase
    .from("model_photos")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (fetchError) throw fetchError;

  await supabase.storage.from(BUCKET).remove([row.storage_path]);
  const { error } = await supabase
    .from("model_photos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}

export async function deleteGarmentPhoto(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { data: row, error: fetchError } = await supabase
    .from("garment_photos")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (fetchError) throw fetchError;

  await supabase.storage.from(BUCKET).remove([row.storage_path]);
  const { error } = await supabase
    .from("garment_photos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}
