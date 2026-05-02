"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { fetchTeams, selectAllTeams } from "@/entities/f1/model/teamsSlice";
import type { RootState } from "@/shared/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useGetTeamsQuery } from "@/entities/f1api/f1api";
import type { ApiTeam as TeamApi, TeamsResponse } from "@/entities/f1api/f1api.interfaces";
import { cn } from "@/shared/lib/utils";

export default function TeamsDropdownMenu() {
  const pathname = usePathname();

  const { data: teamsApiData = { teams: [] }, isLoading: isTeamsApiLoading } = useGetTeamsQuery(
    undefined,
    { refetchOnMountOrArgChange: false }
  ) as { data?: TeamsResponse; isLoading: boolean };

  const dispatch = useAppDispatch();
  const teams = useAppSelector(selectAllTeams);
  const teamsStatus = useAppSelector((state: RootState) => state.teams.status);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (teamsStatus === "idle") {
      dispatch(fetchTeams());
    }
  }, [dispatch, teamsStatus]);

  const isStoreLoading = teamsStatus === "idle" || teamsStatus === "loading";
  const isDataLoading = isStoreLoading || isTeamsApiLoading;

  if (isDataLoading) {
    return (
      <Link
        className={cn(
          "transition hover:text-red-500",
          pathname === "/teams" && "text-red-500"
        )}
        href="/teams"
      >
        Teams
      </Link>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild onMouseEnter={() => setOpen(true)}>
        <Link
          className={cn(
            "transition hover:text-red-500",
            pathname === "/teams" && "text-red-500"
          )}
          href="/teams"
        >
          Teams
        </Link>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="grid grid-cols-4 mt-3 gap-4 py-4 px-6"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {teams.map((team) => {
          const matchedTeam: TeamApi | undefined = teamsApiData?.teams.find(
            (teamApi: TeamApi) => teamApi.teamId === team.teamId
          );

          return (
            <DropdownMenuItem
              key={team.id}
              asChild
              className="hover:scale-105 transition-transform"
              style={{
                background: `var(--team-${matchedTeam?.teamId
                  ?.toLowerCase()
                  .replace(" ", "_")})`,
              }}
            >
              <Link href={`/teams/${team.teamId}`} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div>
                    <Image
                      src={team.teamImgUrl}
                      alt={team.teamId}
                      width={40}
                      height={40}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  {matchedTeam ? matchedTeam.teamName : team.teamId}
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
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
