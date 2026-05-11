"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Settings, LogOut, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { logout, logoutUser } from "@/entities/auth/model/authSlice";
import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import { fetchTeams, selectAllTeams } from "@/entities/f1/model/teamsSlice";
import { useGetDriversQuery, useGetTeamsQuery } from "@/entities/f1api/f1api";
import type {
  ApiDriver,
  ApiTeam,
  DriversResponse,
  TeamsResponse,
} from "@/entities/f1api/f1api.interfaces";
import type { RootState } from "@/shared/store";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { grapeNuts } from "@/app/fonts";

function teamVar(teamId?: string) {
  if (!teamId) return undefined;
  return `var(--team-${teamId.toLowerCase().replace(" ", "_")})`;
}

function Initials({ name }: { name: string }) {
  const letters = name
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-600 flex items-center justify-center text-white text-3xl font-extrabold select-none shrink-0">
      {letters}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const drivers = useAppSelector(selectAllDrivers);
  const teams = useAppSelector(selectAllTeams);
  const driversStatus = useAppSelector((s: RootState) => s.drivers.status);
  const teamsStatus = useAppSelector((s: RootState) => s.teams.status);

  const { data: driversApi } = useGetDriversQuery() as {
    data?: DriversResponse;
  };
  const { data: teamsApi } = useGetTeamsQuery() as { data?: TeamsResponse };

  useEffect(() => {
    if (driversStatus === "idle") dispatch(fetchDrivers());
    if (teamsStatus === "idle") dispatch(fetchTeams());
  }, [dispatch, driversStatus, teamsStatus]);

  async function handleLogout() {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {}
    dispatch(logout());
    router.push("/login");
  }

  if (!user) {
    return (
      <div className="container px-4 sm:px-0 mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <UserCircle2 className="w-16 h-16 text-muted-foreground" />
        <p className="text-xl font-semibold">You are not logged in</p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  const favDriverIds: string[] = user.favoriteDriversIds ?? [];
  const favTeamIds: string[] = user.favoriteTeamsIds ?? [];

  const favDrivers = favDriverIds
    .map((id) => {
      const meta = drivers.find((d) => d.driverId === id);
      const api = driversApi?.drivers.find((d) => d.driverId === id);
      return { id, meta, api };
    })
    .filter((d) => d.meta || d.api);

  const favTeams = favTeamIds
    .map((id) => {
      const meta = teams.find((t) => t.teamId === id);
      const api = teamsApi?.teams.find((t) => t.teamId === id);
      return { id, meta, api };
    })
    .filter((t) => t.meta || t.api);

  return (
    <div className="container px-4 sm:px-0 mx-auto pb-10">
      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-5 pb-6 border-b border-border"
      >
        <Initials name={user.username} />

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold">{user.username}</h1>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-muted-foreground">
            <span>{favDriverIds.length} favourite drivers</span>
            <span>·</span>
            <span>{favTeamIds.length} favourite teams</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/settings">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" /> Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-500 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </motion.div>

      {/* Favourite Drivers */}
      {favDrivers.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold mb-4">Favourite Drivers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favDrivers.map(({ id, meta, api }) => {
              const teamId = meta?.teamId ?? api?.teamId ?? "";
              const name = api ? `${api.name ?? ""} ${api.surname ?? ""}`.trim() : id;
              const number = api?.number;
              const imgUrl = meta?.imgUrl ?? api?.imgUrl;
              const teamName = teamsApi?.teams.find((t) => t.teamId === teamId)?.teamName;

              return (
                <Link key={id} href={`/drivers/${id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative h-52 rounded-xl overflow-hidden p-4 flex flex-col justify-between cursor-pointer"
                    style={{ background: teamVar(teamId) ?? "rgba(255,255,255,0.05)" }}
                  >
                    <div className="z-10 relative">
                      <p className="text-lg font-bold text-white leading-tight">{name}</p>
                      {teamName && (
                        <p className="text-xs text-white/70">{teamName}</p>
                      )}
                      {number && (
                        <p className={cn(grapeNuts.className, "text-4xl text-white mt-1")}>
                          {number}
                        </p>
                      )}
                    </div>

                    <div className="z-10 relative flex items-center gap-2">
                      {meta?.nationalityImgUrl && (
                        <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white/60">
                          <Image
                            src={meta.nationalityImgUrl}
                            alt="flag"
                            width={24}
                            height={24}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <span className="text-xs text-white/70">{meta?.nationality}</span>
                    </div>

                    {imgUrl && (
                      <div className="absolute bottom-0 right-[8%] w-32 h-48 overflow-hidden">
                        <Image
                          src={imgUrl}
                          alt={id}
                          width={128}
                          height={192}
                          className="object-cover object-top w-full h-full"
                        />
                      </div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Favourite Teams */}
      {favTeams.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold mb-4">Favourite Teams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favTeams.map(({ id, meta, api }) => {
              const teamName = api?.teamName ?? id;
              const teamImgUrl = meta?.teamImgUrl ?? api?.teamImgUrl;
              const bolidImgUrl = meta?.bolidImgUrl;

              return (
                <Link key={id} href={`/teams/${id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative h-40 rounded-xl overflow-hidden p-4 flex flex-col justify-between cursor-pointer"
                    style={{ background: teamVar(id) ?? "rgba(255,255,255,0.05)" }}
                  >
                    <div className="z-10 relative flex items-center gap-3">
                      {teamImgUrl && (
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                          <Image
                            src={teamImgUrl}
                            alt={id}
                            width={32}
                            height={32}
                            className="object-contain w-7 h-7"
                          />
                        </div>
                      )}
                      <p className="text-lg font-bold text-white">{teamName}</p>
                    </div>

                    {bolidImgUrl && (
                      <div className="absolute bottom-0 right-2 h-20 w-40 overflow-hidden opacity-80">
                        <Image
                          src={bolidImgUrl}
                          alt={`${id} car`}
                          width={160}
                          height={80}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.section>
      )}

      {favDrivers.length === 0 && favTeams.length === 0 && (
        <div className="text-center text-muted-foreground py-16">
          <p className="text-lg mb-2">No favourites yet</p>
          <p className="text-sm mb-4">
            Go to{" "}
            <Link href="/settings" className="underline hover:text-foreground">
              Settings
            </Link>{" "}
            to add your favourite drivers and teams.
          </p>
        </div>
      )}
    </div>
  );
}
