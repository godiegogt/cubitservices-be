import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import prisma from "./config/prisma";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API running" });
});



app.get("/test-db", async (req, res) => {
  const result = await prisma.$queryRaw`SELECT NOW()`;
  res.json(result);
});

export default app;