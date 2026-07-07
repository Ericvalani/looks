"use client";

import { reencodeImageFile } from "./reencode";
import {
  uploadModelPhoto,
  uploadGarmentPhoto,
  uploadScenePhoto,
  type PhotoResult,
} from "@/lib/actions/photos";
import type { GarmentZone, ModelPhotoKind } from "@/lib/supabase/database.types";

export type UploadTarget =
  | { type: "model"; kind: ModelPhotoKind }
  | { type: "garment"; zone: GarmentZone }
  | { type: "scene"; label?: string };

export async function pickAndUpload(
  file: File,
  target: UploadTarget
): Promise<PhotoResult & { kind?: ModelPhotoKind; zone?: GarmentZone }> {
  const jpeg = await reencodeImageFile(file);
  const formData = new FormData();
  formData.set("file", jpeg);

  if (target.type === "garment") {
    formData.set("zone", target.zone);
    return uploadGarmentPhoto(formData);
  }

  if (target.type === "scene") {
    if (target.label) formData.set("label", target.label);
    return uploadScenePhoto(formData);
  }

  formData.set("kind", target.kind);
  return uploadModelPhoto(formData);
}
