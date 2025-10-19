import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { RegisterDto } from "../dto/auth.dto";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export class AuthService {
  async register(data: RegisterDto) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) throw { status: 409, message: "Email already in use" };

    const existingUsername = await prisma.user.findUnique({ where: { username: data.username } });
    if (existingUsername) throw { status: 409, message: "Username already in use" };

    const hash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hash,
      },
      select: { id: true, email: true, username: true, createdAt: true, updatedAt: true },
    });

    return user;
  }

  async login(usernameOrEmail: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!user) throw { status: 401, message: "Invalid credentials" };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw { status: 401, message: "Invalid credentials" };

    const payload = { userId: user.id, username: user.username };
    const token = jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

    return { token, user: { id: user.id, username: user.username, email: user.email } };
  }

  verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as { userId: number; username: string; iat?: number; exp?: number };
  }
}
