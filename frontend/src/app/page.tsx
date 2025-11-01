"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { fetchTeams, selectAllTeams } from "@/entities/f1/model/teamsSlice";
import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";

export default function Home() {
  const dispatch = useAppDispatch();
  const teams = useAppSelector(selectAllTeams);
  const drivers = useAppSelector(selectAllDrivers);

  useEffect(() => {
    dispatch(fetchTeams());
    dispatch(fetchDrivers());
  }, [dispatch]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-4">Teams ({teams.length})</h2>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {teams.map((team) => {
            const teamDrivers = drivers.filter(
              (driver) => driver.teamId === team.teamId
            );

            if (teamDrivers.length === 0) return null;

            return (
              <div
                key={team.id}
                className="flex flex-col items-center border p-4 rounded-lg shadow-md"
              >
                <h2 className="text-xl font-semibold mb-2">{team.teamId}</h2>

                <img
                  src={team.teamImgUrl}
                  alt={team.teamImgUrl}
                  className="w-12 h-12 mb-2"
                />
                <img
                  src={team.bolidImgUrl}
                  alt={team.bolidImgUrl}
                  className="w-96 h-auto mb-4"
                />

                <h3 className="text-lg font-medium mb-2">Drivers:</h3>
                <div className="grid grid-cols-2 gap-4">
                  {teamDrivers.map((driver) => (
                    <div key={driver.id} className="flex flex-col items-center">
                      <h4 className="font-semibold">{driver.driverId}</h4>
                      <img
                        src={driver.imgUrl}
                        alt={driver.driverId}
                        className="w-24 h-auto rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
