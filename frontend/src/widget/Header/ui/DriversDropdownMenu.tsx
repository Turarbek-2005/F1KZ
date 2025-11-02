"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import {
  fetchDrivers,
  selectAllDrivers,
} from "@/entities/f1/model/driversSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useGetDriversQuery } from "@/entities/f1api/f1api";

export default function DriversDropdownMenu() {
  const {
    data: driversApi = [],
    isLoading,
    error,
  } = useGetDriversQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);
  const sortedDrivers = [...drivers].sort((a, b) => a.id - b.id);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  useEffect(() => {
    console.log("Drivers from API:", driversApi);
  }, [driversApi]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild onMouseEnter={() => setOpen(true)}>
        <Link href="/drivers" className="cursor-pointer">
          Drivers
        </Link>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="grid grid-cols-4 p-3 mt-3 gap-x-5"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {sortedDrivers.map((driver) => {
          const matchedDriver = driversApi?.drivers?.find(
            (driverApi: any) => driverApi.driverId === driver.driverId
          );
          return (
            <DropdownMenuItem
              key={driver.id}
              asChild
              className="hover:scale-105 transition-transform"
            >
              <Link
                href={`/drivers/${driver.driverId}`}
                className="flex  items-center gap-2 "
              >
                <div
                  className="w-12 h-12 overflow-hidden rounded-full  "
                  style={{
                    background: `var(--team-${driver?.teamId
                      ?.toLowerCase()
                      .replace(" ", "_")})`,
                  }}
                >
                  <Image
                    src={driver.imgUrl}
                    alt={driver.driverId}
                    width={48}
                    height={48}
                    className="object-cover object-top w-full h-full"
                  />
                </div>
                <span className="text-sm">
                  {matchedDriver
                    ? matchedDriver.name + " " + matchedDriver.surname
                    : driver.teamId}
                </span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
