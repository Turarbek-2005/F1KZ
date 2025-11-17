import { Router, Request, Response } from "express";
import axios from "axios";
import { logger } from "../utils/log";

const router = Router();
const API_BASE = "https://f1api.dev/api/";

const axiosClient = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

async function fetchFromF1Api(path: string, res: Response, cacheName?: string) {
  logger.info(`[F1 API] Fetching data from path: ${path}`);

  let cleanPath = (path ?? "").replace(/^\/+/, "");

  if (/search/i.test(cleanPath)) {
    cleanPath = cleanPath.replace(/^current\//i, "");
  }

  const base = axiosClient.defaults.baseURL ?? API_BASE;
  const fullUrlForLog = `${base}${cleanPath}`;
  logger.info(`[F1 API] request -> ${fullUrlForLog}`);

  try {
    const { data } = await axiosClient.get(cleanPath);
    return res.json(data);
  } catch (error: any) {
    logger.error(` [F1 API] ${cleanPath} — ${error.message}`);
    return res
      .status(502)
      .json({ message: "Error fetching data from external F1 API" });
  }
}



//////////////////////////* Drivers *////////////////////////////

router.get("/drivers", (req: Request, res: Response) =>
  fetchFromF1Api("current/drivers", res, "current/drivers")
);
router.get("/drivers/:driverId", (req: Request, res: Response) =>{
  const { driverId } = req.params;
  return fetchFromF1Api(`current/drivers/${driverId}`, res, `current/drivers/${driverId}`);
});

router.get("/drivers/search", async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query)
    return res.status(400).json({ message: "Missing search query (?q=...)" });

  return fetchFromF1Api(`drivers/search?q=${query}`, res);
});

//////////////////////////* Teams *////////////////////////////

router.get("/teams", (req: Request, res: Response) =>
  fetchFromF1Api("current/teams", res, "current/teams")
);

router.get("/teams/:teamId", (req: Request, res: Response) => {
  const { teamId } = req.params;
  return fetchFromF1Api(`current/teams/${teamId}`, res, `current/teams/${teamId}`);
});

router.get("/teams/:teamId/drivers", (req: Request, res: Response) => {
  const { teamId } = req.params;
  return fetchFromF1Api(`current/teams/${teamId}/drivers`, res, `current/teams/${teamId}/drivers`);
});

router.get("/teams/search", async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query)
    return res.status(400).json({ message: "Missing search query (?q=...)" });

  return fetchFromF1Api(`teams/search?q=${query}`, res);
});


//////////////////////////* Results *////////////////////////////

router.get("/last/fp1", (req: Request, res: Response) =>
  fetchFromF1Api("current/last/fp1", res, "/current/last/fp1")
);
router.get("/last/fp2", (req: Request, res: Response) =>
  fetchFromF1Api("current/last/fp2", res, "/current/last/fp2")
);
router.get("/last/fp3", (req: Request, res: Response) =>
  fetchFromF1Api("current/last/fp3", res, "/current/last/fp3")
);
router.get("/last/qualy", (req: Request, res: Response) =>
  fetchFromF1Api("current/last/qualy", res, "/current/last/qualy")
);
router.get("/last/race", (req: Request, res: Response) =>
  fetchFromF1Api("current/last/race", res, "/current/last/race")
);
router.get("/last/sprint/qualy", (req: Request, res: Response) =>
  fetchFromF1Api("current/last/sprint/qualy", res, "/current/last/sprint/qualy")
);
router.get("/last/sprint/race", (req: Request, res: Response) =>
  fetchFromF1Api("current/last/sprint/race", res, "/current/last/sprint/race")
);

//////////////////////////* Standings *////////////////////////////

router.get("/standings/teams", (req: Request, res: Response) =>
  fetchFromF1Api("current/constructors-championship", res, "teams-standings")
);
router.get("/standings/drivers", (req: Request, res: Response) =>
  fetchFromF1Api("current/drivers-championship", res, "teams-standings")
);

//////////////////////////* Races *////////////////////////////

router.get("/races", (req: Request, res: Response) =>
  fetchFromF1Api("current", res, "current")
);
router.get("/races/last", (req: Request, res: Response) =>
  fetchFromF1Api("current/last", res, "current/last")
);
router.get("/races/next", (req: Request, res: Response) =>
  fetchFromF1Api("current/next", res, "current/next")
);

router.get("/races/:year/:round", (req: Request, res: Response) => {
  const { year, round } = req.params;
  return fetchFromF1Api(`${year}/${round}`, res, `${year}/${round}`);
});

router.get("/races/:year", (req: Request, res: Response) => {
  const { year} = req.params;
  return fetchFromF1Api(`${year}`, res, `${year}`);
});

export default router;
