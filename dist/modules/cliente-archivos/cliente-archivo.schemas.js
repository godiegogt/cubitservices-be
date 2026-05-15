"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateArchivoEstadoSchema = exports.createArchivoSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createArchivoSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(255),
    categoria: zod_1.z.string().min(1).max(50),
    mimeType: zod_1.z.string().min(1).max(120),
    storageKey: zod_1.z.string().min(1),
});
exports.updateArchivoEstadoSchema = zod_1.z.object({
    estado: zod_1.z.nativeEnum(client_1.EstadoArchivo),
});
