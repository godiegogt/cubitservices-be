"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoleStatusSchema = exports.updateRoleSchema = exports.createRoleSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createRoleSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(80),
    descripcion: zod_1.z.string().max(500).optional(),
});
exports.updateRoleSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(80).optional(),
    descripcion: zod_1.z.string().max(500).optional(),
});
exports.updateRoleStatusSchema = zod_1.z.object({
    estado: zod_1.z.nativeEnum(client_1.EstadoRegistroBasico),
});
