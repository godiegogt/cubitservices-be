import { z } from "zod";

const filtersSchema = z.object({
  fechaInicio: z.string().date().optional(),
  fechaFin: z.string().date().optional(),
  clienteId: z.string().uuid().optional(),
  codigoCliente: z.string().min(1).max(50).optional(),
  nombreCliente: z.string().min(1).max(150).optional(),
  zona: z.coerce.number().int().min(0).optional(),
  metodoPagoId: z.string().uuid().optional(),
  estado: z.enum(["REGISTRADO", "CONFIRMADO", "ANULADO"]).optional(),
  usuarioRegistradorId: z.string().uuid().optional(),
  referencia: z.string().min(1).max(120).optional(),
});

export const reportePagosQuerySchema = filtersSchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const reportePagosExportSchema = filtersSchema;

export type ReportePagosQuery = z.infer<typeof reportePagosQuerySchema>;
export type ReportePagosExportQuery = z.infer<typeof reportePagosExportSchema>;
