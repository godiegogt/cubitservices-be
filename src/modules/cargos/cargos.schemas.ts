import { EstadoCargo, TipoCargo } from "@prisma/client";
import { z } from "zod";

const dateStringSchema = z.string().date();

export const createCargoSchema = z
  .object({
    cuentaServicioId: z.string().uuid(),
    ordenServicioId: z.string().uuid().nullable().optional(),
    tipoCargo: z.nativeEnum(TipoCargo),
    concepto: z.string().min(1).max(255),
    periodoReferencia: z.string().max(50).optional(),
    monto: z.number().positive(),
    fechaEmision: dateStringSchema,
  })
  .strict();

export const createCargoFromCuentaSchema = z
  .object({
    ordenServicioId: z.string().uuid().nullable().optional(),
    tipoCargo: z.nativeEnum(TipoCargo),
    concepto: z.string().min(1).max(255),
    periodoReferencia: z.string().max(50).optional(),
    monto: z.number().positive(),
    fechaEmision: dateStringSchema,
  })
  .strict();

export const updateCargoStatusSchema = z
  .object({
    estado: z.nativeEnum(EstadoCargo),
    motivo: z.string().min(3).max(500).optional(),
  })
  .strict();

export const getCargosQuerySchema = z.object({
  clienteId: z.string().uuid().optional(),
  cuentaServicioId: z.string().uuid().optional(),
  estado: z.nativeEnum(EstadoCargo).optional(),
  tipoCargo: z.nativeEnum(TipoCargo).optional(),
  periodoReferencia: z.string().max(50).optional(),
  search: z.string().min(1).optional(),
});