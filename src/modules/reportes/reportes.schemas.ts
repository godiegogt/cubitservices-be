import { z } from "zod";

const dateStringSchema = z.string().date();

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export const reportePagosQuerySchema = z.object({
  fechaInicio: dateStringSchema.default(todayISO),
  fechaFin: dateStringSchema.default(todayISO),
  clienteId: z.string().uuid().optional(),
  codigoCliente: z.string().min(1).max(50).optional(),
  nombreCliente: z.string().min(1).max(150).optional(),
  zona: z.coerce.number().int().min(0).optional(),
  metodoPagoId: z.string().uuid().optional(),
  estado: z.enum(["REGISTRADO", "CONFIRMADO", "ANULADO"]).optional(),
  usuarioRegistradorId: z.string().uuid().optional(),
  referencia: z.string().min(1).max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(50),
  formato: z.enum(["json", "pdf", "xlsx"]).default("json"),
});

export type ReportePagosQuery = z.infer<typeof reportePagosQuerySchema>;
