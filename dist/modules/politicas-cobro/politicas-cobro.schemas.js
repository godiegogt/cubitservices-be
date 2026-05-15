"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePoliticaCobroStatusSchema = exports.updatePoliticaCobroSchema = exports.createPoliticaCobroSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const politicaCobroBaseSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(120),
    tipoVencimiento: zod_1.z.nativeEnum(client_1.TipoVencimiento),
    diaCorte: zod_1.z.number().int().min(1).max(31).optional(),
    diaVencimiento: zod_1.z.number().int().min(1).max(31).optional(),
    diasGracia: zod_1.z.number().int().min(0),
    aplicaMora: zod_1.z.boolean(),
    tipoMora: zod_1.z.nativeEnum(client_1.TipoMora).optional(),
    valorMora: zod_1.z.number().min(0).optional(),
});
exports.createPoliticaCobroSchema = politicaCobroBaseSchema.superRefine((data, ctx) => {
    if (data.tipoVencimiento === client_1.TipoVencimiento.FECHA_FIJA &&
        !data.diaVencimiento) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["diaVencimiento"],
            message: "diaVencimiento es obligatorio para FECHA_FIJA",
        });
    }
    if (data.tipoVencimiento === client_1.TipoVencimiento.FIN_MES &&
        data.diaVencimiento !== undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["diaVencimiento"],
            message: "FIN_MES no debería llevar diaVencimiento",
        });
    }
    if (data.aplicaMora) {
        if (!data.tipoMora) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["tipoMora"],
                message: "tipoMora es obligatorio cuando aplicaMora es true",
            });
        }
        if (data.valorMora === undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["valorMora"],
                message: "valorMora es obligatorio cuando aplicaMora es true",
            });
        }
    }
    if (!data.aplicaMora) {
        if (data.tipoMora !== undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["tipoMora"],
                message: "No debe enviar tipoMora si aplicaMora es false",
            });
        }
        if (data.valorMora !== undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["valorMora"],
                message: "No debe enviar valorMora si aplicaMora es false",
            });
        }
    }
});
exports.updatePoliticaCobroSchema = politicaCobroBaseSchema
    .partial()
    .superRefine((data, ctx) => {
    if (data.tipoVencimiento === client_1.TipoVencimiento.FECHA_FIJA &&
        data.diaVencimiento === undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["diaVencimiento"],
            message: "Si tipoVencimiento es FECHA_FIJA, debes enviar diaVencimiento",
        });
    }
    if (data.tipoVencimiento === client_1.TipoVencimiento.FIN_MES &&
        data.diaVencimiento !== undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["diaVencimiento"],
            message: "FIN_MES no debería llevar diaVencimiento",
        });
    }
    if (data.aplicaMora === true) {
        if (data.tipoMora === undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["tipoMora"],
                message: "tipoMora es obligatorio cuando aplicaMora es true",
            });
        }
        if (data.valorMora === undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["valorMora"],
                message: "valorMora es obligatorio cuando aplicaMora es true",
            });
        }
    }
    if (data.aplicaMora === false) {
        if (data.tipoMora !== undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["tipoMora"],
                message: "No debe enviar tipoMora si aplicaMora es false",
            });
        }
        if (data.valorMora !== undefined) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["valorMora"],
                message: "No debe enviar valorMora si aplicaMora es false",
            });
        }
    }
});
exports.updatePoliticaCobroStatusSchema = zod_1.z.object({
    estado: zod_1.z.nativeEnum(client_1.EstadoRegistroBasico),
});
