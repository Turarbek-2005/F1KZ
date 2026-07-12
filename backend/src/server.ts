import helmet from "helmet";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import { authMiddleware } from "./middlewares/auth.middleware";
import { rateLimiters } from "./middlewares/rateLimit.middleware";
import { logger } from "./utils/log";
import f1apiRouter from "./routes/f1api.routes";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import f1Router from "./routes/f1.routes";
import predictionRouter from "./routes/prediction.routes";
import publicUserRouter from "./routes/publicUser.routes";
import aiRouter from "./routes/ai.routes";
import liveRouter from "./routes/live.routes";
import { openF1LiveService } from "./services/openf1live.service";
import { prisma } from "./prisma";
import { disconnectQueues } from "./services/queue.service";
import { disconnectRedis } from "./redis";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://f1-kz-frontend.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      try {
        const originUrl = new URL(origin);
        const hostname = originUrl.hostname;
        if (
          allowedOrigins.includes(origin) ||
          hostname.endsWith(".vercel.app")
        ) {
          return callback(null, true);
        }
      } catch (error) {
        logger.error("CORS origin parse failed:", error);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(helmet());
app.use(
  compression({
    // SSE streams must not be gzip-buffered
    filter: (req, res) => {
      if (req.path.startsWith('/api/live')) return false;
      return compression.filter(req, res);
    },
  })
);
// Raised from the 100kb default so base64 avatar data URLs fit comfortably.
app.use(express.json({ limit: "2mb" }));

// Rate limiting по API endpoint'ам
app.use("/api/auth", rateLimiters.auth);
app.use("/api/ai", rateLimiters.ai);
app.use("/api/f1", rateLimiters.api);

app.use("/api/f1api", f1apiRouter);
app.use("/api/f1", f1Router);
app.use("/api/auth", authRouter);
app.use("/api/user", authMiddleware, userRouter);
app.use("/api/predictions", rateLimiters.api, predictionRouter);
app.use("/api/users", rateLimiters.api, publicUserRouter);
app.use("/api/ai", aiRouter);
app.use("/api/live", liveRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send({ message: "Something went wrong!" });
});
app.use((req, res, next) => {
  console.log("Origin:", req.headers.origin);
  next();
});
// При пуше надо закомментировать код ниже, так как он не работает в среде Vercel, которая не позволяет открывать порты. В Vercel функция handler будет обрабатывать входящие запросы.
const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  openF1LiveService.connect();
});

process.on("SIGINT", async () => {
  logger.info("Shutting down...");
  openF1LiveService.disconnect();
  await disconnectQueues();
  await disconnectRedis();
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
// До сюда
export default function handler(req: Request, res: Response) {
  app(req, res);
}
