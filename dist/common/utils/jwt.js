"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCESS_TOKEN_MAX_AGE_MS = exports.ACCESS_TOKEN_EXPIRES_IN = void 0;
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
exports.ACCESS_TOKEN_EXPIRES_IN = "8h";
exports.ACCESS_TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000;
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: exports.ACCESS_TOKEN_EXPIRES_IN,
    });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
}
