import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  applyPagoHandler,
  createPagoHandler,
  getPagoHandler,
  listPagos,
  updatePagoStatusHandler,
} from "./pagos.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listPagos);
router.get("/:id", getPagoHandler);
router.post("/", createPagoHandler);
router.patch("/:id/estado", updatePagoStatusHandler);
router.post("/:id/aplicaciones", applyPagoHandler);

export default router;
