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

export default function Home() {
  const dispatch = useAppDispatch();
  const drivers = useAppSelector(selectAllDrivers);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        onMouseEnter={() => setOpen(true)}
      >
        <Link href="/drivers" className="cursor-pointer">
          Drivers
        </Link>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="grid grid-cols-5 p-3 mt-3"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {drivers.map((driver) => (
          <DropdownMenuItem key={driver.id} asChild className="hover:scale-110 transition-transform">
            <Link
              href={`/drivers/${driver.driverId}`}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-24 h-24 overflow-hidden rounded-full border ">
                <Image
                  src={driver.imgUrl}
                  alt={driver.driverId}
                  width={100}
                  height={100}
                  className="object-cover object-top w-full h-full"
                />
              </div>
              <span className="text-xs">{driver.driverId}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
