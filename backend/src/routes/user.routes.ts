import { Router } from "express";
import { getMe, updateUser } from "../controllers/user.controller";

const router = Router();

router.get("/me", getMe);
router.patch("/me", updateUser);

export default router;
