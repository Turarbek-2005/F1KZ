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
  }, [dispatch]);

  useEffect(() => {
    console.log("Drivers from API:", driversApi);
    console.log("Teams from API:", teamsApi);
  }, [driversApi, teamsApi]);

  return (
    <div className="container mx-auto pb-6">
      <h2 className="text-4xl mt-3 mb-8">F1 Drivers 2025</h2>

      <div className=" grid grid-cols-2 gap-5 ">
        {sortedDrivers.map((driver) => {
          const matchedDriver = driversApi?.drivers?.find(
            (driverApi: any) => driverApi.driverId === driver.driverId
          );
          const matchedTeam = teamsApi?.teams?.find(
            (teamApi: any) => teamApi.teamId === driver.teamId
          );
          return (
            <div
              key={driver.id}
              className=" p-4 rounded-lg relative h-70 cursor-pointer"
              style={{
                background: `var(--team-${matchedTeam?.teamId
                  ?.toLowerCase()
                  .replace(" ", "_")})`,
              }}
            >
              <div >
                {matchedDriver && matchedTeam ? (
                  <>
                    <span className="text-2xl font-bold">
                      {matchedDriver.name} {matchedDriver.surname}
                    </span>{" "}
                    <br />
                    {/* {matchedDriver.nationality} <br /> */}
                    <span className="text-sm">{matchedTeam.teamName}</span>
                    <br />
                    <span className="text-4xl font-medium font mt-4">
                      {matchedDriver.number}
                    </span>
                  </>
                ) : (
                  driver.teamId
                )}
              </div>

              <div className="w-50 h-60 overflow-hidden absolute bottom-0 right-1/5">
                <Image
                  src={driver.imgUrl}
                  alt={driver.driverId}
                  width={160}
                  height={240}
                  className="object-cover object-top w-full h-full"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
