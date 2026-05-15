"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCargos = listCargos;
exports.getCargoHandler = getCargoHandler;
exports.createCargoHandler = createCargoHandler;
exports.createCargoFromCuentaHandler = createCargoFromCuentaHandler;
exports.updateCargoStatusHandler = updateCargoStatusHandler;
const cargos_schemas_1 = require("./cargos.schemas");
const cargos_service_1 = require("./cargos.service");
async function listCargos(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const parsedQuery = cargos_schemas_1.getCargosQuerySchema.parse(req.query);
        const result = await (0, cargos_service_1.getCargosService)(empresaId, parsedQuery);
        return res.json({
            success: true,
            message: "Cargos obtenidos correctamente",
            data: result.data,
            meta: result.meta,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error obteniendo cargos",
        });
    }
}
async function getCargoHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const cargo = await (0, cargos_service_1.getCargoByIdService)(id, empresaId);
        return res.json({
            success: true,
            message: "Cargo obtenido correctamente",
            data: cargo,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            message: error instanceof Error ? error.message : "Error obteniendo cargo",
        });
    }
}
async function createCargoHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const parsed = cargos_schemas_1.createCargoSchema.parse(req.body);
        const cargo = await (0, cargos_service_1.createCargoService)({
            empresaId,
            ...parsed,
        });
        return res.status(201).json({
            success: true,
            message: "Cargo creado correctamente",
            data: cargo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error creando cargo",
        });
    }
}
async function createCargoFromCuentaHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = cargos_schemas_1.createCargoFromCuentaSchema.parse(req.body);
        const cargo = await (0, cargos_service_1.createCargoFromCuentaService)({
            empresaId,
            cuentaServicioId: id,
            ...parsed,
        });
        return res.status(201).json({
            success: true,
            message: "Cargo creado correctamente",
            data: cargo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error creando cargo",
        });
    }
}
async function updateCargoStatusHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = cargos_schemas_1.updateCargoStatusSchema.parse(req.body);
        const cargo = await (0, cargos_service_1.updateCargoStatusService)(id, empresaId, parsed);
        return res.json({
            success: true,
            message: "Cargo anulado correctamente",
            data: cargo,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error actualizando estado del cargo",
        });
    }
}
