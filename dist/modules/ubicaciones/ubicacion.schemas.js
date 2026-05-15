"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUbicacionEstadoSchema = exports.updateUbicacionSchema = exports.createUbicacionSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createUbicacionSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(120),
    direccion: zod_1.z.string().min(1),
    referencia: zod_1.z.string().optional(),
    latitud: zod_1.z.number().nullable().optional(),
    longitud: zod_1.z.number().nullable().optional(),
    esPrincipal: zod_1.z.boolean().optional().default(false),
});
exports.updateUbicacionSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(120).optional(),
    direccion: zod_1.z.string().min(1).optional(),
    referencia: zod_1.z.string().optional(),
    latitud: zod_1.z.number().nullable().optional(),
    longitud: zod_1.z.number().nullable().optional(),
    esPrincipal: zod_1.z.boolean().optional(),
});
exports.updateUbicacionEstadoSchema = zod_1.z.object({
    estado: zod_1.z.nativeEnum(client_1.EstadoUbicacion),
});
