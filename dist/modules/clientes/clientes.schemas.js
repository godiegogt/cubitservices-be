"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchClientesSelectSchema = exports.updateClienteStatusSchema = exports.updateClienteSchema = exports.createClienteSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createClienteSchema = zod_1.z
    .object({
    codigo: zod_1.z.string().min(1).max(50),
    tipoCliente: zod_1.z.nativeEnum(client_1.TipoCliente),
    primerNombre: zod_1.z.string().max(80).optional(),
    segundoNombre: zod_1.z.string().max(80).optional(),
    primerApellido: zod_1.z.string().max(80).optional(),
    segundoApellido: zod_1.z.string().max(80).optional(),
    nombreRazonSocial: zod_1.z.string().min(1).max(180),
    nombreComercial: zod_1.z.string().max(180).optional(),
    tipoIdentificacion: zod_1.z.nativeEnum(client_1.TipoIdentificacion).optional(),
    identificacion: zod_1.z.string().max(60).optional(),
    telefono: zod_1.z.string().max(30).optional(),
    email: zod_1.z.string().email().optional(),
    direccionFiscal: zod_1.z.string().optional(),
    observaciones: zod_1.z.string().optional(),
})
    .superRefine((data, ctx) => {
    if (data.tipoCliente === client_1.TipoCliente.INDIVIDUAL) {
        if (!data.primerNombre) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["primerNombre"],
                message: "El primer nombre es obligatorio para cliente individual",
            });
        }
        if (!data.primerApellido) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["primerApellido"],
                message: "El primer apellido es obligatorio para cliente individual",
            });
        }
    }
});
exports.updateClienteSchema = zod_1.z.object({
    tipoCliente: zod_1.z.nativeEnum(client_1.TipoCliente).optional(),
    primerNombre: zod_1.z.string().max(80).optional(),
    segundoNombre: zod_1.z.string().max(80).optional(),
    primerApellido: zod_1.z.string().max(80).optional(),
    segundoApellido: zod_1.z.string().max(80).optional(),
    nombreRazonSocial: zod_1.z.string().min(1).max(180).optional(),
    nombreComercial: zod_1.z.string().max(180).optional(),
    tipoIdentificacion: zod_1.z.nativeEnum(client_1.TipoIdentificacion).optional(),
    identificacion: zod_1.z.string().max(60).optional(),
    telefono: zod_1.z.string().max(30).optional(),
    email: zod_1.z.string().email().optional(),
    direccionFiscal: zod_1.z.string().optional(),
    observaciones: zod_1.z.string().optional(),
});
exports.updateClienteStatusSchema = zod_1.z.object({
    estado: zod_1.z.nativeEnum(client_1.EstadoRegistroBasico),
});
exports.searchClientesSelectSchema = zod_1.z.object({
    search: zod_1.z.string().max(100).optional(),
});
