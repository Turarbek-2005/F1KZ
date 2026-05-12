"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/shared/lib/hooks";
import {
  Github,
  Send,
  Flag,
  Gauge,
  Users,
  Calendar,
  Trophy,
  BarChart2,
  Instagram,
} from "lucide-react";

const navSections = [
  {
    title: "Explore",
    links: [
      { label: "News", href: "/news", icon: <Flag className="w-3.5 h-3.5" /> },
      {
        label: "Schedule",
        href: "/schedule",
        icon: <Calendar className="w-3.5 h-3.5" />,
      },
      {
        label: "Standings",
        href: "/standings",
        icon: <Trophy className="w-3.5 h-3.5" />,
      },
      {
        label: "Compare",
        href: "/compare",
        icon: <BarChart2 className="w-3.5 h-3.5" />,
      },
    ],
  },
  {
    title: "Formula 1",
    links: [
      {
        label: "Drivers",
        href: "/drivers",
        icon: <Users className="w-3.5 h-3.5" />,
      },
      {
        label: "Teams",
        href: "/teams",
        icon: <Flag className="w-3.5 h-3.5" />,
      },
      {
        label: "Results",
        href: `/results/${new Date().getFullYear()}/1/race`,
        icon: <Gauge className="w-3.5 h-3.5" />,
      },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);

  if (pathname === "/") return null;

  return (
    <footer className="w-full border-t border-border bg-background mt-auto">
      <div className="h-[2px] w-full bg-red-500" />

      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/F1KZ logo.png"
                alt="F1KZ Logo"
                width={100}
                height={50}
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your ultimate source for Formula 1 news, stats, and results from
              Kazakhstan.
            </p>
            <div className="flex gap-3 mt-1">
              <Link
                href="https://github.com/Turarbek-2005"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="https://t.me/kab_desh"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Send className="w-5 h-5" />
              </Link>
              <Link
                href="https://www.instagram.com/kab_desh/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Nav sections */}
          {navSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-red-500">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <span className="text-red-500 group-hover:text-red-400 transition-colors">
                        {link.icon}
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Account */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-red-500">
              Account
            </h3>
            <ul className="flex flex-col gap-2">
              {(user
                ? [
                    { label: "Profile", href: "/profile" },
                    { label: "Settings", href: "/settings" },
                  ]
                : [
                    { label: "Sign In", href: "/login" },
                    { label: "Register", href: "/register" },
                  ]
              ).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} F1KZ. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Developed by{" "}
            <span className="text-red-500 font-medium">kab_desh</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
