import { Router } from "express";
import { getPublicProfile } from "../controllers/prediction.controller";

const router = Router();

router.get("/:id", getPublicProfile);

export default router;
