"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPoliticasCobro = listPoliticasCobro;
exports.createPoliticaCobroHandler = createPoliticaCobroHandler;
exports.updatePoliticaCobroHandler = updatePoliticaCobroHandler;
exports.updatePoliticaCobroStatusHandler = updatePoliticaCobroStatusHandler;
const politicas_cobro_schemas_1 = require("./politicas-cobro.schemas");
const politicas_cobro_service_1 = require("./politicas-cobro.service");
async function listPoliticasCobro(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const politicas = await (0, politicas_cobro_service_1.getPoliticasCobro)(empresaId);
        return res.json({
            success: true,
            message: "Políticas de cobro obtenidas correctamente",
            data: politicas,
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            message: "Error obteniendo políticas de cobro",
        });
    }
}
async function createPoliticaCobroHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const parsed = politicas_cobro_schemas_1.createPoliticaCobroSchema.parse(req.body);
        const politica = await (0, politicas_cobro_service_1.createPoliticaCobroService)({
            empresaId,
            ...parsed,
        });
        return res.status(201).json({
            success: true,
            message: "Política de cobro creada correctamente",
            data: politica,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error creando política de cobro",
        });
    }
}
async function updatePoliticaCobroHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = politicas_cobro_schemas_1.updatePoliticaCobroSchema.parse(req.body);
        const politica = await (0, politicas_cobro_service_1.updatePoliticaCobroService)(id, empresaId, parsed);
        return res.json({
            success: true,
            message: "Política de cobro actualizada correctamente",
            data: politica,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Error actualizando política de cobro",
        });
    }
}
async function updatePoliticaCobroStatusHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = politicas_cobro_schemas_1.updatePoliticaCobroStatusSchema.parse(req.body);
        const politica = await (0, politicas_cobro_service_1.updatePoliticaCobroStatusService)(id, empresaId, parsed.estado);
        return res.json({
            success: true,
            message: "Estado actualizado correctamente",
            data: politica,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error actualizando estado",
        });
    }
}
