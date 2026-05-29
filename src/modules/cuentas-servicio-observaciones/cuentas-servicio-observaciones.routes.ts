import { Router } from "express";
import {
    createObservacionHandler,
    deleteObservacionHandler,
    getObservacionHandler,
    listObservacionesHandler,
    updateObservacionHandler,
} from "./cuentas-servicio-observaciones.controller";

const router = Router({ mergeParams: true });

router.get("/", listObservacionesHandler);
router.get("/:observacionId", getObservacionHandler);
router.post("/", createObservacionHandler);
router.patch("/:observacionId", updateObservacionHandler);
router.delete("/:observacionId", deleteObservacionHandler);

export default router;