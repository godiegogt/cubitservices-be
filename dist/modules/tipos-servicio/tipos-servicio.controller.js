"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTiposServicio = listTiposServicio;
exports.createTipoServicioHandler = createTipoServicioHandler;
exports.updateTipoServicioHandler = updateTipoServicioHandler;
exports.updateTipoServicioStatusHandler = updateTipoServicioStatusHandler;
const tipos_servicio_schemas_1 = require("./tipos-servicio.schemas");
const tipos_servicio_service_1 = require("./tipos-servicio.service");
async function listTiposServicio(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const tipos = await (0, tipos_servicio_service_1.getTiposServicio)(empresaId);
        return res.json({
            success: true,
            message: "Tipos de servicio obtenidos correctamente",
            data: tipos,
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            message: "Error obteniendo tipos de servicio",
        });
    }
}
async function createTipoServicioHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const parsed = tipos_servicio_schemas_1.createTipoServicioSchema.parse(req.body);
        const tipo = await (0, tipos_servicio_service_1.createTipoServicioService)({
            empresaId,
            ...parsed,
        });
        return res.status(201).json({
            success: true,
            message: "Tipo de servicio creado correctamente",
            data: tipo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error creando tipo de servicio",
        });
    }
}
async function updateTipoServicioHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = tipos_servicio_schemas_1.updateTipoServicioSchema.parse(req.body);
        const tipo = await (0, tipos_servicio_service_1.updateTipoServicioService)(id, empresaId, parsed);
        return res.json({
            success: true,
            message: "Tipo de servicio actualizado correctamente",
            data: tipo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error actualizando tipo de servicio",
        });
    }
}
async function updateTipoServicioStatusHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = tipos_servicio_schemas_1.updateTipoServicioStatusSchema.parse(req.body);
        const tipo = await (0, tipos_servicio_service_1.updateTipoServicioStatusService)(id, empresaId, parsed.estado);
        return res.json({
            success: true,
            message: "Estado actualizado correctamente",
            data: tipo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error actualizando estado",
        });
    }
}
