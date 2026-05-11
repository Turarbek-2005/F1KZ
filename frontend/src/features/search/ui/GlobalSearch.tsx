"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSearchDriversQuery, useSearchTeamsQuery } from "@/entities/f1api/f1api";
import type { DriversResponse, TeamsResponse } from "@/entities/f1api/f1api.interfaces";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

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
    setDebounced("");
  }

  function go(href: string) {
    router.push(href);
    close();
  }

  const skip = debounced.length < 2;

  const { data: driversData, isFetching: fetchingDrivers } =
    useSearchDriversQuery(debounced, { skip }) as {
      data?: DriversResponse;
      isFetching: boolean;
    };

  const { data: teamsData, isFetching: fetchingTeams } = useSearchTeamsQuery(
    debounced,
    { skip }
  ) as { data?: TeamsResponse; isFetching: boolean };

  const drivers = driversData?.drivers ?? [];
  const teams = teamsData?.teams ?? [];
  const loading = fetchingDrivers || fetchingTeams;
  const hasResults = drivers.length > 0 || teams.length > 0;

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
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search drivers, teams..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {query && (
                    <button onClick={() => setQuery("")}>
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                  {!debounced || debounced.length < 2 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      Type at least 2 characters
                    </p>
                  ) : loading ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      Searching...
                    </p>
                  ) : !hasResults ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      No results for &quot;{debounced}&quot;
                    </p>
                  ) : (
                    <div className="py-2">
                      {drivers.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-1.5">
                            Drivers
                          </p>
                          {drivers.slice(0, 5).map((d) => (
                            <button
                              key={d.driverId}
                              onClick={() => go(`/drivers/${d.driverId}`)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition text-left"
                            >
                              {d.imgUrl && (
                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/10">
                                  <Image
                                    src={d.imgUrl}
                                    alt={d.driverId}
                                    width={32}
                                    height={32}
                                    className="object-cover object-top w-full h-full"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold">
                                  {d.name} {d.surname}
                                </p>
                                {d.teamId && (
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {d.teamId.replace("_", " ")}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {teams.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-1.5 mt-1">
                            Teams
                          </p>
                          {teams.slice(0, 4).map((t) => (
                            <button
                              key={t.teamId}
                              onClick={() => go(`/teams/${t.teamId}`)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition text-left"
                            >
                              {t.teamImgUrl && (
                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
                                  <Image
                                    src={t.teamImgUrl}
                                    alt={t.teamId}
                                    width={28}
                                    height={28}
                                    className="object-contain w-6 h-6"
                                  />
                                </div>
                              )}
                              <p className="text-sm font-semibold">
                                {t.teamName ?? t.teamId}
                              </p>
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
