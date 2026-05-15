"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCargosQuerySchema = exports.updateCargoStatusSchema = exports.createCargoFromCuentaSchema = exports.createCargoSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const dateStringSchema = zod_1.z.string().date();
exports.createCargoSchema = zod_1.z
    .object({
    cuentaServicioId: zod_1.z.string().uuid(),
    ordenServicioId: zod_1.z.string().uuid().nullable().optional(),
    tipoCargo: zod_1.z.nativeEnum(client_1.TipoCargo),
    concepto: zod_1.z.string().min(1).max(255),
    periodoReferencia: zod_1.z.string().max(50).optional(),
    monto: zod_1.z.number().positive(),
    fechaEmision: dateStringSchema,
})
    .strict();
exports.createCargoFromCuentaSchema = zod_1.z
    .object({
    ordenServicioId: zod_1.z.string().uuid().nullable().optional(),
    tipoCargo: zod_1.z.nativeEnum(client_1.TipoCargo),
    concepto: zod_1.z.string().min(1).max(255),
    periodoReferencia: zod_1.z.string().max(50).optional(),
    monto: zod_1.z.number().positive(),
    fechaEmision: dateStringSchema,
})
    .strict();
exports.updateCargoStatusSchema = zod_1.z
    .object({
    estado: zod_1.z.nativeEnum(client_1.EstadoCargo),
    motivo: zod_1.z.string().min(3).max(500).optional(),
})
    .strict();
exports.getCargosQuerySchema = zod_1.z.object({
    clienteId: zod_1.z.string().uuid().optional(),
    cuentaServicioId: zod_1.z.string().uuid().optional(),
    estado: zod_1.z.nativeEnum(client_1.EstadoCargo).optional(),
    tipoCargo: zod_1.z.nativeEnum(client_1.TipoCargo).optional(),
    periodoReferencia: zod_1.z.string().max(50).optional(),
    search: zod_1.z.string().min(1).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
