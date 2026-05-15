"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrdenes = listOrdenes;
exports.getOrdenHandler = getOrdenHandler;
exports.createOrdenHandler = createOrdenHandler;
exports.updateOrdenHandler = updateOrdenHandler;
exports.updateOrdenStatusHandler = updateOrdenStatusHandler;
exports.listOrdenEstados = listOrdenEstados;
exports.listOrdenesSelectHandler = listOrdenesSelectHandler;
const ordenes_schemas_1 = require("./ordenes.schemas");
const ordenes_service_1 = require("./ordenes.service");
const zod_1 = require("zod");
async function listOrdenes(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const parsedQuery = ordenes_schemas_1.listOrdenesQuerySchema.parse(req.query);
        const ordenes = await (0, ordenes_service_1.getOrdenes)(empresaId, parsedQuery);
        return res.json({
            success: true,
            message: "Ordenes de servicio obtenidas correctamente",
            data: ordenes,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error obteniendo ordenes de servicio",
        });
    }
}
async function getOrdenHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const orden = await (0, ordenes_service_1.getOrdenByIdService)(id, empresaId);
        return res.json({
            success: true,
            message: "Orden de servicio obtenida correctamente",
            data: orden,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error obteniendo orden de servicio",
        });
    }
}
async function createOrdenHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const usuarioId = req.auth.userId;
        const parsed = ordenes_schemas_1.createOrdenSchema.parse(req.body);
        const orden = await (0, ordenes_service_1.createOrdenService)({
            empresaId,
            usuarioId,
            ...parsed,
        });
        return res.status(201).json({
            success: true,
            message: "Orden de servicio creada correctamente",
            data: orden,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error creando orden de servicio",
        });
    }
}
async function updateOrdenHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = ordenes_schemas_1.updateOrdenSchema.parse(req.body);
        const orden = await (0, ordenes_service_1.updateOrdenService)(id, empresaId, parsed);
        return res.json({
            success: true,
            message: "Orden de servicio actualizada correctamente",
            data: orden,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error actualizando orden de servicio",
        });
    }
}
async function updateOrdenStatusHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const usuarioId = req.auth.userId;
        const { id } = req.params;
        const parsed = ordenes_schemas_1.updateOrdenStatusSchema.parse(req.body);
        const orden = await (0, ordenes_service_1.updateOrdenStatusService)(id, empresaId, usuarioId, parsed);
        return res.json({
            success: true,
            message: "Estado de la orden de servicio actualizado correctamente",
            data: orden,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error actualizando estado de la orden de servicio",
        });
    }
}
async function listOrdenEstados(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const estados = await (0, ordenes_service_1.getOrdenEstadosService)(id, empresaId);
        return res.json({
            success: true,
            message: "Historial de estados obtenido correctamente",
            data: estados,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error obteniendo historial de estados",
        });
    }
}
const listOrdenesSelectQuerySchema = zod_1.z.object({
    search: zod_1.z.string().min(1).optional(),
});
async function listOrdenesSelectHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { cuentaServicioId } = req.params;
        const { search } = listOrdenesSelectQuerySchema.parse(req.query);
        const ordenes = await (0, ordenes_service_1.getOrdenesSelectService)(empresaId, { search, cuentaServicioId });
        return res.json({
            success: true,
            message: "Ordenes de servicio obtenidas correctamente",
            data: ordenes,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error obteniendo ordenes de servicio",
        });
    }
}
