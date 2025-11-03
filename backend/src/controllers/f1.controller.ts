import { Request, Response } from "express";
import { prisma } from "../prisma";

export async function getDrivers(req: Request, res: Response) {
  try {
    const drivers = await prisma.driver.findMany();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching drivers" });
  }
}

export async function getTeams(req: Request, res: Response) {
  try {
    const teams = await prisma.team.findMany();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams" });
  }
}

export async function createDriver(req: Request, res: Response) {
  const { driverId, teamId, imgUrl, nationality, nationalityImgUrl } = req.body;
  try {
    const newDriver = await prisma.driver.create({
      data: { driverId, teamId, imgUrl, nationality, nationalityImgUrl },
    });
    res.status(201).json(newDriver);
  } catch (error) {
    res.status(500).json({ message: "Error creating driver" });
  }
}

export async function createTeam(req: Request, res: Response) {
  const { teamId, teamImgUrl, bolidImgUrl } = req.body;
  try {
    const newTeam = await prisma.team.create({
      data: { teamId, teamImgUrl, bolidImgUrl },
    });
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ message: "Error creating team" });
  }
}

export async function getDriverById(req: Request, res: Response) {
  const { driverId } = req.params;
  try {
    const driver = await prisma.driver.findUnique({ where: { driverId } });
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: "Error fetching driver" });
  }
}

export async function getTeamById(req: Request, res: Response) {
  const { teamId } = req.params;
  try {
    const team = await prisma.team.findUnique({ where: { teamId } });
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Error fetching team" });
  }
}
