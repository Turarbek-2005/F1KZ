"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, Target, UserX } from "lucide-react";
import { Skeleton } from "@/shared/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import { fetchTeams, selectAllTeams } from "@/entities/f1/model/teamsSlice";
import { useGetDriversQuery, useGetTeamsQuery } from "@/entities/f1api/f1api";
import type {
  DriversResponse,
  TeamsResponse,
} from "@/entities/f1api/f1api.interfaces";
import { useGetPublicProfileQuery } from "@/entities/predictions/predictionsApi";
import { PredictionCard } from "@/features/predictions/ui/PredictionCard";
import type { RootState } from "@/shared/store";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { Button } from "@/shared/ui/button";
import { teamCssVar } from "@/shared/lib/teamColor";
import { cn } from "@/shared/lib/utils";
import { grapeNuts } from "@/app/fonts";

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const me = useAppSelector((s: RootState) => s.auth.user);
  const drivers = useAppSelector(selectAllDrivers);
  const teams = useAppSelector(selectAllTeams);
  const driversStatus = useAppSelector((s: RootState) => s.drivers.status);
  const teamsStatus = useAppSelector((s: RootState) => s.teams.status);

  const {
    data: profile,
    isLoading,
    isError,
  } = useGetPublicProfileQuery(id, { skip: !id });

  const { data: driversApi } = useGetDriversQuery() as {
    data?: DriversResponse;
  };
  const { data: teamsApi } = useGetTeamsQuery() as { data?: TeamsResponse };

  useEffect(() => {
    if (driversStatus === "idle") dispatch(fetchDrivers());
    if (teamsStatus === "idle") dispatch(fetchTeams());
  }, [dispatch, driversStatus, teamsStatus]);

  if (isLoading) {
    return (
      <div className="container px-4 sm:px-0 mx-auto pb-10">
        <div className="mt-6 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-5 pb-6 border-b border-border">
          <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shrink-0" />
          <div className="flex-1 w-full flex flex-col items-center sm:items-start gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur rounded-xl p-4 flex flex-col items-center gap-2"
            >
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="container px-4 sm:px-0 mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <UserX className="w-16 h-16 text-muted-foreground" />
        <p className="text-xl font-semibold">User not found</p>
        <Link href="/predictions">
          <Button variant="outline">Back to predictions</Button>
        </Link>
      </div>
    );
  }

  const isMe = me?.id === profile.id;

  const favDrivers = profile.favoriteDriversIds
    .map((driverId) => ({
      id: driverId,
      meta: drivers.find((d) => d.driverId === driverId),
      api: driversApi?.drivers.find((d) => d.driverId === driverId),
    }))
    .filter((d) => d.meta || d.api);

  const favTeams = profile.favoriteTeamsIds
    .map((teamId) => ({
      id: teamId,
      meta: teams.find((t) => t.teamId === teamId),
      api: teamsApi?.teams.find((t) => t.teamId === teamId),
    }))
    .filter((t) => t.meta || t.api);

  const scored = profile.predictions.filter((p) => p.score !== undefined);
  const totalPoints = scored.reduce((s, p) => s + (p.score ?? 0), 0);
  const accuracy =
    scored.length > 0
      ? Math.round((totalPoints / (scored.length * 15)) * 100)
      : 0;

  const memberSince = new Date(profile.createdAt).toLocaleDateString(
    undefined,
    { year: "numeric", month: "long" }
  );

  return (
    <div className="container px-4 sm:px-0 mx-auto pb-10">
      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-5 pb-6 border-b border-border"
      >
        <UserAvatar
          src={profile.avatarUrl}
          name={profile.username}
          viewable
          className="w-20 h-20 sm:w-24 sm:h-24 text-3xl"
        />

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold">
            {profile.username}
            {isMe && (
              <span className="ml-2 text-sm font-normal text-red-400 align-middle">
                you
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            Member since {memberSince}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-muted-foreground">
            <span>{profile.favoriteDriversIds.length} favourite drivers</span>
            <span>·</span>
            <span>{profile.favoriteTeamsIds.length} favourite teams</span>
          </div>
        </div>

        {isMe && (
          <Link href="/profile">
            <Button variant="outline" size="sm">
              My profile
            </Button>
          </Link>
        )}
      </motion.div>

      {/* Prediction stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-10"
      >
        <div className="bg-white/5 backdrop-blur rounded-xl p-4 text-center">
          <p className="text-3xl font-extrabold text-red-500 tabular-nums">
            {totalPoints}
          </p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Total points
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur rounded-xl p-4 text-center">
          <p className="text-3xl font-extrabold tabular-nums">
            {scored.length}
          </p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Races scored
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur rounded-xl p-4 text-center">
          <p className="text-3xl font-extrabold tabular-nums">{accuracy}%</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Accuracy
          </p>
        </div>
      </motion.div>

      {/* Favourite Drivers */}
      {favDrivers.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold mb-4">Favourite Drivers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favDrivers.map(({ id: driverId, meta, api }) => {
              const teamId = meta?.teamId ?? api?.teamId ?? "";
              const name = api
                ? `${api.name ?? ""} ${api.surname ?? ""}`.trim()
                : driverId;
              const number = api?.number;
              const imgUrl = meta?.imgUrl ?? api?.imgUrl;
              const teamName = teamsApi?.teams.find(
                (t) => t.teamId === teamId
              )?.teamName;

              return (
                <Link key={driverId} href={`/drivers/${driverId}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative h-52 rounded-xl overflow-hidden p-4 flex flex-col justify-between cursor-pointer"
                    style={{
                      background:
                        teamCssVar(teamId) ?? "rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="z-10 relative">
                      <p className="text-lg font-bold text-white leading-tight">
                        {name}
                      </p>
                      {teamName && (
                        <p className="text-xs text-white/70">{teamName}</p>
                      )}
                      {number && (
                        <p
                          className={cn(
                            grapeNuts.className,
                            "text-4xl text-white mt-1"
                          )}
                        >
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
                      <span className="text-xs text-white/70">
                        {meta?.nationality}
                      </span>
                    </div>

                    {imgUrl && (
                      <div className="absolute bottom-0 right-[8%] w-32 h-48 overflow-hidden">
                        <Image
                          src={imgUrl}
                          alt={driverId}
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
            {favTeams.map(({ id: teamId, meta, api }) => {
              const teamName = api?.teamName ?? teamId;
              const teamImgUrl = meta?.teamImgUrl ?? api?.teamImgUrl;
              const bolidImgUrl = meta?.bolidImgUrl;

              return (
                <Link key={teamId} href={`/teams/${teamId}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative h-40 rounded-xl overflow-hidden p-4 flex flex-col justify-between cursor-pointer"
                    style={{
                      background:
                        teamCssVar(teamId) ?? "rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="z-10 relative flex items-center gap-3">
                      {teamImgUrl && (
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                          <Image
                            src={teamImgUrl}
                            alt={teamId}
                            width={32}
                            height={32}
                            className="object-contain w-7 h-7"
                          />
                        </div>
                      )}
                      <p className="text-lg font-bold text-white">
                        {teamName}
                      </p>
                    </div>

                    {bolidImgUrl && (
                      <div className="absolute bottom-0 right-2 w-64 h-28 overflow-hidden opacity-80">
                        <Image
                          src={bolidImgUrl}
                          alt={`${teamId} car`}
                          width={256}
                          height={100}
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

      {/* Predictions */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold">Predictions</h2>
        </div>

        {profile.predictions.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            No predictions yet
          </p>
        ) : (
          <div className="space-y-3">
            {profile.predictions
              .slice()
              .sort((a, b) => Number(b.round) - Number(a.round))
              .map((p) => (
                <PredictionCard key={p.raceId} prediction={p} />
              ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
