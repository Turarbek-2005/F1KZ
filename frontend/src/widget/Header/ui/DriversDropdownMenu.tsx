"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { fetchDrivers, selectAllDrivers } from "@/entities/f1/model/driversSlice";
import { Driver } from "@/entities/f1/types/f1.types";
import type { RootState } from "@/shared/store";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useGetDriversQuery } from "@/entities/f1api/f1api";
import type { ApiDriver as DriverApi, DriversResponse } from "@/entities/f1api/f1api.interfaces";
import { cn } from "@/shared/lib/utils";
export default function DriversDropdownMenu() {
  const pathname = usePathname();

  const { data: driversApiData = { drivers: [] }, isLoading: isDriversApiLoading } = useGetDriversQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  ) as { data?: DriversResponse; isLoading: boolean };


  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);
  const driversStatus = useAppSelector((state: RootState) => state.drivers.status);

  const sortedDrivers = [...drivers].sort((a, b) => a.id - b.id);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (driversStatus === "idle") {
      dispatch(fetchDrivers());
    }
  }, [dispatch, driversStatus]);

  const isStoreLoading =
    driversStatus === "idle" || driversStatus === "loading";
  const isDataLoading = isStoreLoading || isDriversApiLoading;

  if (isDataLoading) {
    return (
      <div className="flex items-center gap-2">
        <Link
          className={cn(
            "transition hover:text-red-500",
            pathname === "/drivers" && "text-red-500"
          )}
          href="/drivers"
        >
          Drivers
        </Link>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild onMouseEnter={() => setOpen(true)}>
        <Link
          className={cn(
            "transition hover:text-red-500",
            pathname === "/drivers" && "text-red-500"
          )}
          href="/drivers"
        >
          Drivers
        </Link>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="grid grid-cols-4 p-3 mt-3 gap-x-5"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {sortedDrivers.map((driver: Driver) => {
          const matchedDriver: DriverApi | undefined = driversApiData.drivers.find(
            (driverApi: DriverApi) => driverApi.driverId === driver.driverId
          );

          return (
            <DropdownMenuItem
              key={driver.id}
              asChild
              className="hover:scale-105 transition-transform"
            >
              <Link
                href={`/drivers/${driver.driverId}`}
                className="flex items-center gap-2"
              >
                <div
                  className="w-12 h-12 overflow-hidden rounded-full"
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
                    ? `${matchedDriver.name} ${matchedDriver.surname}`
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
