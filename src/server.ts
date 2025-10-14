import helmet from "helmet";
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import compression from "compression";

dotenv.config();

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 4200;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});