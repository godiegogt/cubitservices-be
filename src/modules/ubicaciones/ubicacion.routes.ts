import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
    createUbicacionHandler,
    listUbicaciones,
    updateUbicacionEstadoHandler,
    updateUbicacionHandler,
} from "./ubicaciones.controller";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", listUbicaciones);
router.post("/", createUbicacionHandler);
router.patch("/:id", updateUbicacionHandler);
router.patch("/:id/estado", updateUbicacionEstadoHandler);

export default router;