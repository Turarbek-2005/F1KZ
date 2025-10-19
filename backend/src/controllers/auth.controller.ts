import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { registerDto, loginDto } from "../dto/auth.dto";
import { logger } from "../utils/log";

const authService = new AuthService();

export async function register(req: Request, res: Response) {
  const parsed = registerDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues.map(i => i.message).join(", ") });

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
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues.map(i => i.message).join(", ") });

  try {
    const { usernameOrEmail, password } = parsed.data;
    const result = await authService.login(usernameOrEmail, password);
    return res.json(result);
  } catch (err: any) {
    logger.error("Login error:", err);
    return res.status(err.status ?? 500).json({ message: err.message ?? "Login failed" });
  }
}
