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
import { useGetYearRoundFp2Query } from "@/entities/f1api/f1api";

type DriverResult = {
  driverId: string;
  name: string;
  surname: string;
};

type TeamResult = {
  teamId: string;
  teamName: string;
};

type Fp2Result = {
  fp2Id: string;
  driver: DriverResult;
  team: TeamResult;
  time?: string;
};

type RaceData = {
  fp2Results: Fp2Result[];
};

type Fp2ApiResponse = {
  races?: RaceData;
};

type Props = { year?: string; round?: string | number; };

export default function Fp2Table({ year, round }: Props) {
  const args = year && round ? { year, round } : skipToken;
    const { data, isLoading, isFetching } = useGetYearRoundFp2Query(
      args
    ) as {
      data?: Fp2ApiResponse;
      isLoading: boolean;
      isFetching: boolean;
    };

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    );
  }

  if (!data?.races?.fp2Results || data.races.fp2Results.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Practice 2 was not held or results are not available.</p>
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
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.races.fp2Results
              .filter((result) => result.time)
              .map((result, index) => (
                <TableRow key={result.fp2Id}>
                  <TableCell className="font-bold">{index + 1}</TableCell>
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
                  <TableCell>{result.time || 'No time set'}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
