import type { GarmentZone } from "@/lib/supabase/database.types";
import { ZONE_PROMPT_LABELS } from "@/lib/zones";

const IDENTITY_INSTRUCTIONS = `IDENTITY LOCK — this is the single highest-priority constraint of the entire prompt; every other instruction is subordinate to keeping this exact person.

Reference image 1 is a close-up face/identity reference: reproduce this person's face EXACTLY — the same facial bone structure, face shape and width, jawline, chin, cheekbones, nose shape and size, lips, eye shape/color/spacing, eyebrows, forehead, ears, hairline, hair color and texture, and skin tone with its real undertone and any freckles/marks. The output face must be unmistakably recognizable as this same individual, as if photographed on the same day.

Reference image 2 is a full body reference: reproduce this person's exact body — the same shoulder width, torso length, waist and hip width, limb length/thickness, symmetry and build. She is a real woman of average height, about 1.67 m (5'6"): render everyday, real-life proportions with a normal head-to-body ratio (~7–7.5 heads tall), NOT a tall elongated fashion/runway figure. Do NOT lengthen the legs, elongate the torso or neck, slim her, or make the silhouette taller than the reference. Keep the body bilaterally symmetric with correct human anatomy (right number of fingers, natural joints, no warped or duplicated limbs).

Both references depict the SAME person and must be merged into one single, coherent, consistent human. Absolutely do NOT: blend in a different face or body, average toward a generic/idealized face, beautify, retouch, slim, thin the waist, enlarge or shrink any body part, lengthen the legs, elongate the torso or neck, make her taller or more "model-like", change the skin tone, or otherwise drift away from what the references show. Do not "improve" or "fix" the person — faithfully preserving their real face and their real body proportions and symmetry matters more than any aesthetic ideal.`;

/** The scene can be either a real reference photo (image 3) or a text-described
 * location (no reference image). Everything scene-dependent refers back through
 * `sceneRef` so the two modes read naturally. */
export type SceneInput =
  | { kind: "photo"; label: string }
  | { kind: "text"; label: string; fragment: string };

const SCENE_PHOTO_INSTRUCTIONS = (label: string) =>
  `Reference image 3 is a real photo of the exact real-world location where this must be shot — labeled "${label}" by the user. This is a real place, not a style description: reproduce its exact architecture, furniture, mirror, and surfaces as precisely as possible (the lighting itself is governed separately below — it may differ from the reference photo's original lighting). The output must look like it was actually taken inside this same real environment, from a natural position within it (the exact camera position and framing are defined by the shot description below).`;

const SCENE_TEXT_INSTRUCTIONS = (label: string, fragment: string) =>
  `Location: the photo is taken in the following real-world setting — "${label}". ${fragment} There is no reference photo for this location: build a believable, realistic version of this kind of place, with coherent architecture, props and depth. The output must look like a genuine photo actually taken inside such a place (the exact camera position and framing are defined by the shot description below).`;

const LIGHTING_INSTRUCTIONS = (lightingFragment: string, sceneRef: string) =>
  `Lighting: ${lightingFragment} This lighting applies throughout ${sceneRef}, overriding any default lighting of the location — keep the location's architecture and furniture, but light it as described here.`;

const ENVIRONMENT_INSTRUCTIONS = (environmentFragment: string, sceneRef: string) =>
  `Environment state: ${environmentFragment} Keep the same location as ${sceneRef}, but adjust the state/props/background of the space to match this description.`;

// How the photo is taken (mirror selfie, handheld selfie, propped on a table,
// 0.5x by someone else, top-down, etc.). This defines the camera, framing and
// whether a phone/mirror is even in the shot, so it comes before the pose.
const SHOT_INSTRUCTIONS = (shotFragment: string) =>
  `Shot / how the photo is taken: ${shotFragment} This governs the camera, framing and whether a phone or mirror is visible — follow it exactly and do not add a phone or mirror unless this description explicitly calls for one.`;

const POSE_INSTRUCTIONS = (poseFragment: string) =>
  `Pose: whichever hand is occupied by the camera/phone (only if the shot description above says one is) stays as described there. With the rest of the body and the free hand: ${poseFragment} The pose and every movement must look completely real and natural — correct, believable human body mechanics, natural balance and weight distribution, realistic joint angles and hand positions, no stiff, contorted, floating or impossible poses. While posing, keep the exact same body proportions, symmetry and build from reference image 2 — the pose only changes the position of the limbs, never the person's height, shoulder/waist/hip width, or limb proportions.`;

// What the free hand is doing / holding (bag, books, Stanley bottle, peace
// sign, etc.). Applies to whichever hand is not holding the camera/phone.
const HAND_INSTRUCTIONS = (handFragment: string) =>
  `Free hand: ${handFragment} This applies to the hand that is not holding the camera/phone (or, if the shot uses no phone, to a natural free hand). Any held object must look real, correctly scaled and naturally gripped.`;

const EXPRESSION_INSTRUCTIONS = (expressionFragment: string) =>
  `Facial expression: ${expressionFragment} Apply this expression as a surface change only — the underlying face, bone structure and identity from reference image 1 must stay exactly the same; do not reshape the face while changing the expression.`;

// Hair styling (how it's arranged) + texture/length. Keep the same natural hair
// color from the reference; only the styling/texture changes here.
const HAIR_INSTRUCTIONS = (hairstyleFragment: string, hairTextureFragment: string) =>
  `Hair: ${hairstyleFragment} ${hairTextureFragment} Keep her natural hair color and hairline from reference image 1; only restyle as described here without changing her face or identity.`;

// Makeup — applied as a surface layer, never reshaping the underlying face.
const MAKEUP_INSTRUCTIONS = (makeupFragment: string) =>
  `Makeup: ${makeupFragment} Apply it only as a realistic surface layer on the same face from reference image 1 — do not change her features, bone structure or identity.`;

// Skin state / sun tan (face and body). Only affects skin tone and tan lines.
const SKIN_INSTRUCTIONS = (skinFragment: string) =>
  `Skin: ${skinFragment} Keep it realistic and natural, matching the real skin texture from the references; only the tan/tone changes, not her identity or body shape.`;

const DIRECTION_INSTRUCTIONS = (directionFragment: string) =>
  `Orientation: ${directionFragment} Rotating or angling the body must not distort its proportions or symmetry — it is the same body from reference image 2, simply seen from this angle.`;

const STYLE_INSTRUCTIONS = (sceneRef: string) =>
  `The photo is taken inside ${sceneRef}, following the shot description above. It must look EXACTLY like a real, unedited photo shot on an iPhone 16 Pro Max and posted straight from the camera roll — a genuine casual snapshot, not a studio shot and not an AI render. Reproduce real iPhone capture traits: Apple's Smart HDR computational look with balanced, slightly flat dynamic range and true-to-life color science; a fine, subtle layer of digital sensor grain / luminance noise across the whole frame (present but understated, especially in shadows); phone-camera lens character with deep, mostly even focus and only mild, believable background blur (not creamy DSLR bokeh); and crisp, real skin texture — visible pores, tiny blemishes, flyaway hairs, natural shine. Absolutely no airbrushing, no wax/plastic skin, no over-smoothing, no beauty filter, no face-slimming. Slightly imperfect, candid framing. Every part of the frame (skin, fabric, background, light) must be indistinguishable from an authentic phone-camera photo a real person took and shared.`;

// The user only attaches some garment zones. For every other part of the body,
// the model must NOT invent random or clashing items — it should quietly add
// simple, neutral pieces that coordinate with the attached ones, so the person
// is always fully and tastefully dressed.
const COMPLETE_LOOK_INSTRUCTIONS = (attachedLabels: string[]) => {
  const attached =
    attachedLabels.length > 0
      ? `The reference photos above only define these garments: ${attachedLabels.join(
          ", "
        )}. Reproduce those exactly as given.`
      : "No specific garments were provided as references.";
  return `Completing the outfit: ${attached} For every OTHER part of the body that was not provided (for example the missing top, bottom, shoes or outerwear), do not invent flashy, random or clashing items — instead add simple, plain, neutral basics whose color and style clearly coordinate with the provided garments, so the whole look reads as one intentional, well-put-together outfit. The person must always be fully and appropriately dressed (never leave the torso, legs or feet bare or underwear-only); keep any added pieces understated so the provided garments stay the focus.`;
};

export interface GarmentGroup {
  zone: GarmentZone;
  /** How many angle photos of this same piece are attached, in order. */
  count: number;
}

/**
 * Pure/testable prompt builder. `garmentGroups` must already be ordered the
 * same way the corresponding reference images are attached to the OpenAI
 * request (after the fixed face + body [+ scene photo] references) — callers
 * should build it by filtering ZONE_ORDER rather than passing an
 * arbitrarily-ordered list, or the "Reference image N" numbering will not
 * line up with the attached files.
 *
 * The scene may be a real reference photo (image 3, garments start at image 4)
 * OR a text-described location (no scene image, garments start at image 3).
 */
export function buildLookPrompt({
  garmentGroups,
  scene,
  poseFragment,
  lightingFragment,
  environmentFragment,
  expressionFragment,
  directionFragment,
  handFragment,
  shotFragment,
  hairstyleFragment,
  hairTextureFragment,
  makeupFragment,
  skinFragment,
}: {
  garmentGroups: GarmentGroup[];
  scene: SceneInput;
  poseFragment: string;
  lightingFragment: string;
  environmentFragment: string;
  expressionFragment: string;
  directionFragment: string;
  handFragment: string;
  shotFragment: string;
  hairstyleFragment: string;
  hairTextureFragment: string;
  makeupFragment: string;
  skinFragment: string;
}): string {
  const hasScenePhoto = scene.kind === "photo";
  // With a scene photo, images are: 1 face, 2 body, 3 scene, 4+ garments.
  // With a text scene there is no image 3, so garments start at image 3.
  const firstGarmentRef = hasScenePhoto ? 4 : 3;
  const sceneRef = hasScenePhoto ? "the scene from reference image 3" : "the location described above";

  let cursor = firstGarmentRef;
  const garmentLines = garmentGroups
    .map(({ zone, count }) => {
      const start = cursor;
      cursor += count;
      const end = cursor - 1;
      const refLabel = count > 1 ? `Reference images ${start}–${end}` : `Reference image ${start}`;
      const angleNote =
        count > 1
          ? ` (${count} different angles/photos of the exact same real garment — use all of them together to reconstruct its precise color, pattern, texture, and fit)`
          : "";
      return `- ${refLabel}: ${ZONE_PROMPT_LABELS[zone]}${angleNote}. Dress the person in exactly this item — match its color, pattern, texture, and fit precisely.`;
    })
    .join("\n");

  const sceneInstruction = hasScenePhoto
    ? SCENE_PHOTO_INSTRUCTIONS(scene.label)
    : SCENE_TEXT_INSTRUCTIONS(scene.label, scene.fragment);

  const attachedLabels = garmentGroups.map(({ zone }) => ZONE_PROMPT_LABELS[zone]);

  return [
    `Reference images ${firstGarmentRef} onward are garment/accessory photos (one or more photos per item).`,
    IDENTITY_INSTRUCTIONS,
    sceneInstruction,
    ENVIRONMENT_INSTRUCTIONS(environmentFragment, sceneRef),
    LIGHTING_INSTRUCTIONS(lightingFragment, sceneRef),
    SHOT_INSTRUCTIONS(shotFragment),
    POSE_INSTRUCTIONS(poseFragment),
    HAND_INSTRUCTIONS(handFragment),
    EXPRESSION_INSTRUCTIONS(expressionFragment),
    HAIR_INSTRUCTIONS(hairstyleFragment, hairTextureFragment),
    MAKEUP_INSTRUCTIONS(makeupFragment),
    SKIN_INSTRUCTIONS(skinFragment),
    DIRECTION_INSTRUCTIONS(directionFragment),
    garmentLines,
    COMPLETE_LOOK_INSTRUCTIONS(attachedLabels),
    `Combine all references into a single photo of the person from references 1 and 2, wearing all of the above garments together as a complete, coherent outfit, inside ${sceneRef}.`,
    STYLE_INSTRUCTIONS(sceneRef),
    "Output a vertical portrait-orientation photo, full body or 3/4 framing so the outfit is fully visible.",
    "FINAL CHECK before rendering: the face must be the exact same recognizable person from reference image 1, and the body must have the exact same real proportions, symmetry and build from reference image 2. If the outfit, pose, angle or scene would require altering the face or body proportions, keep the face and body faithful and adapt everything else around them.",
  ].join("\n\n");
}
