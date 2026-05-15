"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
    JWT_SECRET: process.env.JWT_SECRET || "super-secret-key",
    NODE_ENV: process.env.NODE_ENV || "development",
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME || "access_token",
};
