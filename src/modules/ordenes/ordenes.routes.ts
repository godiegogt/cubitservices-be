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

const router = Router();

router.use(requireAuth);

router.get("/", listOrdenes);
router.get("/:id", getOrdenHandler);
router.get("/:id/estados", listOrdenEstados);
router.post("/", createOrdenHandler);
router.patch("/:id", updateOrdenHandler);
router.patch("/:id/estado", updateOrdenStatusHandler);

export default router;
