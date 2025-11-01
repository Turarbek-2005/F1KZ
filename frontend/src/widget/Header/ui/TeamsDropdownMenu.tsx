"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { fetchTeams, selectAllTeams } from "@/entities/f1/model/teamsSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useGetTeamsQuery } from "@/entities/f1api/f1api";

export default function Home() {
  const { data: teamsApi = [], isLoading, error } = useGetTeamsQuery(undefined, {
    refetchOnMountOrArgChange: false, // не перезапрашивать при монтировании
  });

  const dispatch = useAppDispatch();
  const teams = useAppSelector(selectAllTeams);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTeams());
    
  }, [dispatch]);

  useEffect(() => {
    console.log("Teams from API:", teamsApi);
    
  }, [teamsApi]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild onMouseEnter={() => setOpen(true)}>
        <Link href="/teams" className="cursor-pointer">
          Teams
        </Link>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="grid grid-cols-4 mt-3 gap-4 py-4 px-6"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            asChild
            className="hover:scale-110 transition-transform"
          >
            <Link href={`/teams/${team.teamId}`} className="flex flex-col ">
              <div className="flex items-center gap-2">
                <Image
                  src={team.teamImgUrl}
                  alt={team.teamId}
                  width={40}
                  height={40}
                  className="w-full h-auto object-cover"
                />
                {team.teamId}
              </div>
              <Image
                src={team.bolidImgUrl}
                alt={team.teamId}
                width={250}
                height={100}
                className="w-full h-auto object-cover"
              />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
