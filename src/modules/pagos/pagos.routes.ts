import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  applyPagoHandler,
  createPagoHandler,
  getPagoHandler,
  listPagos,
  updatePagoStatusHandler,
} from "./pagos.controller";
import { dashboardPagoController } from "./dashboard/pagos-dashboard.controller";
const router = Router();

router.use(requireAuth);

router.get("/", listPagos);
router.get("/dashboard", dashboardPagoController);
router.get("/:id", getPagoHandler);
router.post("/", createPagoHandler);
router.patch("/:id/estado", updatePagoStatusHandler);
router.post("/:id/aplicaciones", applyPagoHandler);

export default router;
