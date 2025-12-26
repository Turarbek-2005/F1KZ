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
import { useGetYearRoundQualyQuery } from "@/entities/f1api/f1api";

interface DriverResult {
  driverId: string;
  name: string;
  surname: string;
}

interface TeamResult {
  teamId: string;
  teamName: string;
}

interface QualyResult {
  classificationId: string;
  gridPosition: number;
  driver: DriverResult;
  team: TeamResult;
  q1?: string;
  q2?: string;
  q3?: string;
}

interface RaceData {
  qualyResults: QualyResult[];
}

interface QualyApiResponse {
  races?: RaceData;
}

type Props = { year?: string; round?: string | number };

export default function QualyTable({ year, round }: Props) {
  const args = year && round ? { year, round } : skipToken;
  const { data, isLoading } = useGetYearRoundQualyQuery(args) as {
    data?: QualyApiResponse;
    isLoading: boolean;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    );
  }

  if (!data?.races?.qualyResults || data.races.qualyResults.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Qualifying was not held or results are not available.</p>
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
              <TableHead>Q1</TableHead>
              <TableHead>Q2</TableHead>
              <TableHead>Q3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.races.qualyResults.map((result: QualyResult) => (
              <TableRow key={result.classificationId}>
                <TableCell className="font-bold">
                  {result.gridPosition}
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
                <TableCell>{result.q1 ?? "-"}</TableCell>
                <TableCell>{result.q2 ?? "-"}</TableCell>
                <TableCell>{result.q3 ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
