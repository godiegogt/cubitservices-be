import { z } from "zod";
import { EstadoRegistroBasico } from "@prisma/client";

const filtersSchema = z.object({
    estado: z.nativeEnum(EstadoRegistroBasico).optional(),
    zonaId: z.string().trim().min(1).optional(),
    servicioId: z.string().min(1).optional(),
    search: z.string().min(1).max(120).optional(),
    fechaInicio: z.string().date().optional(),
    fechaFin: z.string().date().optional(),
});

const rangoFechasRefineOptions = {
    message: "fechaInicio no puede ser mayor que fechaFin",
    path: ["fechaInicio"] as string[],
};

function validarRangoFechas(d: { fechaInicio?: string; fechaFin?: string }) {
    return !(d.fechaInicio && d.fechaFin && d.fechaInicio > d.fechaFin);
}

export const clientesReportQuerySchema = filtersSchema.extend({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(500).default(50),
}).refine(validarRangoFechas, rangoFechasRefineOptions);

export const clientesExportQuerySchema = filtersSchema.refine(
    validarRangoFechas,
    rangoFechasRefineOptions,
);

export type ClientesReportQuery = z.infer<typeof clientesReportQuerySchema>;
export type ClientesExportQuery = z.infer<typeof clientesExportQuerySchema>;
