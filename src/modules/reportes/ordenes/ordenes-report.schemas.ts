import { EstadoOrdenServicio } from "@prisma/client";
import { z } from "zod";

const dateStringSchema = z.string().date();

const baseFiltersSchema = {
    estado: z.nativeEnum(EstadoOrdenServicio).optional(),
    tipoServicioId: z.string().uuid().optional(),
    tecnicoId: z.string().uuid().optional(),
    zonaId: z.coerce.number().int().min(1).optional(),
    fechaInicio: dateStringSchema.optional(),
    fechaFin: dateStringSchema.optional(),
    search: z.string().min(1).max(120).optional(),
};

export const reporteOrdenesQuerySchema = z.object({
    ...baseFiltersSchema,
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(500).default(10),
});

export const reporteOrdenesExportQuerySchema = z.object({
    ...baseFiltersSchema,
});

export type ReporteOrdenesQuery = z.infer<typeof reporteOrdenesQuerySchema>;
export type ReporteOrdenesExportQuery = z.infer<typeof reporteOrdenesExportQuerySchema>;
