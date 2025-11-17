"use client";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import DriversStandings from "@/entities/f1/ui/DriversStandings";

export default function Standings() {
  return (
    <div className="container mx-auto pb-6">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl mt-3 mb-5"
      >
        Standings
      </motion.h2>
      <Tabs defaultValue="drivers" >
        <TabsList>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>
        <TabsContent value="drivers">
          <DriversStandings />
        </TabsContent>
        <TabsContent value="teams">Teams Standings</TabsContent>
      </Tabs>
    </div>
  );
}
