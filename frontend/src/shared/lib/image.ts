// Turn a user-selected image File into a data URL suitable for storing
// inline (in the DB) and sending over the JSON API. The image is kept at
// its original resolution and quality — square cropping for display is
// handled purely with the `object-cover` Tailwind class on the <img>.
const MAX_AVATAR_FILE_BYTES = 8 * 1024 * 1024; // 8MB

export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (file.size > MAX_AVATAR_FILE_BYTES) {
    throw new Error("Image is too large (max 8MB).");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
