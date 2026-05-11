"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, User, Users, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  useGetDriversQuery,
  useGetTeamsQuery,
  useGetRacesYearQuery,
} from "@/entities/f1api/f1api";
import type {
  ApiDriver,
  ApiTeam,
  DriversResponse,
  TeamsResponse,
  RacesListResponse,
  RaceEntry,
} from "@/entities/f1api/f1api.interfaces";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const currentYear = new Date().getFullYear();

  const { data: driversData } = useGetDriversQuery() as {
    data?: DriversResponse;
  };
  const { data: teamsData } = useGetTeamsQuery() as { data?: TeamsResponse };
  const { data: racesData } = useGetRacesYearQuery(currentYear) as {
    data?: RacesListResponse;
  };

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function go(href: string) {
    router.push(href);
    close();
  }

  const q = query.trim().toLowerCase();

  const { drivers, teams, races } = useMemo(() => {
    if (q.length < 1) {
      return { drivers: [] as ApiDriver[], teams: [] as ApiTeam[], races: [] as RaceEntry[] };
    }
    const allDrivers = driversData?.drivers ?? [];
    const allTeams = teamsData?.teams ?? [];
    const allRaces = racesData?.races ?? [];

    const filteredDrivers = allDrivers
      .filter((d) => {
        const full = `${d.name ?? ""} ${d.surname ?? ""}`.toLowerCase();
        return (
          full.includes(q) ||
          (d.shortName ?? "").toLowerCase().includes(q) ||
          (d.driverId ?? "").toLowerCase().includes(q) ||
          (d.teamId ?? "").toLowerCase().includes(q) ||
          String(d.number ?? "").includes(q)
        );
      })
      .slice(0, 6);

    const filteredTeams = allTeams
      .filter(
        (t) =>
          (t.teamName ?? "").toLowerCase().includes(q) ||
          (t.teamId ?? "").toLowerCase().includes(q)
      )
      .slice(0, 5);

    const filteredRaces = allRaces
      .filter(
        (r) =>
          (r.raceName ?? "").toLowerCase().includes(q) ||
          (r.circuit?.country ?? "").toLowerCase().includes(q) ||
          (r.circuit?.city ?? "").toLowerCase().includes(q) ||
          (r.circuit?.name ?? "").toLowerCase().includes(q)
      )
      .slice(0, 5);

    return {
      drivers: filteredDrivers,
      teams: filteredTeams,
      races: filteredRaces,
    };
  }, [q, driversData, teamsData, racesData]);

  const hasResults = drivers.length > 0 || teams.length > 0 || races.length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition px-2 py-1.5 rounded-md hover:bg-accent"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline text-xs">⌘K</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={close}
            />

            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[101] w-full max-w-lg px-4"
            >
              <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search drivers, teams, races..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {query && (
                    <button onClick={() => setQuery("")}>
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {q.length < 1 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      Start typing to search...
                    </p>
                  ) : !hasResults ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      No results for &quot;{query}&quot;
                    </p>
                  ) : (
                    <div className="py-2">
                      {drivers.length > 0 && (
                        <div>
                          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-1.5">
                            <User className="w-3 h-3" /> Drivers
                          </p>
                          {drivers.map((d) => (
                            <button
                              key={d.driverId}
                              onClick={() => go(`/drivers/${d.driverId}`)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition text-left"
                            >
                              {d.imgUrl ? (
                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/10">
                                  <Image
                                    src={d.imgUrl}
                                    alt={d.driverId}
                                    width={32}
                                    height={32}
                                    className="object-cover object-top w-full h-full"
                                  />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">
                                  {d.name} {d.surname}
                                </p>
                                {d.teamId && (
                                  <p className="text-xs text-muted-foreground capitalize truncate">
                                    {d.teamId.replace("_", " ")}
                                    {d.number ? ` · #${d.number}` : ""}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {teams.length > 0 && (
                        <div>
                          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-1.5 mt-1">
                            <Users className="w-3 h-3" /> Teams
                          </p>
                          {teams.map((t) => (
                            <button
                              key={t.teamId}
                              onClick={() => go(`/teams/${t.teamId}`)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition text-left"
                            >
                              {t.teamImgUrl ? (
                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
                                  <Image
                                    src={t.teamImgUrl}
                                    alt={t.teamId}
                                    width={28}
                                    height={28}
                                    className="object-contain w-6 h-6"
                                  />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                              )}
                              <p className="text-sm font-semibold truncate">
                                {t.teamName ?? t.teamId}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}

                      {races.length > 0 && (
                        <div>
                          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-1.5 mt-1">
                            <Flag className="w-3 h-3" /> Races
                          </p>
                          {races.map((r) => (
                            <button
                              key={r.raceId ?? `${r.round}`}
                              onClick={() =>
                                go(`/schedule/${currentYear}/${r.round}`)
                              }
                              className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-accent transition text-left"
                            >
                              <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-xs font-bold">
                                {r.round}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">
                                  {r.raceName ?? r.circuit?.country}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {r.circuit?.country}
                                  {r.circuit?.city && r.circuit.city !== r.circuit.country
                                    ? ` · ${r.circuit.city}`
                                    : ""}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
