"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const orden_archivo_1 = require("./orden-archivo");
const multer_1 = __importDefault(require("multer"));
const orden_archivo_repository_1 = require("./orden-archivo.repository");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)({ mergeParams: true });
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.use(auth_middleware_1.requireAuth);
router.get("/", orden_archivo_1.listArchivos);
router.post("/", upload.single("archivo"), orden_archivo_1.createArchivoHandler);
router.patch("/:id/estado", orden_archivo_1.updateArchivoEstadoHandler);
router.get("/:id/file", auth_middleware_1.requireAuth, async (req, res) => {
    const archivo = await (0, orden_archivo_repository_1.findArchivoById)(req.params.id);
    if (!archivo)
        return res.status(404).json({ message: "No encontrado" });
    const filePath = path_1.default.join(process.cwd(), "uploads", archivo.storageKey);
    if (!fs_1.default.existsSync(filePath))
        return res.status(404).json({ message: "Archivo no encontrado en disco" });
    res.setHeader("Content-Type", archivo.mimeType);
    res.sendFile(filePath);
});
exports.default = router;
