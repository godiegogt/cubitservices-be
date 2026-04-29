import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  createOrdenHandler,
  getOrdenHandler,
  listOrdenes,
  listOrdenEstados,
  updateOrdenHandler,
  updateOrdenStatusHandler,
} from "./ordenes.controller";
import ordenServicioArchivosRouter from "../ordenes-archivos/orden-archivo.routes"

const router = Router();

router.use(requireAuth);

router.get("/", listOrdenes);
router.get("/:id", getOrdenHandler);
router.get("/:id/estados", listOrdenEstados);
router.post("/", createOrdenHandler);
router.patch("/:id", updateOrdenHandler);
router.patch("/:id/estado", updateOrdenStatusHandler);
router.use("/:ordenServicioId/archivos", ordenServicioArchivosRouter)

export default router;
