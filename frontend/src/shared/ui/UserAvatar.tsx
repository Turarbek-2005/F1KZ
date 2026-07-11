import Image from "next/image";
import { cn } from "@/shared/lib/utils";

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
}

// Renders the user's avatar image when present, otherwise their initials on a
// red disc. Size and font-size come from `className` so callers control scale.
export function UserAvatar({ src, name, className }: Props) {
  if (src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-muted shrink-0",
          className,
        )}
      >
        <Image
          src={src}
          alt={name ?? "avatar"}
          fill
          sizes="128px"
          className="object-cover"
          unoptimized
        />
      </div>
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
