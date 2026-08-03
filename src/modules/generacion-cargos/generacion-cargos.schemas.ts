import { EstadoEjecucionGeneracion, ResultadoGeneracion } from "@prisma/client";
import { z } from "zod";

const periodoSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
  message: "El periodo debe tener el formato YYYY-MM",
});

export const generarCargosSchema = z
  .object({
    periodo: periodoSchema,
  })
  .strict();

export const previewQuerySchema = z.object({
  periodo: periodoSchema,
});

export const getEjecucionesQuerySchema = z.object({
  estado: z.nativeEnum(EstadoEjecucionGeneracion).optional(),
  periodo: periodoSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getDetallesQuerySchema = z.object({
  resultado: z.nativeEnum(ResultadoGeneracion).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getCargosGeneradosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
