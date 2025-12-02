"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import {
  fetchDrivers,
  selectAllDrivers,
  selectDriverById,
} from "@/entities/f1/model/driversSlice";
// import { fetchMe } from "@/entities/auth/model/authSlice";
import {
  useGetDriversQuery,
  useGetTeamsQuery,
  useGetDriverByIdQuery,
  useGetTeamByIdQuery,
} from "@/entities/f1api/f1api";
import { cn } from "@/shared/lib/utils";
import { grapeNuts } from "../fonts";

export default function Drivers() {
  const user = useAppSelector((state) => state.auth.user);

  const { data: driversApi = [] } = useGetDriversQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: teamsApi = [] } = useGetTeamsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const driverArg = user?.favoriteDriverId ?? skipToken;
  const teamArg = user?.favoriteTeamId ?? skipToken;

  const { data: driverByIdApi } = useGetDriverByIdQuery(driverArg, {
    refetchOnMountOrArgChange: false,
  });
  const { data: teamByIdApi } = useGetTeamByIdQuery(teamArg, {
    refetchOnMountOrArgChange: false,
  });

  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);

  const favoriteDriver = useAppSelector((state) =>
    user?.favoriteDriverId ? selectDriverById(state, user.favoriteDriverId) : undefined
  );

  const sortedDrivers = [...drivers].sort((a, b) => a.id - b.id);

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  const favTeamId =
    favoriteDriver?.teamId ?? teamByIdApi?.team?.[0]?.teamId ?? "";

  const favDriverId =
    favoriteDriver?.driverId ?? driverByIdApi?.driver?.driverId ?? "";

  return (
    <div className="container mx-auto pb-6">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl mt-3 mb-8"
      >
        F1 Drivers 2025
      </motion.h2>

      {user ? (
        <>
          <h3 className="text-2xl mb-6">Your Favorite Driver</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              key={favoriteDriver?.id ?? favDriverId}
              className="p-4 rounded-lg relative h-70 cursor-pointer mb-6"
              style={{
                background: `var(--team-${favTeamId.toLowerCase().replace(
                  " ",
                  "_"
                )})`,
              }}
            >
              <Link key={favDriverId} href={`/drivers/${favDriverId}`}>
                <div className="flex flex-col justify-between h-full">
                  <div className="flex flex-col">
                    {driverByIdApi && teamByIdApi ? (
                      <>
                        <span className="text-2xl font-bold">
                          {driverByIdApi?.driver.name} {driverByIdApi?.driver.surname}
                        </span>{" "}
                        <span className="text-sm">
                          {teamByIdApi?.team[0].teamName}
                        </span>
                        <span
                          className={cn(
                            grapeNuts.className,
                            "text-4xl font-medium font mt-2"
                          )}
                        >
                          {driverByIdApi?.driver.number}
                        </span>
                      </>
                    ) : favoriteDriver ? (
                      <>
                        <span className="text-2xl font-bold">
                          {favoriteDriver?.driverId}
                        </span>
                        <span className="text-sm">{favoriteDriver?.teamId}</span>
                      </>
                    ) : (
                      <span className="text-sm">You don't have a favorite driver set.</span>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-full border-2  border-white">
                    {favoriteDriver?.nationalityImgUrl ? (
                      <Image
                        src={favoriteDriver.nationalityImgUrl}
                        alt={favoriteDriver.nationality ?? "nat"}
                        width={32}
                        height={32}
                        className="object-cover object-top w-full h-full rounded-full"
                      />
                    ) : null}
                  </div>
                </div>

                {favoriteDriver?.imgUrl ? (
                  <div className="w-50 h-60 overflow-hidden absolute bottom-0 right-1/5 md:right-[10%] lg:right-1/5 2xl:right-[10%] ">
                    <Image
                      src={favoriteDriver.imgUrl}
                      alt={favoriteDriver.driverId}
                      width={160}
                      height={240}
                      className="object-cover object-top w-full h-full"
                    />
                  </div>
                ) : driverByIdApi?.driver?.imgUrl ? (
                  <div className="w-50 h-60 overflow-hidden absolute bottom-0 right-1/5 md:right-[10%] lg:right-1/5 2xl:right-[10%] ">
                    <Image
                      src={driverByIdApi.driver.imgUrl}
                      alt={driverByIdApi.driver.driverId}
                      width={160}
                      height={240}
                      className="object-cover object-top w-full h-full"
                    />
                  </div>
                ) : null}
              </Link>
            </motion.div>
          </div>
        </>
      ) : null}

      {user ? <h3 className="text-2xl mb-6">All Drivers</h3> : null}
      
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-5 ">
        {sortedDrivers.map((driver) => {
          const matchedDriver = driversApi?.drivers?.find(
            (driverApi: any) => driverApi.driverId === driver.driverId
          );
          const matchedTeam = teamsApi?.teams?.find(
            (teamApi: any) => teamApi.teamId === driver.teamId
          );
          return (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              key={driver.id}
              className=" p-4 rounded-lg relative h-70 cursor-pointer"
              style={{
                background: `var(--team-${matchedTeam?.teamId
                  ?.toLowerCase()
                  .replace(" ", "_")})`,
              }}
            >
              <Link key={driver.id} href={`/drivers/${driver.driverId}`}>
                <div className="flex flex-col justify-between h-full">
                  <div className="flex flex-col">
                    {matchedDriver && matchedTeam ? (
                      <>
                        <span className="text-2xl font-bold">
                          {matchedDriver.name} {matchedDriver.surname}
                        </span>{" "}
                        <span className="text-sm">{matchedTeam.teamName}</span>
                        <span
                          className={cn(
                            grapeNuts.className,
                            "text-4xl font-medium font mt-2"
                          )}
                        >
                          {matchedDriver.number}
                        </span>
                      </>
                    ) : (
                      driver.teamId
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full border-2  border-white">
                    {driver.nationalityImgUrl ? (
                      <Image
                        src={driver.nationalityImgUrl}
                        alt={driver.nationality}
                        width={32}
                        height={32}
                        className="object-cover object-top w-full h-full rounded-full"
                      />
                    ) : null}
                  </div>
                </div>

                {driver.imgUrl ? (
                  <div className="w-50 h-60 overflow-hidden absolute bottom-0 right-1/5 md:right-[10%] lg:right-1/5 2xl:right-[10%] ">
                    <Image
                      src={driver.imgUrl}
                      alt={driver.driverId}
                      width={160}
                      height={240}
                      className="object-cover object-top w-full h-full"
                    />
                  </div>
                ) : null}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
