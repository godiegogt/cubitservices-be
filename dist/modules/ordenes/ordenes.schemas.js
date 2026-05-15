"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrdenesQuerySchema = exports.updateOrdenStatusSchema = exports.updateOrdenSchema = exports.createOrdenSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const dateTimeStringSchema = zod_1.z.string().datetime();
exports.createOrdenSchema = zod_1.z.object({
    cuentaServicioId: zod_1.z.string().uuid(),
    ubicacionId: zod_1.z.string().uuid(),
    tipoServicioId: zod_1.z.string().uuid(),
    titulo: zod_1.z.string().min(1).max(180),
    descripcion: zod_1.z.string().optional(),
    origen: zod_1.z.nativeEnum(client_1.OrigenOrden),
    prioridad: zod_1.z.nativeEnum(client_1.PrioridadOrden),
    fechaProgramada: dateTimeStringSchema.optional(),
    requiereEvidenciaFinal: zod_1.z.boolean().optional(),
    observacionesGenerales: zod_1.z.string().optional(),
});
exports.updateOrdenSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(1).max(180).optional(),
    descripcion: zod_1.z.string().optional(),
    ubicacionId: zod_1.z.string().uuid().optional(),
    tipoServicioId: zod_1.z.string().uuid().optional(),
    origen: zod_1.z.nativeEnum(client_1.OrigenOrden).optional(),
    prioridad: zod_1.z.nativeEnum(client_1.PrioridadOrden).optional(),
    fechaProgramada: dateTimeStringSchema.optional(),
    requiereEvidenciaFinal: zod_1.z.boolean().optional(),
    observacionesGenerales: zod_1.z.string().optional(),
});
exports.updateOrdenStatusSchema = zod_1.z.object({
    estado: zod_1.z.nativeEnum(client_1.EstadoOrdenServicio),
    motivo: zod_1.z.string().max(500).optional(),
});
exports.listOrdenesQuerySchema = zod_1.z.object({
    estado: zod_1.z.nativeEnum(client_1.EstadoOrdenServicio).optional(),
    clienteId: zod_1.z.string().uuid().optional(),
    cuentaServicioId: zod_1.z.string().uuid().optional(),
    tipoServicioId: zod_1.z.string().uuid().optional(),
    prioridad: zod_1.z.nativeEnum(client_1.PrioridadOrden).optional(),
    origen: zod_1.z.nativeEnum(client_1.OrigenOrden).optional(),
    search: zod_1.z.string().min(1).optional(),
});
