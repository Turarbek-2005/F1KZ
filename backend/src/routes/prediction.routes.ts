import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  clearMyPredictions,
  getLeaderboard,
  getMyPredictions,
  savePrediction,
} from "../controllers/prediction.controller";

const router = Router();

router.get("/leaderboard", getLeaderboard);
router.get("/me", authMiddleware, getMyPredictions);
router.put("/me", authMiddleware, savePrediction);
router.delete("/me", authMiddleware, clearMyPredictions);

export default router;
