import Link from "next/link";
import { Loader2 } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Card, CardContent } from "@/shared/ui/card";
import { useGetYearRoundSprintRaceQuery } from "@/entities/f1api/f1api";

interface DriverResult {
  driverId: string;
  name: string;
  surname: string;
}

interface TeamResult {
  teamId: string;
  teamName: string;
}

interface SprintRaceResult {
  sprintRaceId: string;
  driver: DriverResult;
  team: TeamResult;
  position: number;
  points: number;
}

interface SprintRaceData {
  sprintRaceResults: SprintRaceResult[];
}

interface SprintRaceApiResponse {
  races?: SprintRaceData;
}

type Props = { year?: string; round?: string | number };

export default function SprintRaceTable({ year, round }: Props) {
  const args = year && round ? { year, round } : skipToken;
  const { data, isLoading } = useGetYearRoundSprintRaceQuery(args) as {
    data?: SprintRaceApiResponse;
    isLoading: boolean;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    );
  }

  if (
    !data?.races?.sprintRaceResults ||
    data.races.sprintRaceResults.length === 0
  ) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Sprint Race was not held or results are not available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Pos</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.races.sprintRaceResults.map((result: SprintRaceResult) => (
              <TableRow key={result.sprintRaceId}>
                <TableCell className="font-bold">{result.position}</TableCell>
                <TableCell>
                  <Link
                    href={`/drivers/${result.driver.driverId}`}
                    className="hover:underline"
                  >
                    {result.driver.name} {result.driver.surname}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/teams/${result.team.teamId}`}
                    className="hover:underline"
                  >
                    {result.team.teamName}
                  </Link>
                </TableCell>
                <TableCell className="font-bold">{result.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
