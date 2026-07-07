import type { GarmentZone } from "@/lib/supabase/database.types";

export const ZONE_ORDER: GarmentZone[] = [
  "cabeca",
  "casaco",
  "conjunto",
  "topo",
  "inferior",
  "calcado",
  "acessorio",
];

export const ZONE_LABELS: Record<GarmentZone, string> = {
  cabeca: "Cabeça",
  casaco: "Casaco",
  conjunto: "Conjunto",
  topo: "Topo",
  inferior: "Inferior",
  calcado: "Calçado",
  acessorio: "Acessório",
};

/** English zone description used inside the gpt-image-2 prompt. */
export const ZONE_PROMPT_LABELS: Record<GarmentZone, string> = {
  cabeca: "headwear (hat/cap/beanie)",
  casaco: "outerwear/jacket",
  conjunto:
    "a complete matching set shown together in one photo (top and bottom combined, e.g. a dress or coordinated two-piece outfit) — apply both the top and bottom parts of this exact outfit to the person as one coordinated set, without needing separate top/bottom references",
  topo: "top/shirt",
  inferior: "bottom (pants/skirt)",
  calcado: "shoes",
  acessorio: "accessory (bag/jewelry/watch)",
};
