"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.createUserHandler = createUserHandler;
exports.updateUserHandler = updateUserHandler;
exports.updateUserStatusHandler = updateUserStatusHandler;
const usuarios_schemas_1 = require("./usuarios.schemas");
const usuarios_service_1 = require("./usuarios.service");
async function listUsers(req, res) {
    const empresaId = req.auth.empresaId;
    const users = await (0, usuarios_service_1.getUsers)(empresaId);
    return res.json({
        success: true,
        data: users,
    });
}
async function createUserHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const parsed = usuarios_schemas_1.createUserSchema.parse(req.body);
        const user = await (0, usuarios_service_1.createUserService)({
            empresaId,
            ...parsed,
        });
        return res.status(201).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error",
        });
    }
}
async function updateUserHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = usuarios_schemas_1.updateUserSchema.parse(req.body);
        const user = await (0, usuarios_service_1.updateUserService)(id, empresaId, parsed);
        return res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error",
        });
    }
}
async function updateUserStatusHandler(req, res) {
    try {
        const empresaId = req.auth.empresaId;
        const { id } = req.params;
        const parsed = usuarios_schemas_1.updateUserStatusSchema.parse(req.body);
        const user = await (0, usuarios_service_1.updateUserStatusService)(id, empresaId, parsed.estado);
        return res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Error",
        });
    }
}
