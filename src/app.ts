import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import prisma from "./config/prisma";
import authRoutes from "./modules/auth/auth.routes";
import rolesRoutes from "./modules/roles/roles.routes";
import usuariosRoutes from "./modules/usuarios/usuarios.routes";
import tiposServicioRoutes from "./modules/tipos-servicio/tipos-servicio.routes";
import metodosPagoRoutes from "./modules/metodos-pago/metodos-pago.routes";
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

app.use("/auth", authRoutes);
app.use("/roles", rolesRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/tipos-servicio", tiposServicioRoutes);
app.use("/metodos-pago", metodosPagoRoutes);

export default app;