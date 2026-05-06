import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { registerDto, loginDto } from "../dto/auth.dto";
import { logger } from "../utils/log";

const authService = new AuthService();

export async function register(req: Request, res: Response) {
  const parsed = registerDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues.map((issue: { message: string }) => issue.message).join(", ") });

  try {
    const user = await authService.register(parsed.data);
    return res.status(201).json(user);
  } catch (err: any) {
    logger.error("Register error:", err);
    return res.status(err.status ?? 500).json({ message: err.message ?? "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues.map((issue: { message: string }) => issue.message).join(", ") });

  try {
    const { usernameOrEmail, password } = parsed.data;
    const result = await authService.login(usernameOrEmail, password);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({ user: result.user });
  } catch (err: any) {
    logger.error("Login error:", err);
    return res.status(err.status ?? 500).json({ message: err.message ?? "Login failed" });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({ message: "Logged out" });
}
