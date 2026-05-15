"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatusSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createUserSchema = zod_1.z.object({
    nombres: zod_1.z.string().min(1),
    apellidos: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    telefono: zod_1.z.string().optional(),
    rolId: zod_1.z.string().uuid(),
});
exports.updateUserSchema = zod_1.z.object({
    nombres: zod_1.z.string().optional(),
    apellidos: zod_1.z.string().optional(),
    telefono: zod_1.z.string().optional(),
    rolId: zod_1.z.string().uuid().optional(),
});
exports.updateUserStatusSchema = zod_1.z.object({
    estado: zod_1.z.nativeEnum(client_1.EstadoUsuario),
});
