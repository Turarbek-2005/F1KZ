import { Request, Response } from "express";
import { prisma } from "@/prisma";
import { logger } from "@/utils/log";

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
