import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
  createAsignacionHandler,
  listAsignaciones,
  updateAsignacionEstadoHandler,
} from "./orden-asignacion";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", listAsignaciones);
router.post("/", createAsignacionHandler);
router.patch("/:id/estado", updateAsignacionEstadoHandler);

export default router;
