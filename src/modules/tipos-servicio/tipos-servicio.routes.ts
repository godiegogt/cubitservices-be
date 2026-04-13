import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  createTipoServicioHandler,
  listTiposServicio,
  updateTipoServicioHandler,
  updateTipoServicioStatusHandler,
} from "./tipos-servicio.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listTiposServicio);
router.post("/", createTipoServicioHandler);
router.patch("/:id", updateTipoServicioHandler);
router.patch("/:id/estado", updateTipoServicioStatusHandler);

export default router;