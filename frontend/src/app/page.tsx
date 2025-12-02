"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/shared/ui/card";
export default function Home() {
  const links = [
    { name: "Races", href: "/races" },
    // { name: "Results", href: "/results" },
    { name: "Standings", href: "/standings" },
    { name: "Drivers", href: "/drivers" },
    { name: "Teams", href: "/teams" },
  ];

  return (
    <main className="h-[calc(100vh-4rem)] bg-[url('/bg-home.jpg')] bg-cover bg-center flex flex-col items-center justify-center text-white px-6">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-6xl font-extrabold tracking-tight mb-12 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
      >
        Welcome to <span className="text-red-500">F1KZ</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 max-w-4xl w-full"
      >
        {links.map((link) => (
          <motion.div
            key={link.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link href={link.href}>
              <Card className="bg-black/70 hover:bg-red-600 border border-gray-800 hover:border-red-400 transition-all duration-300 text-white backdrop-blur-sm shadow-xl">
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
