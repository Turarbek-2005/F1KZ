"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import { fetchTeams, selectAllTeams } from "@/entities/f1/model/teamsSlice";
import { useGetDriversQuery, useGetTeamsQuery } from "@/entities/f1api/f1api";
import { motion } from "framer-motion";

export default function Teams() {
  const { data: driversApi = { drivers: [] } } = useGetDriversQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: teamsApi = { teams: [] } } = useGetTeamsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);
  const teams = useAppSelector(selectAllTeams);

  const sortedDrivers = [...drivers].sort((a, b) => a.id - b.id);
  const sortedTeams = [...teams].sort((a, b) => a.id - b.id);

  useEffect(() => {
    dispatch(fetchDrivers());
    dispatch(fetchTeams());
  }, [dispatch]);

  useEffect(() => {
    console.log("Drivers from API:", driversApi);
    console.log("Teams from API:", teamsApi);
    console.log("Drivers from Redux store:", drivers);
    console.log("Teams from Redux store:", teams);
  }, [driversApi, teamsApi, drivers, teams]);

  return (
    <div>
      <div className="container mx-auto pb-6">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl mt-3 mb-8"
        >
          F1 Teams 2025
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-5">
          {sortedTeams.map((team) => {
            const matchedTeam = teamsApi?.teams?.find(
              (teamApi: any) => teamApi.teamId === team.teamId
            );

            const matchedDrivers = sortedDrivers.filter(
              (d) => d.teamId === team.teamId
            );

            return (
              <Link key={team.id} href={`/teams/${team.teamId}`}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  key={team.id}
                  className="p-4 rounded-lg  relative h-70 cursor-pointer overflow-hidden"
                  style={{
                    background: `var(--team-${team?.teamId
                      ?.toLowerCase()
                      .replace(" ", "_")})`,
                  }}
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
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
