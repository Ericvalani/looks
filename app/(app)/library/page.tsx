import { listModelPhotos, listGarmentPhotos, listScenePhotos } from "@/lib/actions/photos";
import { getPreferences } from "@/lib/actions/preferences";
import { LibraryClient } from "@/components/photos/library-client";

export default async function LibraryPage() {
  const [modelPhotos, garmentPhotos, scenePhotos, preferences] = await Promise.all([
    listModelPhotos(),
    listGarmentPhotos(),
    listScenePhotos(),
    getPreferences(),
  ]);

  return (
    <main className="mx-auto h-full w-full max-w-2xl overflow-y-auto p-4 sm:p-6">
      <h1 className="text-lg font-medium tracking-tight">Biblioteca</h1>
      <p className="mt-1 text-sm text-muted">Suas fotos de rosto, corpo, peças e cenários salvos.</p>
      <LibraryClient
        initialModelPhotos={modelPhotos}
        initialGarmentPhotos={garmentPhotos}
        initialScenePhotos={scenePhotos}
        initialDefaultModelFacePhotoId={preferences.defaultModelFacePhotoId}
        initialDefaultModelBodyPhotoId={preferences.defaultModelBodyPhotoId}
        initialDefaultScenePhotoId={preferences.defaultScenePhotoId}
      />
    </main>
  );
}
