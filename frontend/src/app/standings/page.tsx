"use client";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import DriversStandings from "@/entities/f1/ui/DriversStandings";
import TeamsStandings from "@/entities/f1/ui/TeamsStandings";
import {
  useGetStandingsDriversQuery,
  useGetStandingsTeamsQuery,
} from "@/entities/f1api/f1api";
import type {
  DriversStandingsResponse,
  TeamsStandingsResponse,
} from "@/entities/f1api/f1api.interfaces";
import {
  DriverStandingsChart,
  TeamStandingsChart,
} from "@/features/charts/ui/StandingsChart";

export default function Standings() {
  const { data: driversData } = useGetStandingsDriversQuery() as {
    data?: DriversStandingsResponse;
  };
  const { data: teamsData } = useGetStandingsTeamsQuery() as {
    data?: TeamsStandingsResponse;
  };

  return (
    <div className="container px-4 sm:px-0 mx-auto pb-6">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl mt-3 mb-5"
      >
        Standings
      </motion.h2>
      <Tabs defaultValue="drivers">
        <TabsList>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          <DriversStandings />
        </TabsContent>

        <TabsContent value="teams">
          <TeamsStandings />
        </TabsContent>

        <TabsContent value="chart">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-10 mt-4"
          >
            <div>
              <h3 className="font-semibold mb-4 uppercase tracking-wide text-sm">
                Drivers Championship
              </h3>
              {driversData?.drivers_championship ? (
                <DriverStandingsChart
                  standings={driversData.drivers_championship}
                />
              ) : (
                <p className="text-muted-foreground text-sm">Loading...</p>
              )}
            </div>

            <div>
              <h3 className=" font-semibold mb-4 uppercase tracking-wide text-sm">
                Constructors Championship
              </h3>
              {teamsData?.constructors_championship ? (
                <TeamStandingsChart
                  standings={teamsData.constructors_championship}
                />
              ) : (
                <p className="text-muted-foreground text-sm">Loading...</p>
              )}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
