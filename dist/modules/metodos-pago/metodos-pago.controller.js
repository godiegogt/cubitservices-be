"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMetodosPago = listMetodosPago;
exports.createMetodoPagoHandler = createMetodoPagoHandler;
exports.updateMetodoPagoHandler = updateMetodoPagoHandler;
exports.updateMetodoPagoStatusHandler = updateMetodoPagoStatusHandler;
const metodos_pago_schemas_1 = require("./metodos-pago.schemas");
const metodos_pago_service_1 = require("./metodos-pago.service");
async function listMetodosPago(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const metodos = await (0, metodos_pago_service_1.getMetodosPago)(empresaId);
        return res.json({
            success: true,
            message: "Métodos de pago obtenidos correctamente",
            data: metodos,
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            message: "Error obteniendo métodos de pago",
        });
    }
}
async function createMetodoPagoHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const parsed = metodos_pago_schemas_1.createMetodoPagoSchema.parse(req.body);
        const metodo = await (0, metodos_pago_service_1.createMetodoPagoService)({
            empresaId,
            ...parsed,
        });
        return res.status(201).json({
            success: true,
            message: "Método de pago creado correctamente",
            data: metodo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error creando método de pago",
        });
    }
}
async function updateMetodoPagoHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = metodos_pago_schemas_1.updateMetodoPagoSchema.parse(req.body);
        const metodo = await (0, metodos_pago_service_1.updateMetodoPagoService)(id, empresaId, parsed);
        return res.json({
            success: true,
            message: "Método de pago actualizado correctamente",
            data: metodo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error actualizando método de pago",
        });
    }
}
async function updateMetodoPagoStatusHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = metodos_pago_schemas_1.updateMetodoPagoStatusSchema.parse(req.body);
        const metodo = await (0, metodos_pago_service_1.updateMetodoPagoStatusService)(id, empresaId, parsed.estado);
        return res.json({
            success: true,
            message: "Estado actualizado correctamente",
            data: metodo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error actualizando estado",
        });
    }
}
