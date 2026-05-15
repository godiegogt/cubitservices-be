"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCuentasServicio = listCuentasServicio;
exports.getCuentaServicioHandler = getCuentaServicioHandler;
exports.createCuentaServicioHandler = createCuentaServicioHandler;
exports.updateCuentaServicioHandler = updateCuentaServicioHandler;
exports.updateCuentaServicioStatusHandler = updateCuentaServicioStatusHandler;
exports.listCuentasServicioSelectHandler = listCuentasServicioSelectHandler;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const cuentas_servicio_schemas_1 = require("./cuentas-servicio.schemas");
const cuentas_servicio_service_1 = require("./cuentas-servicio.service");
const listCuentasServicioQuerySchema = zod_1.z.object({
    clienteId: zod_1.z.string().uuid().optional(),
    estado: zod_1.z.nativeEnum(client_1.EstadoCuentaServicio).optional(),
    tipoServicioId: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().min(1).optional(),
});
const listCuentasServicioSelectQuerySchema = zod_1.z.object({
    clienteId: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().min(1).optional(),
});
async function listCuentasServicio(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const parsedQuery = listCuentasServicioQuerySchema.parse(req.query);
        const cuentasServicio = await (0, cuentas_servicio_service_1.getCuentasServicio)(empresaId, parsedQuery);
        return res.json({
            success: true,
            message: "Cuentas de servicio obtenidas correctamente",
            data: cuentasServicio,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error obteniendo cuentas de servicio",
        });
    }
}
async function getCuentaServicioHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const cuentaServicio = await (0, cuentas_servicio_service_1.getCuentaServicioByIdService)(id, empresaId);
        return res.json({
            success: true,
            message: "Cuenta de servicio obtenida correctamente",
            data: cuentaServicio,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error obteniendo cuenta de servicio",
        });
    }
}
async function createCuentaServicioHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const parsed = cuentas_servicio_schemas_1.createCuentaServicioSchema.parse(req.body);
        const cuentaServicio = await (0, cuentas_servicio_service_1.createCuentaServicioService)({
            empresaId,
            ...parsed,
        });
        return res.status(201).json({
            success: true,
            message: "Cuenta de servicio creada correctamente",
            data: cuentaServicio,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error creando cuenta de servicio",
        });
    }
}
async function updateCuentaServicioHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = cuentas_servicio_schemas_1.updateCuentaServicioSchema.parse(req.body);
        const cuentaServicio = await (0, cuentas_servicio_service_1.updateCuentaServicioService)(id, empresaId, parsed);
        return res.json({
            success: true,
            message: "Cuenta de servicio actualizada correctamente",
            data: cuentaServicio,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error actualizando cuenta de servicio",
        });
    }
}
async function updateCuentaServicioStatusHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = cuentas_servicio_schemas_1.updateCuentaServicioStatusSchema.parse(req.body);
        const cuentaServicio = await (0, cuentas_servicio_service_1.updateCuentaServicioStatusService)(id, empresaId, parsed.estado);
        return res.json({
            success: true,
            message: "Estado de la cuenta de servicio actualizado correctamente",
            data: cuentaServicio,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error actualizando estado de la cuenta de servicio",
        });
    }
}
async function listCuentasServicioSelectHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const parsed = listCuentasServicioSelectQuerySchema.parse(req.query);
        const cuentas = await (0, cuentas_servicio_service_1.getCuentasServicioSelectService)(empresaId, parsed);
        return res.json({
            success: true,
            message: "Cuentas de servicio obtenidas correctamente",
            data: cuentas,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error obteniendo cuentas de servicio",
        });
    }
}
