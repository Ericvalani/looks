import type { ModelPhotoKind } from "@/lib/supabase/database.types";

export const MODEL_KIND_ORDER: ModelPhotoKind[] = ["rosto", "corpo"];

export const MODEL_KIND_LABELS: Record<ModelPhotoKind, string> = {
  rosto: "Rosto",
  corpo: "Corpo",
};

/** English description used inside the gpt-image-2 prompt. */
export const MODEL_KIND_PROMPT_LABELS: Record<ModelPhotoKind, string> = {
  rosto: "face/identity reference — exact face, skin tone and facial features",
  corpo: "body reference — exact body shape, proportions, height and build",
};
