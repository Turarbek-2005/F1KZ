import { Request, Response } from "express";
import { prisma } from "../prisma";
import { withRetry } from "../utils/retry";
import { logger } from "../utils/log";
import type { AuthRequest } from "../types/auth";
import {
  getNextRace,
  settleFinishedPredictions,
} from "../services/prediction.service";
import type { Prediction } from "@prisma/client";

// Shape the frontend consumes: `actual` grouped, nulls dropped.
export function toPredictionDto(p: Prediction) {
  return {
    raceId: p.raceId,
    round: p.round,
    raceName: p.raceName,
    p1: p.p1,
    p2: p.p2,
    p3: p.p3,
    score: p.score ?? undefined,
    actual:
      p.actualP1 && p.actualP2 && p.actualP3
        ? { p1: p.actualP1, p2: p.actualP2, p3: p.actualP3 }
        : undefined,
  };
}

export async function getMyPredictions(req: Request, res: Response) {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await settleFinishedPredictions();

    const predictions = await withRetry(
      () =>
        prisma.prediction.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        }),
      { maxAttempts: 2, delayMs: 50 }
    );

    return res.status(200).json(predictions.map(toPredictionDto));
  } catch (error) {
    logger.error("getMyPredictions error:", error);
    return res.status(500).json({ message: "Failed to fetch predictions" });
  }
}

export async function savePrediction(req: Request, res: Response) {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { p1, p2, p3 } = req.body ?? {};
    const picks = [p1, p2, p3];
    if (picks.some((p) => typeof p !== "string" || !p || p.length > 100)) {
      return res
        .status(400)
        .json({ message: "p1, p2 and p3 must be driver ids" });
    }
    if (new Set(picks).size !== 3) {
      return res.status(400).json({ message: "Podium picks must be distinct" });
    }

    // The race being predicted is always the server's idea of the next race —
    // the client can't submit for a race whose result is already known.
    const nextRace = await getNextRace();
    if (!nextRace) {
      return res
        .status(503)
        .json({ message: "Race schedule unavailable, try again later" });
    }
    if (nextRace.startsAt !== null && Date.now() >= nextRace.startsAt) {
      return res
        .status(409)
        .json({ message: "Predictions are closed for this race" });
    }

    const saved = await withRetry(
      () =>
        prisma.prediction.upsert({
          where: {
            userId_raceId: { userId, raceId: nextRace.raceId },
          },
          create: {
            userId,
            raceId: nextRace.raceId,
            round: nextRace.round,
            raceName: nextRace.raceName,
            p1,
            p2,
            p3,
          },
          update: { p1, p2, p3 },
        }),
      { maxAttempts: 3, delayMs: 100 }
    );

    return res.status(200).json(toPredictionDto(saved));
  } catch (error) {
    logger.error("savePrediction error:", error);
    return res.status(500).json({ message: "Failed to save prediction" });
  }
}

export async function clearMyPredictions(req: Request, res: Response) {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await withRetry(
      () => prisma.prediction.deleteMany({ where: { userId } }),
      { maxAttempts: 2, delayMs: 50 }
    );

    return res.status(200).json({ message: "Predictions cleared" });
  } catch (error) {
    logger.error("clearMyPredictions error:", error);
    return res.status(500).json({ message: "Failed to clear predictions" });
  }
}

export async function getLeaderboard(req: Request, res: Response) {
  try {
    await settleFinishedPredictions();

    const grouped = await withRetry(
      () =>
        prisma.prediction.groupBy({
          by: ["userId"],
          where: { score: { not: null } },
          _sum: { score: true },
          _count: { _all: true },
          orderBy: { _sum: { score: "desc" } },
          take: 50,
        }),
      { maxAttempts: 2, delayMs: 50 }
    );

    const users = await prisma.user.findMany({
      where: { id: { in: grouped.map((g) => g.userId) } },
      select: { id: true, username: true, avatarUrl: true },
    });
    const byId = new Map(users.map((u) => [u.id, u]));

    const rows = grouped.map((g) => ({
      userId: g.userId,
      username: byId.get(g.userId)?.username ?? "Unknown",
      avatarUrl: byId.get(g.userId)?.avatarUrl ?? null,
      points: g._sum.score ?? 0,
      scored: g._count._all,
    }));

    return res.status(200).json(rows);
  } catch (error) {
    logger.error("getLeaderboard error:", error);
    return res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
}

// Public profile: no email, no auth required. Shows what another user has
// picked as favourites and how their predictions went.
export async function getPublicProfile(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    await settleFinishedPredictions();

    const user = await withRetry(
      () =>
        prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            favoriteDriversIds: true,
            favoriteTeamsIds: true,
            createdAt: true,
            predictions: { orderBy: { createdAt: "desc" } },
          },
        }),
      { maxAttempts: 2, delayMs: 50 }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      favoriteDriversIds: user.favoriteDriversIds,
      favoriteTeamsIds: user.favoriteTeamsIds,
      createdAt: user.createdAt,
      predictions: user.predictions.map(toPredictionDto),
    });
  } catch (error) {
    logger.error("getPublicProfile error:", error);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
}
