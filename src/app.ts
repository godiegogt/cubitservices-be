import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import prisma from "./config/prisma";
import authRoutes from "./modules/auth/auth.routes";
import rolesRoutes from "./modules/roles/roles.routes";
import usuariosRoutes from "./modules/usuarios/usuarios.routes";
import tiposServicioRoutes from "./modules/tipos-servicio/tipos-servicio.routes";
import metodosPagoRoutes from "./modules/metodos-pago/metodos-pago.routes";
import clientesRoutes from "./modules/clientes/clientes.routes";
import politicasCobroRoutes from "./modules/politicas-cobro/politicas-cobro.routes";
import ubicacionesRoutes from "./modules/ubicaciones/ubicacion.routes";
import cuentasServicioRoutes from "./modules/cuentas-servicio/cuentas-servicio.routes";

const app = express();
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);
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
app.use("/clientes", clientesRoutes);
app.use("/politicas-cobro", politicasCobroRoutes);
app.use("/cuentas-servicio", cuentasServicioRoutes);

export default app;
