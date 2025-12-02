"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";

import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import { fetchTeams, selectAllTeams } from "@/entities/f1/model/teamsSlice";

import {
  useGetDriversQuery,
  useGetTeamsQuery,
  useGetTeamByIdQuery,
} from "@/entities/f1api/f1api";

export default function Teams() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const { data: driversApi = { drivers: [] } } = useGetDriversQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: teamsApi = { teams: [] } } = useGetTeamsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const teamArg = user?.favoriteTeamId ?? skipToken;
  const { data: teamByIdApi } = useGetTeamByIdQuery(teamArg, {
    refetchOnMountOrArgChange: false,
  });

  const drivers = useAppSelector(selectAllDrivers);
  const teams = useAppSelector(selectAllTeams);

  const sortedDrivers = [...drivers].sort((a, b) => a.id - b.id);
  const sortedTeams = [...teams].sort((a, b) => a.id - b.id);

  const favoriteTeam = user?.favoriteTeamId
    ? teams.find((t) => t.teamId === user.favoriteTeamId)
    : undefined;

  useEffect(() => {
    dispatch(fetchDrivers());
    dispatch(fetchTeams());
  }, [dispatch]);

  return (
    <div className="container mx-auto pb-6">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl mt-3 mb-8"
      >
        F1 Teams 2025
      </motion.h2>

      {user ? (
        <>
          <h3 className="text-2xl mb-6">Your Favorite Team</h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
            {favoriteTeam || teamByIdApi ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                key={favoriteTeam?.id ?? teamByIdApi?.team?.[0]?.teamId}
                className="p-4 rounded-lg relative h-70 cursor-pointer overflow-hidden"
                style={{
                  background: `var(--team-${(
                    favoriteTeam?.teamId ??
                    teamByIdApi?.team?.[0]?.teamId ??
                    ""
                  )
                    .toLowerCase()
                    .replace(" ", "_")})`,
                }}
                onClick={() =>
                  router.push(
                    `/teams/${
                      favoriteTeam?.teamId ?? teamByIdApi?.team?.[0]?.teamId
                    }`
                  )
                }
              >
                <h4 className="text-2xl font-bold mb-3">
                  {teamByIdApi?.team?.[0]?.teamName ??
                    favoriteTeam?.id ??
                    favoriteTeam?.teamId}
                </h4>

                <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 ">
                  {sortedDrivers
                    .filter(
                      (d) =>
                        d.teamId ===
                        (favoriteTeam?.teamId ?? teamByIdApi?.team?.[0]?.teamId)
                    )
                    .slice(0, 2)
                    .map((d) => {
                      const apiDriver = driversApi?.drivers?.find(
                        (da: any) => da.driverId === d.driverId
                      );

                      return (
                        <Link
                          key={d.id ?? d.driverId}
                          href={`/drivers/${d.driverId}`}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-8 h-8 overflow-hidden rounded-full "
                            style={{
                              background: `var(--team-${d?.teamId
                                ?.toLowerCase()
                                .replace(" ", "_")})`,
                            }}
                          >
                            <Image
                              src={d.imgUrl}
                              alt={d.driverId}
                              width={32}
                              height={32}
                              className="object-cover object-top w-full h-full"
                            />
                          </div>

                          <p className="text-sm font-bold">
                            {apiDriver ? (
                              <>
                                <span className="font-normal">
                                  {apiDriver?.name}
                                </span>{" "}
                                <span className="font-bold uppercase">
                                  {apiDriver?.surname}
                                </span>
                              </>
                            ) : (
                              d.driverId
                            )}
                          </p>
                        </Link>
                      );
                    })}
                </div>

                <div className="w-14 h-14 rounded-full absolute right-5 top-5">
                  <Image
                    src={
                      favoriteTeam?.teamImgUrl ??
                      teamByIdApi?.team?.[0]?.teamImgUrl ??
                      ""
                    }
                    alt={
                      favoriteTeam?.teamId ??
                      teamByIdApi?.team?.[0]?.teamId ??
                      "team"
                    }
                    width={56}
                    height={56}
                    className="object-contain object-center w-full h-full p-1"
                  />
                </div>

                <div className="rounded-lg absolute bottom-4 left-5 w-130 overflow-hidden">
                  <Image
                    src={
                      favoriteTeam?.bolidImgUrl ??
                      teamByIdApi?.team?.[0]?.bolidImgUrl ??
                      ""
                    }
                    alt={
                      favoriteTeam?.teamId ??
                      teamByIdApi?.team?.[0]?.teamId ??
                      "bolid"
                    }
                    width={500}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                </div>
              </motion.div>
            ) : (
              <p className="text-sm">You don't have a favorite team set.</p>
            )}
          </div>
        </>
      ) : null}

      {user ? <h3 className="text-2xl mb-6">All Teams</h3> : null}

      <div className="grid md:grid-cols-2 gap-5">
        {sortedTeams.map((team) => {
          const matchedTeam = teamsApi?.teams?.find(
            (teamApi: any) => teamApi.teamId === team.teamId
          );

          const matchedDrivers = sortedDrivers.filter(
            (d) => d.teamId === team.teamId
          );

          return (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              key={team.id}
              className="p-4 rounded-lg relative h-70 cursor-pointer overflow-hidden"
              style={{
                background: `var(--team-${team?.teamId
                  ?.toLowerCase()
                  .replace(" ", "_")})`,
              }}
              onClick={() => router.push(`/teams/${team.teamId}`)}
            >
              <h4 className="text-2xl font-bold mb-3">
                {matchedTeam?.teamName ?? team.teamId}
              </h4>

              <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 ">
                {matchedDrivers.length === 0 ? (
                  <p className="text-sm">No drivers found</p>
                ) : (
                  matchedDrivers.map((driver) => {
                    const matchedDriverApi = driversApi?.drivers?.find(
                      (da: any) => da.driverId === driver.driverId
                    );

                    return (
                      <Link
                        key={driver.id ?? driver.driverId}
                        href={`/drivers/${driver.driverId}`}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-8 h-8 overflow-hidden rounded-full "
                          style={{
                            background: `var(--team-${driver?.teamId
                              ?.toLowerCase()
                              .replace(" ", "_")})`,
                          }}
                        >
                          <Image
                            src={driver.imgUrl}
                            alt={driver.driverId}
                            width={32}
                            height={32}
                            className="object-cover object-top w-full h-full"
                          />
                        </div>

                        <p className="text-sm font-bold">
                          {matchedDriverApi ? (
                            <>
                              <span className="font-normal">
                                {matchedDriverApi.name}
                              </span>{" "}
                              <span className="font-bold uppercase">
                                {matchedDriverApi.surname}
                              </span>
                            </>
                          ) : (
                            driver.driverId
                          )}
                        </p>
                      </Link>
                    );
                  })
                )}
              </div>

              <div className="w-14 h-14 rounded-full absolute right-5 top-5">
                <Image
                  src={team.teamImgUrl}
                  alt={team.teamId}
                  width={56}
                  height={56}
                  className="object-contain object-center w-full h-full p-1"
                />
              </div>

              <div className="rounded-lg absolute bottom-4 left-5 w-130 overflow-hidden">
                <Image
                  src={team.bolidImgUrl}
                  alt={team.teamId}
                  width={500}
                  height={200}
                  className="object-cover w-full h-full"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
