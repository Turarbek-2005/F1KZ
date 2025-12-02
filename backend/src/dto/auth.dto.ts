import { z } from "zod";

export const registerDto = z.object({

  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6).max(100),
  favoriteDriverId: z.string().optional(),
  favoriteTeamId: z.string().optional(),
});

export const loginDto = z.object({
  usernameOrEmail: z.string().min(1),
  password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
