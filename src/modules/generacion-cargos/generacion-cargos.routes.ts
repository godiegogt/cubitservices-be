import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  generarCargosHandler,
  getEjecucionHandler,
  listCargosGeneradosHandler,
  listDetallesHandler,
  listEjecucionesHandler,
  previewHandler,
} from "./generacion-cargos.controller";

const router = Router();

router.use(requireAuth);

router.get("/preview", previewHandler);
router.get("/", listEjecucionesHandler);
router.get("/:id", getEjecucionHandler);
router.get("/:id/detalles", listDetallesHandler);
router.get("/:id/cargos", listCargosGeneradosHandler);
router.post("/", generarCargosHandler);

export default router;
