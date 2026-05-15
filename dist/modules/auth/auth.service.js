"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
const client_1 = require("@prisma/client");
const hash_1 = require("../../common/utils/hash");
const jwt_1 = require("../../common/utils/jwt");
const auth_repository_1 = require("./auth.repository");
async function loginUser(email, password) {
    const user = await (0, auth_repository_1.findUserByEmail)(email);
    if (!user) {
        throw new Error("Credenciales inválidas");
    }
    if (user.estado === client_1.EstadoUsuario.INACTIVO || user.estado === client_1.EstadoUsuario.BLOQUEADO) {
        throw new Error("Usuario inactivo o bloqueado");
    }
    const isValidPassword = await (0, hash_1.compareHash)(password, user.passwordHash);
    if (!isValidPassword) {
        throw new Error("Credenciales inválidas");
    }
    await (0, auth_repository_1.updateLastAccess)(user.id);
    const token = (0, jwt_1.signAccessToken)({
        userId: user.id,
        empresaId: user.empresaId,
        rolId: user.rolId,
    });
    return {
        token,
        user: {
            id: user.id,
            nombres: user.nombres,
            apellidos: user.apellidos,
            email: user.email,
            estado: user.estado,
            empresa: {
                id: user.empresa.id,
                nombre: user.empresa.nombre,
            },
            rol: {
                id: user.rol.id,
                nombre: user.rol.nombre,
            },
        },
    };
}
