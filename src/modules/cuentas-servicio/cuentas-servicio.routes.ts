import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  createCuentaServicioHandler,
  getCuentaServicioHandler,
  listCuentasServicio,
  listCuentasServicioSelectHandler,
  updateCuentaServicioHandler,
  updateCuentaServicioStatusHandler,
} from "./cuentas-servicio.controller";
import cuentasArchivoRouter from "../cuentas-servicio-archivo/cuentas-servicio-archivo.routes";
import observacionesRouter from "../cuentas-servicio-observaciones/cuentas-servicio-observaciones.routes";

const router = Router();

router.use(requireAuth);

router.get("/", listCuentasServicio);
router.get("/select", listCuentasServicioSelectHandler);
router.get("/:id", getCuentaServicioHandler);
router.post("/", createCuentaServicioHandler);
router.patch("/:id", updateCuentaServicioHandler);
router.patch("/:id/estado", updateCuentaServicioStatusHandler);
router.use("/:cuentaServicioId/cuentas-servicio-archivo", cuentasArchivoRouter);
router.use("/:cuentaServicioId/observaciones", observacionesRouter);

export default router;
