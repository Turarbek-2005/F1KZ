import { logger } from "@/utils/log";
import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No Authorization header" });
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ message: "Invalid Authorization format" });

  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = { id: (payload as any).userId, username: (payload as any).username };
    next();
  } catch (error) {
    logger.error("Token verification failed:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}
