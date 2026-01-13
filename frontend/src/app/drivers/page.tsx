"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import {
  useGetDriversQuery,
  useGetTeamsQuery,
} from "@/entities/f1api/f1api";
import { cn } from "@/shared/lib/utils";
import { grapeNuts } from "../fonts";
import { Loader2 } from "lucide-react";

interface ApiDriver {
  driverId: string;
  name?: string;
  surname?: string;
  number?: string | number;
  imgUrl?: string;
  teamId?: string;
  nationalityImgUrl?: string;
}

interface ApiTeam {
  teamId: string;
  teamName?: string;
}

type DriversApiResponse = {
  drivers: ApiDriver[];
};

type TeamsApiResponse = {
  teams: ApiTeam[];
};

export default function Drivers() {
  const user = useAppSelector((state) => state.auth.user);

  const { data: driversApi = { drivers: [] }, loading: driversLoading } = useGetDriversQuery(undefined, {
    refetchOnMountOrArgChange: false,
  }) as { data?: DriversApiResponse, loading?: boolean };

  const { data: teamsApi = { teams: [] }, loading: teamsLoading } = useGetTeamsQuery(
    undefined,
    {
      refetchOnMountOrArgChange: false,
    }
  ) as { data?: TeamsApiResponse, loading?: boolean };

  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);

  const sortedDrivers = [...drivers].sort((a, b) => a.id - b.id);

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  if (driversLoading || teamsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-0 mx-auto pb-6">
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
          <h3 className="text-2xl mb-6">Your Favorite Drivers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {user.favoriteDriversIds && user.favoriteDriversIds.length ? (
              user.favoriteDriversIds.map((favId: string) => {
                const favDriver = drivers.find((d) => d.driverId === favId);
                const favDriverApi = (driversApi.drivers as ApiDriver[]).find(
                  (d) => d.driverId === favId
                );
                const favTeamIdLocal =
                  favDriver?.teamId ?? favDriverApi?.teamId ?? "";
                const favTeam =
                  (teamsApi.teams as ApiTeam[]).find(
                    (t) => t.teamId === favTeamIdLocal
                  ) || undefined;
                const favDriverDisplayId =
                  favDriver?.driverId ?? favDriverApi?.driverId ?? favId;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    key={favId}
                    className="p-4 rounded-lg relative h-70 cursor-pointer"
                    style={{
                      background: `var(--team-${favTeamIdLocal
                        .toLowerCase()
                        .replace(" ", "_")})`,
                    }}
                  >
                    <Link key={favId} href={`/drivers/${favDriverDisplayId}`}>
                      <div className="flex flex-col justify-between h-full">
                        <div className="flex flex-col">
                          {favDriverApi && favTeam ? (
                            <>
                              <span className="text-2xl font-bold">
                                {favDriverApi?.name} {favDriverApi?.surname}
                              </span>{" "}
                              <span className="text-sm">
                                {favTeam?.teamName}
                              </span>
                              <span
                                className={cn(
                                  grapeNuts.className,
                                  "text-4xl font-medium font mt-2"
                                )}
                              >
                                {favDriverApi?.number}
                              </span>
                            </>
                          ) : favDriver ? (
                            <>
                              <span className="text-2xl font-bold">
                                {favDriver?.driverId}
                              </span>
                              <span className="text-sm">{favDriver?.teamId}</span>
                            </>
                          ) : (
                            <span className="text-sm">Driver {favId}</span>
                          )}
                        </div>

                        <div className="w-8 h-8 rounded-full border-2  border-white">
                          {favDriver?.nationalityImgUrl ? (
                            <Image
                              src={favDriver.nationalityImgUrl}
                              alt={favDriver.nationality ?? "nat"}
                              width={32}
                              height={32}
                              className="object-cover object-top w-full h-full rounded-full"
                            />
                          ) : null}
                        </div>
                      </div>

                      {favDriver?.imgUrl ? (
                        <div className="w-50 h-60 overflow-hidden absolute bottom-0 right-1/5 md:right-[10%] lg:right-1/5 2xl:right-[10%] ">
                          <Image
                            src={favDriver.imgUrl}
                            alt={favDriver.driverId}
                            width={160}
                            height={240}
                            className="object-cover object-top w-full h-full"
                          />
                        </div>
                      ) : favDriverApi?.imgUrl ? (
                        <div className="w-50 h-60 overflow-hidden absolute bottom-0 right-1/5 md:right-[10%] lg:right-1/5 2xl:right-[10%] ">
                          <Image
                            src={favDriverApi.imgUrl}
                            alt={favDriverApi.driverId}
                            width={160}
                            height={240}
                            className="object-cover object-top w-full h-full"
                          />
                        </div>
                      ) : null}
                    </Link>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-sm">You don&apos;t have a favorite driver set.</p>
            )}
          </div>
        </>
      ) : null}

      {user ? <h3 className="text-2xl mb-6">All Drivers</h3> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-5 ">
        {sortedDrivers.map((driver) => {
          const matchedDriver = (driversApi.drivers as ApiDriver[]).find(
            (driverApi) => driverApi.driverId === driver.driverId
          );
          const matchedTeam = (teamsApi.teams as ApiTeam[]).find(
            (teamApi) => teamApi.teamId === driver.teamId
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
