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
import { useGetYearRoundFp1Query } from "@/entities/f1api/f1api";

type Driver = {
  driverId: string;
  name: string;
  surname: string;
};

type Team = {
  teamId: string;
  teamName: string;
};

type Fp1Result = {
  fp1Id: string;
  time: string | null;
  driver: Driver;
  team: Team;
};

type Fp1Response = {
  races?: {
    fp1Results?: Fp1Result[];
  };
};

type Props = {
  year?: string;
  round?: string | number;
};


export default function Fp1Table({ year, round }: Props) {
  const args = year && round ? { year, round } : skipToken;

  const { data, isLoading } = useGetYearRoundFp1Query(
    args
  ) as {
    data?: Fp1Response;
    isLoading: boolean;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    );
  }

  const results = data?.races?.fp1Results ?? [];

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Practice 1 was not held or results are not available.</p>
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
            {results
              .filter((result) => Boolean(result.time))
              .map((result, index) => (
                <TableRow key={result.fp1Id}>
                  <TableCell className="font-bold">
                    {index + 1}
                  </TableCell>

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

                  <TableCell>{result.time}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
