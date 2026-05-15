"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTipoServicioStatusSchema = exports.updateTipoServicioSchema = exports.createTipoServicioSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createTipoServicioSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(120),
    descripcion: zod_1.z.string().optional(),
    precioBase: zod_1.z.number().min(0),
});
exports.updateTipoServicioSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(120).optional(),
    descripcion: zod_1.z.string().optional(),
    precioBase: zod_1.z.number().min(0).optional(),
});
exports.updateTipoServicioStatusSchema = zod_1.z.object({
    estado: zod_1.z.nativeEnum(client_1.EstadoRegistroBasico),
});
