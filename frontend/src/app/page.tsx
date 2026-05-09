"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/shared/ui/card";

// F1 Car SVG Component
function F1Car({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main Body */}
      <path
        d="M30 35 L50 30 L70 28 L120 26 L160 28 L175 32 L180 38 L175 42 L160 44 L50 44 L35 42 L30 38 Z"
        fill="url(#bodyGradient)"
        stroke="#ff0000"
        strokeWidth="1"
      />
      
      {/* Cockpit */}
      <ellipse cx="85" cy="32" rx="12" ry="8" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
      <ellipse cx="85" cy="32" rx="8" ry="5" fill="#0a0a0a" />
      
      {/* Front Wing */}
      <path
        d="M25 36 L10 34 L5 38 L10 42 L25 40 Z"
        fill="#1a1a1a"
        stroke="#ff0000"
        strokeWidth="1"
      />
      <rect x="5" y="32" width="25" height="2" fill="#ff0000" />
      <rect x="5" y="42" width="25" height="2" fill="#ff0000" />
      
      {/* Rear Wing */}
      <rect x="170" y="20" width="4" height="18" fill="#1a1a1a" />
      <rect x="165" y="16" width="20" height="4" rx="1" fill="#ff0000" />
      <rect x="168" y="22" width="14" height="3" rx="1" fill="#333" />
      
      {/* Side Pods */}
      <path
        d="M60 44 L65 50 L110 50 L115 44"
        fill="#1a1a1a"
        stroke="#ff0000"
        strokeWidth="1"
      />
      
      {/* Air Intake */}
      <path
        d="M95 26 L100 18 L110 18 L105 26"
        fill="#1a1a1a"
        stroke="#333"
        strokeWidth="1"
      />
      
      {/* Halo */}
      <path
        d="M75 30 Q85 20 95 30"
        fill="none"
        stroke="#444"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Front Wheel */}
      <ellipse cx="45" cy="44" rx="10" ry="10" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
      <ellipse cx="45" cy="44" rx="6" ry="6" fill="#2a2a2a" />
      <ellipse cx="45" cy="44" rx="3" ry="3" fill="#ff0000" />
      
      {/* Rear Wheel */}
      <ellipse cx="145" cy="44" rx="12" ry="12" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
      <ellipse cx="145" cy="44" rx="7" ry="7" fill="#2a2a2a" />
      <ellipse cx="145" cy="44" rx="3" ry="3" fill="#ff0000" />
      
      {/* Red Stripes */}
      <rect x="55" y="28" width="60" height="2" fill="#ff0000" rx="1" />
      <rect x="60" y="32" width="50" height="1" fill="#ff3333" rx="0.5" />
      
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="50%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Speed Lines Component
function SpeedLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-[2px] bg-gradient-to-r from-red-500/60 to-transparent"
          style={{
            top: `${15 + i * 10}%`,
            width: `${100 + Math.random() * 150}px`,
          }}
          initial={{ x: "100vw", opacity: 0 }}
          animate={{ x: "-200px", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 1.5,
            delay: i * 0.15,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const currentYear = new Date().getFullYear();
  const links = [
    { name: "News", href: "/news" },
    { name: "Schedule", href: "/schedule" },
    { name: "Results", href: `/results/${currentYear}/1/race` },
    { name: "Standings", href: "/standings" },
    { name: "Drivers", href: "/drivers" },
    { name: "Teams", href: "/teams" },
  ];

  return (
    <main className="h-[calc(100vh-4rem)] bg-[url('/bg-home.jpg')] bg-cover bg-center flex flex-col items-center justify-center text-white px-6 relative overflow-hidden">
      {/* Animated F1 Car */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main F1 Car Animation */}
        <motion.div
          className="absolute top-[20%]"
          initial={{ x: "-300px" }}
          animate={{ x: "calc(100vw + 300px)" }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <F1Car className="w-48 h-16 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]" />
          {/* Exhaust Trail */}
          <motion.div
            className="absolute right-48 top-1/2 -translate-y-1/2 w-32 h-4 bg-gradient-to-l from-transparent via-red-500/30 to-orange-500/20 blur-sm"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        </motion.div>

        {/* Second F1 Car (smaller, faster) */}
        <motion.div
          className="absolute top-[70%]"
          initial={{ x: "calc(100vw + 200px)" }}
          animate={{ x: "-400px" }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 8,
            delay: 2,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <div className="scale-x-[-1]">
            <F1Car className="w-36 h-12 drop-shadow-[0_0_15px_rgba(255,0,0,0.4)] opacity-70" />
          </div>
        </motion.div>

        {/* Particle Effects */}
        <SpeedLines />
      </div>

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-6xl font-extrabold tracking-tight mb-12 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] relative z-10"
      >
        Welcome to <span className="text-red-500">F1KZ</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 max-w-4xl w-full relative z-10"
      >
        {links.map((link, i) => (
          <motion.div
            key={link.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300 }}
            // className={i === links.length - 1 ? "sm:col-span-2 mx-auto w-full sm:w-1/2" : ""}
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

      <footer className="mt-16 text-white text-sm relative z-10">
        © {new Date().getFullYear()} F1KZ. All rights reserved.
      </footer>
    </main>
  );
}
