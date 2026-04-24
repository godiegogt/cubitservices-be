import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import {
    createArchivoHandler,
    listArchivos,
    updateArchivoEstadoHandler,
} from "./cuentas-servicio-archivo.controller";
import multer from "multer"
import { findArchivoById } from "./cuentas-servicio-archivo.repository";
import path from "path";
import fs from "fs";

const router = Router({ mergeParams: true });
const upload = multer({storage: multer.memoryStorage()})

router.use(requireAuth);

router.get("/", listArchivos);
router.post("/", upload.single("archivo"), createArchivoHandler);
router.patch("/:id/estado", updateArchivoEstadoHandler);


router.get("/:id/file", requireAuth, async (req, res) => {
    const archivo = await findArchivoById(req.params.id);
    if (!archivo) return res.status(404).json({ message: "No encontrado" });

    const filePath = path.join(process.cwd(), "uploads", archivo.storageKey);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Archivo no encontrado en disco" });

    res.setHeader("Content-Type", archivo.mimeType);
    res.sendFile(filePath);
});

export default router;