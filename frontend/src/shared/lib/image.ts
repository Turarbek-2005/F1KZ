// Turn a user-selected image File into a small, square, compressed JPEG data
// URL suitable for storing inline (in the DB) and sending over the JSON API.
// Cover-crops to a centered square so avatars are never distorted.
export async function fileToAvatarDataUrl(
  file: File,
  size = 256,
  quality = 0.85,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    const scale = Math.max(size / bitmap.width, size / bitmap.height);
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);

    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    bitmap.close();
  }
}
