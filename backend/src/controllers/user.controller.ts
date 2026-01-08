import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@/prisma";
import { logger } from "../utils/log";

export async function getMe(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        favoriteDriversIds: true,
        favoriteTeamsIds: true,
        createdAt: true,
        updatedAt: true,
      },
    });

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
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { email, username, favoriteDriversIds, favoriteTeamsIds, password } = req.body;

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail && existingEmail.id !== userId) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    if (username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername && existingUsername.id !== userId) {
        return res.status(409).json({ message: "Username already in use" });
      }
    }

    const data: any = {};
    if (email !== undefined) data.email = email;
    if (username !== undefined) data.username = username;
    if (favoriteDriversIds !== undefined) data.favoriteDriversIds = favoriteDriversIds;
    if (favoriteTeamsIds !== undefined) data.favoriteTeamsIds = favoriteTeamsIds;
    if (password !== undefined) {
      const hash = await bcrypt.hash(password, 10);
      data.password = hash;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        favoriteDriversIds: true,
        favoriteTeamsIds: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    logger.error("updateUser error:", error);
    return res.status(500).json({ message: "Failed to update user" });
  }
}
