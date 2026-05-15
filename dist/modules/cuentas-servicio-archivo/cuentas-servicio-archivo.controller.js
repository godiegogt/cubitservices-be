"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listArchivos = listArchivos;
exports.createArchivoHandler = createArchivoHandler;
exports.updateArchivoEstadoHandler = updateArchivoEstadoHandler;
const cuentas_servicio_archivo_schemas_1 = require("./cuentas-servicio-archivo.schemas");
const cuentas_servicio_archivo_service_1 = require("./cuentas-servicio-archivo.service");
const uploadToSpaces_1 = require("../../config/uploadToSpaces");
async function listArchivos(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { cuentaServicioId } = req.params;
        const archivos = await (0, cuentas_servicio_archivo_service_1.getArchivosService)(cuentaServicioId, empresaId);
        return res.json({
            success: true,
            message: "Archivos obtenidos correctamente",
            data: archivos,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error instanceof Error ? error.message : "Error obteniendo archivos",
        });
    }
}
async function createArchivoHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const usuarioId = req.auth.userId;
        const { cuentaServicioId } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: "No se recibió ningún archivo" });
        }
        const { url, storageKey } = await (0, uploadToSpaces_1.uploadToSpaces)(file, "cuentas-servicio", cuentaServicioId);
        const parsed = cuentas_servicio_archivo_schemas_1.createArchivoSchema.parse({
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            mimeType: file.mimetype,
            storageKey,
        });
        const archivo = await (0, cuentas_servicio_archivo_service_1.createArchivoService)(cuentaServicioId, empresaId, usuarioId, {
            ...parsed,
            extension: file.originalname.split(".").pop(),
            tamanoBytes: file.size,
            url,
        });
        return res.status(201).json({
            success: true,
            message: "Archivo creado correctamente",
            data: archivo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error creando archivo",
        });
    }
}
async function updateArchivoEstadoHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { cuentaServicioId, id } = req.params;
        const parsed = cuentas_servicio_archivo_schemas_1.updateArchivoEstadoSchema.parse(req.body);
        const archivo = await (0, cuentas_servicio_archivo_service_1.updateArchivoEstadoService)(id, cuentaServicioId, empresaId, parsed.estado);
        return res.json({
            success: true,
            message: "Estado del archivo actualizado correctamente",
            data: archivo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error actualizando estado del archivo",
        });
    }
}
