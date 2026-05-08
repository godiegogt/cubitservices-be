import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  createCargoFromCuentaHandler,
  createCargoHandler,
  getCargoHandler,
  listCargos,
  updateCargoStatusHandler,
} from "./cargos.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listCargos);
router.get("/:id", getCargoHandler);
router.post("/", createCargoHandler);
router.post("/:id/cargos", createCargoFromCuentaHandler);
router.patch("/:id/estado", updateCargoStatusHandler);

export default router;
