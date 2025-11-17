"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DriversDropdownMenu from "./DriversDropdownMenu";
import TeamsDropdownMenu from "./TeamsDropdownMenu";
import { cn } from "@/shared/lib/utils";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/races", label: "Races" },
    { href: "/result", label: "Results" },
    { href: "/standings", label: "Standings" },
  ];

  return (
    <nav className="flex gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "transition hover:text-red-500",
            pathname === link.href && "text-red-500"
          )}
        >
          {link.label}
        </Link>
      ))}

      {/* dropdown menus */}
      <DriversDropdownMenu />
      <TeamsDropdownMenu />
    </nav>
  );
}
