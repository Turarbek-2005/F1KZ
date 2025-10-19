import helmet from "helmet";
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import compression from "compression";
import { authMiddleware } from "./middlewares/auth.middleware";
import f1Router from "./routes/f1.routes";
import authRouter from "./routes/auth.routes";
import { logger } from "./utils/log";
import { prisma } from "./prisma";


dotenv.config();

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());

app.use("/api/f1",authMiddleware, f1Router);
app.use("/api/auth", authRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 4200;


const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  logger.info("Shutting down...");
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});