function extensionFor(mime: string) {
  const subtype = mime.split("/")[1]?.split(";")[0] ?? "";
  if (subtype === "jpeg") return "jpg";
  if (subtype === "svg+xml") return "svg";
  return subtype || "png";
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Saves an image to disk. Data URLs are handed to the anchor directly; remote
// URLs are fetched into a blob first, because `download` is ignored on
// cross-origin hrefs and the browser would navigate to the image instead.
export async function downloadImage(src: string, baseName = "image") {
  if (src.startsWith("data:")) {
    const mime = src.slice(5, src.indexOf(";"));
    triggerDownload(src, `${baseName}.${extensionFor(mime)}`);
    return;
  }

  const res = await fetch(src, { mode: "cors" });
  if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`);
  const blob = await res.blob();

  const objectUrl = URL.createObjectURL(blob);
  try {
    triggerDownload(objectUrl, `${baseName}.${extensionFor(blob.type)}`);
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
}
