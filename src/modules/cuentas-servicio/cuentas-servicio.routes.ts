import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  createCuentaServicioHandler,
  getCuentaServicioHandler,
  listCuentasServicio,
  updateCuentaServicioHandler,
  updateCuentaServicioStatusHandler,
} from "./cuentas-servicio.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listCuentasServicio);
router.get("/:id", getCuentaServicioHandler);
router.post("/", createCuentaServicioHandler);
router.patch("/:id", updateCuentaServicioHandler);
router.patch("/:id/estado", updateCuentaServicioStatusHandler);

export default router;
