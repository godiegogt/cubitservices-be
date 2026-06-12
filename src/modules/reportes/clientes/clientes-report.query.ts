import { z } from "zod";

export const clientesReportQuerySchema = z.object({
    estado: z.enum(["ACTIVO", "INACTIVO"]).optional(),
    zonaId: z.coerce.number().int().min(1).optional(),
    servicioId: z.string().uuid().optional(),
    search: z.string().min(1).max(120).optional(),
    fechaInicio: z.string().date().optional(),
    fechaFin: z.string().date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(500).default(50),
    formato: z.enum(["json", "pdf", "xlsx"]).default("json"),
});

export type ClientesReportQuery = z.infer<typeof clientesReportQuerySchema>;
