"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/shared/ui/card";
import { NextRaceCountdown } from "@/features/countdown/ui/NextRaceCountdown";
import { LastRaceWidget } from "@/features/last-race/ui/LastRaceWidget";
export default function Home() {
  const currentYear = new Date().getFullYear();
  const links = [
    { name: "News", href: "/news" },
    { name: "Schedule", href: "/schedule" },
    { name: "Results", href: `/results/${currentYear}/1/race` },
    { name: "Standings", href: "/standings" },
    { name: "Predictions", href: "/predictions" },
    { name: "Drivers", href: "/drivers" },
    { name: "Teams", href: "/teams" },
    { name: "Compare", href: "/compare" },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[url('/bg-home-white.jpg')] dark:bg-[url('/bg-home.jpg')] bg-cover bg-center bg-fixed flex flex-col items-center justify-center px-6 py-10 gap-4">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-6xl font-extrabold tracking-tight mb-12 text-neutral-600 dark:text-white text-center dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
      >
        Welcome to <span className="text-red-500">F1KZ</span>
      </motion.h1>

      <NextRaceCountdown />

      <LastRaceWidget />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 max-w-4xl w-full mt-6"
      >
        {links.map((link, i) => (
          <motion.div
            key={link.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link href={link.href}>
              <Card className="bg-black/70 h-16 sm:h-20 p-4 sm:p-6 hover:bg-red-600 border border-gray-800 hover:border-red-400 transition-all duration-300 text-white backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-center text-xl font-semibold">
                    {link.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <footer className="mt-16 text-white text-sm">
        © {new Date().getFullYear()} F1KZ. All rights reserved.
      </footer>
    </main>
  );
}
