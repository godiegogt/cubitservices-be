"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUbicaciones = listUbicaciones;
exports.createUbicacionHandler = createUbicacionHandler;
exports.updateUbicacionHandler = updateUbicacionHandler;
exports.updateUbicacionEstadoHandler = updateUbicacionEstadoHandler;
const ubicacion_schemas_1 = require("./ubicacion.schemas");
const ubicaciones_service_1 = require("./ubicaciones.service");
async function listUbicaciones(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { clienteId } = req.params;
        const ubicaciones = await (0, ubicaciones_service_1.getUbicacionesService)(clienteId, empresaId);
        return res.json({
            success: true,
            message: "Ubicaciones obtenidas correctamente",
            data: ubicaciones,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error instanceof Error ? error.message : "Error obteniendo ubicaciones",
        });
    }
}
async function createUbicacionHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { clienteId } = req.params;
        const parsed = ubicacion_schemas_1.createUbicacionSchema.parse(req.body);
        const ubicacion = await (0, ubicaciones_service_1.createUbicacionService)(clienteId, empresaId, parsed);
        return res.status(201).json({
            success: true,
            message: "Ubicación creada correctamente",
            data: ubicacion,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error creando ubicación",
        });
    }
}
async function updateUbicacionHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { clienteId, id } = req.params;
        const parsed = ubicacion_schemas_1.updateUbicacionSchema.parse(req.body);
        const ubicacion = await (0, ubicaciones_service_1.updateUbicacionService)(id, clienteId, empresaId, parsed);
        return res.json({
            success: true,
            message: "Ubicación actualizada correctamente",
            data: ubicacion,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error actualizando ubicación",
        });
    }
}
async function updateUbicacionEstadoHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { clienteId, id } = req.params;
        const parsed = ubicacion_schemas_1.updateUbicacionEstadoSchema.parse(req.body);
        const ubicacion = await (0, ubicaciones_service_1.updateUbicacionEstadoService)(id, clienteId, empresaId, parsed.estado);
        return res.json({
            success: true,
            message: "Estado de la ubicación actualizado correctamente",
            data: ubicacion,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error actualizando estado de la ubicación",
        });
    }
}
