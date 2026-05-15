"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.logout = logout;
exports.me = me;
const env_1 = require("../../config/env");
const prisma_1 = __importDefault(require("../../config/prisma"));
const auth_cookie_1 = require("../../common/utils/auth-cookie");
const auth_schemas_1 = require("./auth.schemas");
const auth_service_1 = require("./auth.service");
async function login(req, res) {
    try {
        const parsed = auth_schemas_1.loginSchema.parse(req.body);
        const result = await (0, auth_service_1.loginUser)(parsed.email, parsed.password);
        res.cookie(env_1.env.AUTH_COOKIE_NAME, result.token, (0, auth_cookie_1.getAuthCookieOptions)());
        return res.json({
            success: true,
            message: "Login correcto",
            data: result,
        });
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: error instanceof Error ? error.message : "Error de autenticación",
        });
    }
}
async function logout(req, res) {
    res.clearCookie(env_1.env.AUTH_COOKIE_NAME, {
        ...(0, auth_cookie_1.getAuthCookieOptions)(),
        maxAge: undefined,
    });
    return res.json({
        success: true,
        message: "Sesion cerrada",
    });
}
async function me(req, res) {
    try {
        const auth = req.auth;
        const user = await prisma_1.default.usuario.findUnique({
            where: { id: auth.userId },
            include: {
                rol: true,
                empresa: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }
        return res.json({
            success: true,
            message: "Sesión actual",
            data: {
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
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            message: "Error obteniendo sesión",
        });
    }
}
