import { EstadoPago } from "@prisma/client";
import { z } from "zod";

const dateStringSchema = z.string().date();

export const createPagoSchema = z
  .object({
    clienteId: z.string().uuid(),
    metodoPagoId: z.string().uuid(),
    montoTotal: z.number().positive(),
    referencia: z.string().max(120).optional(),
    fechaPago: dateStringSchema,
    observaciones: z.string().optional(),
    confirmar: z.boolean().optional(),
  })
  .strict();

export const updatePagoStatusSchema = z
  .object({
    estado: z.enum([EstadoPago.CONFIRMADO, EstadoPago.ANULADO]),
    motivo: z.string().min(3).max(500).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.estado === EstadoPago.ANULADO && !value.motivo) {
      ctx.addIssue({
        code: "custom",
        path: ["motivo"],
        message: "El motivo es obligatorio para anular un pago",
      });
    }
  });

export const applyPagoSchema = z
  .object({
    aplicaciones: z
      .array(
        z
          .object({
            cargoId: z.string().uuid(),
            montoAplicado: z.number().positive(),
          })
          .strict()
      )
      .min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    const cargoIds = value.aplicaciones.map((aplicacion) => aplicacion.cargoId);
    const uniqueCargoIds = new Set(cargoIds);

    if (uniqueCargoIds.size !== cargoIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["aplicaciones"],
        message: "No se permiten cargos duplicados en la misma aplicacion",
      });
    }

    const total = value.aplicaciones.reduce(
      (sum, aplicacion) => sum + aplicacion.montoAplicado,
      0
    );

    if (total <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["aplicaciones"],
        message: "El total aplicado debe ser mayor que 0",
      });
    }
  });

export const getPagosQuerySchema = z.object({
  clienteId: z.string().uuid().optional(),
  metodoPagoId: z.string().uuid().optional(),
  estado: z.nativeEnum(EstadoPago).optional(),
  fechaDesde: dateStringSchema.optional(),
  fechaHasta: dateStringSchema.optional(),
  search: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
