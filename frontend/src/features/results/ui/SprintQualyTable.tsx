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
import {
    Card,
  CardContent,
} from "@/shared/ui/card";
import { useGetYearRoundSprintQualyQuery } from "@/entities/f1api/f1api";

type Props = { year?: string; round?: string | number; };

export default function SprintQualyTable({ year, round }: Props) {
   const args = year && round ? { year, round } : skipToken;
    const { data, isLoading } = useGetYearRoundSprintQualyQuery(args!);

    if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16" />
      </div>
    );
  }

  if (!data || !data.races?.sprintQualyResults || data.races.sprintQualyResults.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Sprint Qualifying was not held or results are not available.</p>
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
                <TableHead>SQ1</TableHead>
                <TableHead>SQ2</TableHead>
                <TableHead>SQ3</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.races?.sprintQualyResults.map((result:any) => (
                <TableRow key={result.sprintQualyId}>
                  <TableCell className="font-bold">{result.gridPosition}</TableCell>
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
                  <TableCell>{result.sq1}</TableCell>
                  <TableCell>{result.sq2}</TableCell>
                  <TableCell>{result.sq3}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  );
}
