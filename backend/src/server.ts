import helmet from "helmet";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import { authMiddleware } from "./middlewares/auth.middleware";
import { logger } from "./utils/log";
import f1apiRouter from "./routes/f1api.routes";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import f1Router from "./routes/f1.routes";
import aiRouter from "./routes/ai.routes";
import { prisma } from "./prisma";

dotenv.config();

const app = express();

app.use(
  cors({
    // origin: ["http://localhost:3000", "https://f1-kz-frontend.vercel.app"],
    origin: true,
    credentials: true,
  })
);

app.use(helmet());
app.use(compression());
app.use(express.json());

app.use("/api/f1api",  f1apiRouter);
app.use("/api/f1", f1Router);
app.use("/api/auth", authRouter);
app.use("/api/user", authMiddleware, userRouter);
app.use("/api/ai", aiRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send({ message: "Something went wrong!" });
});
app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin);
  next();
});
// const PORT = process.env.PORT;

// const server = app.listen(PORT, () => {
//   logger.info(`Server is running on port ${PORT}`);
// });

// process.on("SIGINT", async () => {
//   logger.info("Shutting down...");
//   await prisma.$disconnect();
//   server.close(() => process.exit(0));
// });

export default function handler(req: Request, res: Response) {
  app(req, res);
}