import {
  EstadoOrdenServicio,
  OrigenOrden,
  PrioridadOrden,
} from "@prisma/client";
import { z } from "zod";

const dateTimeStringSchema = z.string().datetime();

export const createOrdenSchema = z.object({
  cuentaServicioId: z.string().uuid(),
  ubicacionId: z.string().uuid(),
  tipoServicioId: z.string().uuid(),
  titulo: z.string().min(1).max(180),
  descripcion: z.string().optional(),
  origen: z.nativeEnum(OrigenOrden),
  prioridad: z.nativeEnum(PrioridadOrden),
  fechaProgramada: dateTimeStringSchema.optional(),
  requiereEvidenciaFinal: z.boolean().optional(),
  observacionesGenerales: z.string().optional(),
});

export const updateOrdenSchema = z.object({
  titulo: z.string().min(1).max(180).optional(),
  descripcion: z.string().optional(),
  ubicacionId: z.string().uuid().optional(),
  tipoServicioId: z.string().uuid().optional(),
  origen: z.nativeEnum(OrigenOrden).optional(),
  prioridad: z.nativeEnum(PrioridadOrden).optional(),
  fechaProgramada: dateTimeStringSchema.optional(),
  requiereEvidenciaFinal: z.boolean().optional(),
  observacionesGenerales: z.string().optional(),
});

export const updateOrdenStatusSchema = z.object({
  estado: z.nativeEnum(EstadoOrdenServicio),
  motivo: z.string().max(500).optional(),
});

export const listOrdenesQuerySchema = z.object({
  estado: z.nativeEnum(EstadoOrdenServicio).optional(),
  clienteId: z.string().uuid().optional(),
  cuentaServicioId: z.string().uuid().optional(),
  tipoServicioId: z.string().uuid().optional(),
  prioridad: z.nativeEnum(PrioridadOrden).optional(),
  origen: z.nativeEnum(OrigenOrden).optional(),
  search: z.string().min(1).optional(),
});
