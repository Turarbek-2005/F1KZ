import { logger } from "../utils/log";
import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface AuthPayload extends JwtPayload {
  userId: number;
  username: string;
}

function getTokenFromRequest(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const tokenCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("token="));

  if (!tokenCookie) return null;
  return decodeURIComponent(tokenCookie.split("=").slice(1).join("="));
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: "No auth token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = { id: payload.userId, username: payload.username };
    next();
  } catch (error) {
    logger.error("Token verification failed:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}
