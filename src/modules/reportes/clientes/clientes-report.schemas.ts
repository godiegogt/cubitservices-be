import { z } from "zod";

const filtersSchema = z.object({
    estado: z.enum(["ACTIVO", "INACTIVO"]).optional(),
    zonaId: z.coerce.number().int().min(0).optional(),
    servicio: z.string().min(1).optional(),
    search: z.string().min(1).max(120).optional(),
    fechaInicio: z.string().date().optional(),
    fechaFin: z.string().date().optional(),
});

export const clientesReportQuerySchema = filtersSchema.extend({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(500).default(50),
});

export const clientesExportQuerySchema = filtersSchema;

export type ClientesReportQuery = z.infer<typeof clientesReportQuerySchema>;
export type ClientesExportQuery = z.infer<typeof clientesExportQuerySchema>;
