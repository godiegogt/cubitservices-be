"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthCookieOptions = getAuthCookieOptions;
exports.extractTokenFromRequest = extractTokenFromRequest;
const env_1 = require("../../config/env");
const jwt_1 = require("./jwt");
function getAuthCookieOptions() {
    const isProduction = env_1.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: jwt_1.ACCESS_TOKEN_MAX_AGE_MS,
        path: "/",
    };
}
function extractTokenFromRequest(req) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        return null;
    }
    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
    for (const cookie of cookies) {
        const [name, ...valueParts] = cookie.split("=");
        if (name === env_1.env.AUTH_COOKIE_NAME) {
            return decodeURIComponent(valueParts.join("="));
        }
    }
    return null;
}
