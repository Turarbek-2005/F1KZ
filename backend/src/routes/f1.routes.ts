import { Router } from "express";
import { getDrivers, getDriverById, createDriver, getTeams, getTeamById, createTeam } from "../controllers/f1.controller";

const router = Router();

router.get("/drivers", getDrivers);
router.get("/drivers/:driverId", getDriverById);
router.post("/drivers", createDriver);

router.get("/teams", getTeams);
router.get("/teams/:teamId", getTeamById);
router.post("/teams", createTeam);

export default router;
