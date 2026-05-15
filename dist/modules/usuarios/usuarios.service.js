"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.createUserService = createUserService;
exports.updateUserService = updateUserService;
exports.updateUserStatusService = updateUserStatusService;
const client_1 = require("@prisma/client");
const hash_1 = require("../../common/utils/hash");
const usuarios_repository_1 = require("./usuarios.repository");
async function getUsers(empresaId) {
    return (0, usuarios_repository_1.findUsersByEmpresa)(empresaId);
}
async function createUserService(input) {
    const existingUser = await (0, usuarios_repository_1.findUserByEmail)(input.empresaId, input.email);
    if (existingUser) {
        throw new Error("El email ya está registrado");
    }
    const passwordHash = await (0, hash_1.hashText)(input.password);
    return (0, usuarios_repository_1.createUser)({
        empresaId: input.empresaId,
        nombres: input.nombres,
        apellidos: input.apellidos,
        email: input.email,
        passwordHash,
        telefono: input.telefono,
        rolId: input.rolId,
        estado: client_1.EstadoUsuario.ACTIVO,
    });
}
async function updateUserService(userId, empresaId, input) {
    const user = await (0, usuarios_repository_1.findUserById)(userId);
    if (!user || user.empresaId !== empresaId) {
        throw new Error("Usuario no encontrado");
    }
    return (0, usuarios_repository_1.updateUser)(userId, input);
}
async function updateUserStatusService(userId, empresaId, estado) {
    const user = await (0, usuarios_repository_1.findUserById)(userId);
    if (!user || user.empresaId !== empresaId) {
        throw new Error("Usuario no encontrado");
    }
    return (0, usuarios_repository_1.updateUser)(userId, { estado });
}
