import { Request, Response } from "express";
import { prisma } from "../prisma";
import { withRetry } from "../utils/retry";
import { logger } from "../utils/log";

export async function getDrivers(req: Request, res: Response) {
  try {
    const drivers = await withRetry(() => prisma.driver.findMany(), {
      maxAttempts: 4,
      delayMs: 500,
    });
    res.json(drivers);
  } catch (error) {
    logger.error("getDrivers failed:", error);
    res.status(500).json({ message: "Error fetching drivers" });
  }
}

export async function getTeams(req: Request, res: Response) {
  try {
    const teams = await withRetry(() => prisma.team.findMany(), {
      maxAttempts: 4,
      delayMs: 500,
    });
    res.json(teams);
  } catch (error) {
    logger.error("getTeams failed:", error);
    res.status(500).json({ message: "Error fetching teams" });
  }
}

export async function createDriver(req: Request, res: Response) {
  const { driverId, teamId, imgUrl, nationality, nationalityImgUrl } = req.body;
  try {
    const newDriver = await withRetry(
      () =>
        prisma.driver.create({
          data: { driverId, teamId, imgUrl, nationality, nationalityImgUrl },
        }),
      { maxAttempts: 3, delayMs: 100 }
    );
    res.status(201).json(newDriver);
  } catch (error) {
    res.status(500).json({ message: "Error creating driver" });
  }
}

export async function createTeam(req: Request, res: Response) {
  const { teamId, teamImgUrl, bolidImgUrl } = req.body;
  try {
    const newTeam = await withRetry(
      () =>
        prisma.team.create({
          data: { teamId, teamImgUrl, bolidImgUrl },
        }),
      { maxAttempts: 3, delayMs: 100 }
    );
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ message: "Error creating team" });
  }
}

export async function getDriverById(req: Request, res: Response) {
  const { driverId } = req.params;
  try {
    const driver = await withRetry(
      () => prisma.driver.findUnique({ where: { driverId } }),
      { maxAttempts: 3, delayMs: 100 }
    );
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: "Error fetching driver" });
  }
}

export async function getTeamById(req: Request, res: Response) {
  const { teamId } = req.params;
  try {
    const team = await withRetry(
      () => prisma.team.findUnique({ where: { teamId } }),
      { maxAttempts: 3, delayMs: 100 }
    );
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Error fetching team" });
  }
}
