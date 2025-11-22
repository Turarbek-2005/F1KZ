"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import { useGetDriversQuery, useGetTeamsQuery } from "@/entities/f1api/f1api";
import { motion } from "framer-motion";

export default function Drivers() {
  const { data: driversApi = [] } = useGetDriversQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: teamsApi = [] } = useGetTeamsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);
  const sortedDrivers = [...drivers].sort((a, b) => a.id - b.id);
  useEffect(() => {
    dispatch(fetchDrivers());
    console.log("Fetched drivers from Redux store:", drivers);
  }, [dispatch]);

  useEffect(() => {
    console.log("Drivers from API:", driversApi);
    console.log("Teams from API:", teamsApi);
  }, [driversApi, teamsApi]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-5 ">
        {sortedDrivers.map((driver) => {
          const matchedDriver = driversApi?.drivers?.find(
            (driverApi: any) => driverApi.driverId === driver.driverId
          );
          const matchedTeam = teamsApi?.teams?.find(
            (teamApi: any) => teamApi.teamId === driver.teamId
          );
          return (
            <Link key={driver.id} href={`/drivers/${driver.driverId}`}>
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
                <div className="flex flex-col justify-between h-full">
                  <div className="flex flex-col">
                    {matchedDriver && matchedTeam ? (
                      <>
                        <span className="text-2xl font-bold">
                          {matchedDriver.name} {matchedDriver.surname}
                        </span>{" "}
                        <span className="text-sm">{matchedTeam.teamName}</span>
                        <span className="text-4xl font-medium font mt-2">
                          {matchedDriver.number}
                        </span>
                      </>
                    ) : (
                      driver.teamId
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full border-2  border-white">
                    <Image
                      src={driver.nationalityImgUrl}
                      alt={driver.nationality}
                      width={32}
                      height={32}
                      className="object-cover object-top w-full h-full rounded-full"
                    />
                  </div>
                </div>

                <div className="w-50 h-60 overflow-hidden absolute bottom-0 right-1/5 md:right-[10%] lg:right-1/5 2xl:right-[10%] ">
                  <Image
                    src={driver.imgUrl}
                    alt={driver.driverId}
                    width={160}
                    height={240}
                    className="object-cover object-top w-full h-full"
                  />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
