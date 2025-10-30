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
      <div className="container  mx-auto">
        <h2>Teams ({teams.length})</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {teams.map((team) => (
            <div key={team.id} className="flex flex-col items-center">
              <h2 className="text-xl font-semibold">{team.teamId}</h2>
              <img
                src={team.teamImgUrl}
                alt={team.teamImgUrl}
                className="w-10 h-10 "
              />
              <img
                src={team.bolidImgUrl}
                alt={team.bolidImgUrl}
                className="w-96 h-auto "
              />
            </div>
          ))}
        </div>

        <h2>Drivers ({drivers.length})</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {drivers.map((driver) => (
            <div key={driver.id} className="flex flex-col items-center">
              <h2 className="text-xl font-semibold">{driver.driverId}</h2>
              <h2 className="text-xl font-semibold">{driver.teamId}</h2>
              <img
                src={driver.imgUrl}
                alt={driver.imgUrl}
                className="w-96 h-auto "
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
