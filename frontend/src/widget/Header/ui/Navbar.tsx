"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DriversDropdownMenu from "./DriversDropdownMenu";
import TeamsDropdownMenu from "./TeamsDropdownMenu";
import { cn } from "@/shared/lib/utils";
import { useLiveTiming } from "@/features/live-timing/hooks/useLiveTiming";

export default function Navbar() {
  const pathname = usePathname();
  const { state } = useLiveTiming();

  const currentYear = new Date().getFullYear();

  const links = [
    { href: "/live", label: "Live" },
    { href: "/news", label: "News" },
    { href: "/schedule", label: "Schedule" },
    { href: `/results/${currentYear}/1/race`, label: "Results" },
    { href: "/standings", label: "Standings" },
    { href: "/predictions", label: "Predictions" },
    { href: "/compare", label: "Compare" },
  ];

  return (
    <nav className=" gap-3 hidden lg:flex">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "transition hover:text-red-500 flex items-center gap-1.5",
            pathname === link.href && "text-red-500",
          )}
        >
          {link.href === "/live" &&
            state.SessionStatus?.Status === "Started" && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
              </span>
            )}
          {link.label}
        </Link>
      ))}

      <DriversDropdownMenu />
      <TeamsDropdownMenu />
    </nav>
  );
}
