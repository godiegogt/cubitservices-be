import { z } from "zod";
import { EstadoRegistroBasico } from "@prisma/client";

export const createMetodoPagoSchema = z.object({
  nombre: z.string().min(1).max(80),
  descripcion: z.string().optional(),
});

export const updateMetodoPagoSchema = z.object({
  nombre: z.string().min(1).max(80).optional(),
  descripcion: z.string().optional(),
});

export const updateMetodoPagoStatusSchema = z.object({
  estado: z.nativeEnum(EstadoRegistroBasico),
});