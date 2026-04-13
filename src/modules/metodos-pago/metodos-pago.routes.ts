import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  createMetodoPagoHandler,
  listMetodosPago,
  updateMetodoPagoHandler,
  updateMetodoPagoStatusHandler,
} from "./metodos-pago.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listMetodosPago);
router.post("/", createMetodoPagoHandler);
router.patch("/:id", updateMetodoPagoHandler);
router.patch("/:id/estado", updateMetodoPagoStatusHandler);

export default router;