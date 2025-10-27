import { Router, Request, Response } from "express";
import axios from "axios";
import { logger } from "../utils/log";

const router = Router();
const API_BASE = "https://f1api.dev/api/";

const axiosClient = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

async function fetchFromF1Api(
  path: string,
  res: Response,
  cacheName?: string
) {
  try {
    const { data } = await axiosClient.get(path);

    return res.json(data);
  } catch (error: any) {
    logger.error(` [F1 API] ${path} — ${error.message}`);
    return res
      .status(502)
      .json({ message: "Error fetching data from external F1 API" });
  }
}

router.get("/current/drivers", (req: Request, res: Response) =>
  fetchFromF1Api("current/drivers", res, "current/drivers")
);

router.get("/current/teams", (req: Request, res: Response) =>
  fetchFromF1Api("current/teams", res, "current/teams")
);

router.get("/standings/teams", (req: Request, res: Response) =>
  fetchFromF1Api("current/constructors-championship", res, "teams-standings")
);

export default router;
