/**
 * Re-encodes any picked image (including iPhone HEIC) into a resized JPEG
 * via canvas before it ever reaches the server. Safari decodes HEIC into
 * <img>/canvas natively, so this single client-side pass normalizes format
 * *and* caps upload size — no server-side HEIC decoding needed.
 */
export async function reencodeImageFile(
  file: File,
  { maxEdge = 2000, quality = 0.9 }: { maxEdge?: number; quality?: number } = {}
): Promise<File> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D não disponível.");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) throw new Error("Não foi possível processar a imagem.");

  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}
