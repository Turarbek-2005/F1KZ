import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { withRetry } from "../utils/retry";
import { logger } from "../utils/log";
import type { AuthRequest } from "../types/auth";

export async function getMe(req: Request, res: Response) {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await withRetry(
      () =>
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
            favoriteDriversIds: true,
            favoriteTeamsIds: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      { maxAttempts: 2, delayMs: 50 }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    logger.error("getMe error:", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { email, username, favoriteDriversIds, favoriteTeamsIds, password, avatarUrl } = req.body;

    // Avatar is a small compressed data URL (or null to remove it). Guard the
    // size so an oversized payload can't bloat the row / response.
    if (avatarUrl !== undefined && avatarUrl !== null) {
      if (typeof avatarUrl !== "string") {
        return res.status(400).json({ message: "avatarUrl must be a string or null" });
      }
      const isValid =
        avatarUrl.startsWith("data:image/") || /^https?:\/\//.test(avatarUrl);
      if (!isValid) {
        return res.status(400).json({ message: "avatarUrl must be an image data URL or http(s) URL" });
      }
      if (avatarUrl.length > 1_500_000) {
        return res.status(413).json({ message: "Avatar image is too large" });
      }
    }

    if (email) {
      const existingEmail = await withRetry(
        () => prisma.user.findUnique({ where: { email } }),
        { maxAttempts: 2, delayMs: 50 }
      );
      if (existingEmail && existingEmail.id !== userId) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    if (username) {
      const existingUsername = await withRetry(
        () => prisma.user.findUnique({ where: { username } }),
        { maxAttempts: 2, delayMs: 50 }
      );
      if (existingUsername && existingUsername.id !== userId) {
        return res.status(409).json({ message: "Username already in use" });
      }
    }

    const data: any = {};
    if (email !== undefined) data.email = email;
    if (username !== undefined) data.username = username;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (favoriteDriversIds !== undefined) data.favoriteDriversIds = favoriteDriversIds;
    if (favoriteTeamsIds !== undefined) data.favoriteTeamsIds = favoriteTeamsIds;
    if (password !== undefined) {
      const hash = await bcrypt.hash(password, 10);
      data.password = hash;
    }

    const updated = await withRetry(
      () =>
        prisma.user.update({
          where: { id: userId },
          data,
          select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
            favoriteDriversIds: true,
            favoriteTeamsIds: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      { maxAttempts: 3, delayMs: 100 }
    );

    return res.status(200).json(updated);
  } catch (error) {
    logger.error("updateUser error:", error);
    return res.status(500).json({ message: "Failed to update user" });
  }
}
