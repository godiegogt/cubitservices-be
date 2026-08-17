import { z } from "zod";
import { EstadoPago } from "@prisma/client";

const filtersSchema = z.object({
  fechaInicio: z.string().date().optional(),
  fechaFin: z.string().date().optional(),
  clienteId: z.string().uuid().optional(),
  codigoCliente: z.string().min(1).max(50).optional(),
  nombreCliente: z.string().min(1).max(150).optional(),
  zona: z.string().trim().min(1).optional(),
  aldea: z.string().trim().min(1).optional(),
  metodoPagoId: z.string().uuid().optional(),
  estado: z.nativeEnum(EstadoPago).optional(),
  usuarioRegistradorId: z.string().uuid().optional(),
  referencia: z.string().min(1).max(120).optional(),
});

const rangoFechasRefineOptions = {
  message: "fechaInicio no puede ser mayor que fechaFin",
  path: ["fechaInicio"] as string[],
};

function validarRangoFechas(d: { fechaInicio?: string; fechaFin?: string }) {
  return !(d.fechaInicio && d.fechaFin && d.fechaInicio > d.fechaFin);
}

export const reportePagosQuerySchema = filtersSchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
}).refine(validarRangoFechas, rangoFechasRefineOptions);

export const reportePagosExportSchema = filtersSchema.refine(
  validarRangoFechas,
  rangoFechasRefineOptions,
);

export type ReportePagosQuery = z.infer<typeof reportePagosQuerySchema>;
export type ReportePagosExportQuery = z.infer<typeof reportePagosExportSchema>;
