"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Download, Loader2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { downloadImage } from "@/shared/lib/download";

interface Props {
  src: string;
  name?: string;
  onClose: () => void;
}

// Full-screen lightbox for a user's avatar: shows the image at full size and
// lets the user save it. Closes on Escape or a click outside the image.
export function AvatarViewer({ src, name, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  async function handleDownload() {
    setSaving(true);
    setError(null);
    try {
      await downloadImage(src, `${name ?? "avatar"}-avatar`);
    } catch {
      setError("Could not download this image.");
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name ?? "User"} avatar`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/80 backdrop-blur-sm p-6"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(80vw,480px)] aspect-square rounded-2xl overflow-hidden bg-black/40 shadow-2xl"
      >
        <Image
          src={src}
          alt={name ?? "avatar"}
          fill
          sizes="480px"
          className="object-contain"
          unoptimized
        />
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center gap-2"
      >
        <Button
          type="button"
          onClick={handleDownload}
          disabled={saving}
          className="gap-2 bg-red-500 hover:bg-red-600 text-white"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {saving ? "Downloading…" : "Download"}
        </Button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>,
    document.body,
  );
}
