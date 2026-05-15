"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoles = getRoles;
exports.createRoleService = createRoleService;
exports.updateRoleService = updateRoleService;
exports.updateRoleStatusService = updateRoleStatusService;
const roles_repository_1 = require("./roles.repository");
async function getRoles(empresaId) {
    return (0, roles_repository_1.findRolesByEmpresa)(empresaId);
}
async function createRoleService(input) {
    const existingRole = await (0, roles_repository_1.findRoleByName)(input.empresaId, input.nombre);
    if (existingRole) {
        throw new Error("Ya existe un rol con ese nombre");
    }
    return (0, roles_repository_1.createRole)(input);
}
async function updateRoleService(roleId, empresaId, input) {
    const role = await (0, roles_repository_1.findRoleById)(roleId);
    if (!role || role.empresaId !== empresaId) {
        throw new Error("Rol no encontrado");
    }
    if (input.nombre && input.nombre !== role.nombre) {
        const existingRole = await (0, roles_repository_1.findRoleByName)(empresaId, input.nombre);
        if (existingRole) {
            throw new Error("Ya existe un rol con ese nombre");
        }
    }
    return (0, roles_repository_1.updateRole)(roleId, input);
}
async function updateRoleStatusService(roleId, empresaId, estado) {
    const role = await (0, roles_repository_1.findRoleById)(roleId);
    if (!role || role.empresaId !== empresaId) {
        throw new Error("Rol no encontrado");
    }
    return (0, roles_repository_1.updateRoleStatus)(roleId, estado);
}
