"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { AvatarViewer } from "@/shared/ui/AvatarViewer";

function initials(name?: string) {
  if (!name) return "?";
  return (
    name
      .split(" ")
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "?"
  );
}

interface Props {
  src?: string | null;
  name?: string;
  /** Size + text-size utility classes, e.g. "w-24 h-24 text-3xl". */
  className?: string;
  /** When true, clicking the image opens a full-size viewer with a download button. */
  viewable?: boolean;
}

// Renders the user's avatar image when present, otherwise their initials on a
// red disc. Size and font-size come from `className` so callers control scale.
export function UserAvatar({ src, name, className, viewable }: Props) {
  const [open, setOpen] = useState(false);

  if (src) {
    const image = (
      <Image
        src={src}
        alt={name ?? "avatar"}
        fill
        sizes="128px"
        className="object-cover"
        unoptimized
      />
    );

    const classes = cn(
      "relative overflow-hidden rounded-full bg-muted shrink-0",
      className,
    );

    if (!viewable) return <div className={classes}>{image}</div>;

    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`View ${name ?? "user"} avatar`}
          className={cn(
            classes,
            "cursor-zoom-in transition hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
          )}
        >
          {image}
        </button>
        {open && (
          <AvatarViewer src={src} name={name} onClose={() => setOpen(false)} />
        )}
      </>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-red-600 font-extrabold text-white select-none shrink-0",
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
