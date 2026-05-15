"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCuentaServicioStatusSchema = exports.updateCuentaServicioSchema = exports.createCuentaServicioSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const dateStringSchema = zod_1.z.string().date();
const createCuentaServicioBaseSchema = zod_1.z.object({
    clienteId: zod_1.z.string().uuid(),
    ubicacionId: zod_1.z.string().uuid().optional(),
    tipoServicioId: zod_1.z.string().uuid(),
    politicaCobroId: zod_1.z.string().uuid().optional(),
    codigo: zod_1.z.string().min(1).max(50),
    nombre: zod_1.z.string().min(1).max(180),
    descripcion: zod_1.z.string().optional(),
    modalidad: zod_1.z.nativeEnum(client_1.ModalidadServicio),
    frecuencia: zod_1.z.nativeEnum(client_1.FrecuenciaServicio).optional(),
    fechaInicio: dateStringSchema.optional(),
    fechaFin: dateStringSchema.nullable().optional(),
    montoBase: zod_1.z.number().min(0),
    diaCorte: zod_1.z.number().int().min(1).max(31).optional(),
    diaPago: zod_1.z.number().int().min(1).max(31).optional(),
    observaciones: zod_1.z.string().optional(),
});
const updateCuentaServicioBaseSchema = zod_1.z.object({
    clienteId: zod_1.z.string().uuid().optional(),
    ubicacionId: zod_1.z.string().uuid().nullable().optional(),
    tipoServicioId: zod_1.z.string().uuid().optional(),
    politicaCobroId: zod_1.z.string().uuid().nullable().optional(),
    codigo: zod_1.z.string().min(1).max(50).optional(),
    nombre: zod_1.z.string().min(1).max(180).optional(),
    descripcion: zod_1.z.string().optional(),
    modalidad: zod_1.z.nativeEnum(client_1.ModalidadServicio).optional(),
    frecuencia: zod_1.z.nativeEnum(client_1.FrecuenciaServicio).nullable().optional(),
    fechaInicio: dateStringSchema.nullable().optional(),
    fechaFin: dateStringSchema.nullable().optional(),
    montoBase: zod_1.z.number().min(0).optional(),
    diaCorte: zod_1.z.number().int().min(1).max(31).nullable().optional(),
    diaPago: zod_1.z.number().int().min(1).max(31).nullable().optional(),
    observaciones: zod_1.z.string().optional(),
});
exports.createCuentaServicioSchema = createCuentaServicioBaseSchema.superRefine((data, ctx) => {
    if (data.modalidad === client_1.ModalidadServicio.RECURRENTE) {
        if (!data.frecuencia) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["frecuencia"],
                message: "frecuencia es obligatoria para modalidad RECURRENTE",
            });
        }
        if (!data.politicaCobroId) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["politicaCobroId"],
                message: "politicaCobroId es obligatoria para modalidad RECURRENTE",
            });
        }
    }
    if (data.modalidad === client_1.ModalidadServicio.PUNTUAL && data.frecuencia !== undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["frecuencia"],
            message: "frecuencia no debe enviarse para modalidad PUNTUAL",
        });
    }
});
exports.updateCuentaServicioSchema = updateCuentaServicioBaseSchema.superRefine((data, ctx) => {
    if (data.modalidad === client_1.ModalidadServicio.RECURRENTE) {
        if (data.frecuencia === undefined || data.frecuencia === null) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["frecuencia"],
                message: "frecuencia es obligatoria cuando modalidad es RECURRENTE",
            });
        }
        if (data.politicaCobroId === undefined || data.politicaCobroId === null) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["politicaCobroId"],
                message: "politicaCobroId es obligatoria cuando modalidad es RECURRENTE",
            });
        }
    }
    if (data.modalidad === client_1.ModalidadServicio.PUNTUAL && data.frecuencia !== undefined) {
        if (data.frecuencia !== null) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["frecuencia"],
                message: "frecuencia no debe enviarse para modalidad PUNTUAL",
            });
        }
    }
});
exports.updateCuentaServicioStatusSchema = zod_1.z.object({
    estado: zod_1.z.nativeEnum(client_1.EstadoCuentaServicio),
    motivo: zod_1.z.string().max(500).optional(),
});
