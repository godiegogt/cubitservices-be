"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRoles = listRoles;
exports.createRoleHandler = createRoleHandler;
exports.updateRoleHandler = updateRoleHandler;
exports.updateRoleStatusHandler = updateRoleStatusHandler;
const roles_schemas_1 = require("./roles.schemas");
const roles_service_1 = require("./roles.service");
async function listRoles(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const roles = await (0, roles_service_1.getRoles)(empresaId);
        return res.json({
            success: true,
            message: "Roles obtenidos correctamente",
            data: roles,
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            message: "Error obteniendo roles",
        });
    }
}
async function createRoleHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const parsed = roles_schemas_1.createRoleSchema.parse(req.body);
        const role = await (0, roles_service_1.createRoleService)({
            empresaId,
            ...parsed,
        });
        return res.status(201).json({
            success: true,
            message: "Rol creado correctamente",
            data: role,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error creando rol",
        });
    }
}
async function updateRoleHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = roles_schemas_1.updateRoleSchema.parse(req.body);
        const role = await (0, roles_service_1.updateRoleService)(id, empresaId, parsed);
        return res.json({
            success: true,
            message: "Rol actualizado correctamente",
            data: role,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error actualizando rol",
        });
    }
}
async function updateRoleStatusHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = roles_schemas_1.updateRoleStatusSchema.parse(req.body);
        const role = await (0, roles_service_1.updateRoleStatusService)(id, empresaId, parsed.estado);
        return res.json({
            success: true,
            message: "Estado del rol actualizado correctamente",
            data: role,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error actualizando estado del rol",
        });
    }
}
