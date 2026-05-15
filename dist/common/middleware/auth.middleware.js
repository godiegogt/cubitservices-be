"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const auth_cookie_1 = require("../utils/auth-cookie");
const jwt_1 = require("../utils/jwt");
function requireAuth(req, res, next) {
    try {
        const token = (0, auth_cookie_1.extractTokenFromRequest)(req);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No autorizado",
            });
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.auth = {
            userId: payload.userId,
            empresaId: payload.empresaId,
            rolId: payload.rolId,
        };
        next();
    }
    catch {
        return res.status(401).json({
            success: false,
            message: "Token inválido o expirado",
        });
    }
}
