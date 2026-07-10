"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import DriversDropdownMenu from "./DriversDropdownMenu";
import TeamsDropdownMenu from "./TeamsDropdownMenu";
import { navItemClass } from "./navItem";
import { useLiveTiming } from "@/features/live-timing/hooks/useLiveTiming";

export default function Navbar() {
  const pathname = usePathname();
  const liveEnabled = pathname === "/" || pathname === "/live";
  const { state } = useLiveTiming({ enabled: liveEnabled });
  const isLive = state.SessionStatus?.Status === "Started";

  const currentYear = new Date().getFullYear();

  const links = [
    { seg: "live", href: "/live", label: "Live" },
    { seg: "news", href: "/news", label: "News" },
    { seg: "schedule", href: "/schedule", label: "Schedule" },
    { seg: "results", href: `/results/${currentYear}/1/race`, label: "Results" },
    { seg: "standings", href: "/standings", label: "Standings" },
    { seg: "predictions", href: "/predictions", label: "Predictions" },
    { seg: "compare", href: "/compare", label: "Compare" },
  ];

  // Match on the first path segment so deep pages (e.g. /results/2026/1/race)
  // still highlight their nav item.
  const activeSeg = pathname.split("/")[1] ?? "";

  return (
    <nav className="hidden lg:flex items-center gap-0.5">
      {links.map((link) => {
        const active = activeSeg === link.seg;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={navItemClass(active, "isolate")}
          >
            {active && (
              <motion.span
                layoutId="nav-pill"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-full bg-red-500/10 ring-1 ring-red-500/20"
              />
            )}
            {link.seg === "live" && isLive && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
              </span>
            )}
            <span className="relative">{link.label}</span>
          </Link>
        );
      })}

      <span className="mx-1.5 h-5 w-px bg-border" aria-hidden />

      <DriversDropdownMenu />
      <TeamsDropdownMenu />
    </nav>
  );
}
