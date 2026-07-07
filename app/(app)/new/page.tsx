import { listModelPhotos, listScenePhotos } from "@/lib/actions/photos";
import { getPreferences } from "@/lib/actions/preferences";
import { listPosePresets } from "@/lib/actions/poses";
import { listLightingPresets } from "@/lib/actions/lighting";
import {
  listExpressionPresets,
  listDirectionPresets,
  listEnvironmentPresets,
  listHandPresets,
  listShotPresets,
  listScenePresets,
  listHairstylePresets,
  listHairTexturePresets,
  listMakeupPresets,
  listSkinPresets,
  type Preset,
} from "@/lib/actions/style-presets";
import { listLooks } from "@/lib/actions/looks";
import { NewLookDashboard } from "@/components/new-look/new-look-dashboard";

function pickInitial(list: Preset[], preferred: string | null): string | null {
  return list.find((p) => p.id === preferred)?.id ?? list[0]?.id ?? null;
}

export default async function NewLookPage() {
  const [
    preferences,
    modelPhotos,
    scenePhotos,
    posePresets,
    lightingPresets,
    expressionPresets,
    directionPresets,
    environmentPresets,
    handPresets,
    shotPresets,
    scenePresets,
    hairstylePresets,
    hairTexturePresets,
    makeupPresets,
    skinPresets,
    history,
  ] = await Promise.all([
    getPreferences(),
    listModelPhotos(),
    listScenePhotos(),
    listPosePresets(),
    listLightingPresets(),
    listExpressionPresets(),
    listDirectionPresets(),
    listEnvironmentPresets(),
    listHandPresets(),
    listShotPresets(),
    listScenePresets(),
    listHairstylePresets(),
    listHairTexturePresets(),
    listMakeupPresets(),
    listSkinPresets(),
    listLooks(),
  ]);

  const initialModelFace =
    modelPhotos.find((photo) => photo.id === preferences.defaultModelFacePhotoId) ?? null;
  const initialModelBody =
    modelPhotos.find((photo) => photo.id === preferences.defaultModelBodyPhotoId) ?? null;
  const initialScenePhotoId =
    scenePhotos.find((photo) => photo.id === preferences.defaultScenePhotoId)?.id ?? null;

  return (
    <NewLookDashboard
      initialModelFace={initialModelFace}
      initialModelBody={initialModelBody}
      initialScenePhotos={scenePhotos}
      initialScenePhotoId={initialScenePhotoId}
      presets={{
        pose: posePresets,
        lighting: lightingPresets,
        expression: expressionPresets,
        direction: directionPresets,
        environment: environmentPresets,
        hand: handPresets,
        shot: shotPresets,
        scene: scenePresets,
        hairstyle: hairstylePresets,
        hairTexture: hairTexturePresets,
        makeup: makeupPresets,
        skin: skinPresets,
      }}
      initialPresetIds={{
        pose: pickInitial(posePresets, preferences.defaultPosePresetId),
        lighting: pickInitial(lightingPresets, preferences.defaultLightingPresetId),
        expression: pickInitial(expressionPresets, preferences.defaultExpressionPresetId),
        direction: pickInitial(directionPresets, preferences.defaultDirectionPresetId),
        environment: pickInitial(environmentPresets, preferences.defaultEnvironmentPresetId),
        hand: pickInitial(handPresets, preferences.defaultHandPresetId),
        shot: pickInitial(shotPresets, preferences.defaultShotPresetId),
        scene: pickInitial(scenePresets, preferences.defaultScenePresetId),
        hairstyle: pickInitial(hairstylePresets, preferences.defaultHairstylePresetId),
        hairTexture: pickInitial(hairTexturePresets, preferences.defaultHairTexturePresetId),
        makeup: pickInitial(makeupPresets, preferences.defaultMakeupPresetId),
        skin: pickInitial(skinPresets, preferences.defaultSkinPresetId),
      }}
      initialHistory={history}
    />
  );
}
