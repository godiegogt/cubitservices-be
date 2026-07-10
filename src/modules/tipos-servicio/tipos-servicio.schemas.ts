import { z } from "zod";
import { EstadoRegistroBasico, CategoriaServicio } from "@prisma/client";

export const createTipoServicioSchema = z.object({
  nombre: z.string().min(1).max(120),
  descripcion: z.string().optional(),
  precioBase: z.number().min(0),
  categoriaServicio: z.nativeEnum(CategoriaServicio),
});

export const updateTipoServicioSchema = z.object({
  nombre: z.string().min(1).max(120).optional(),
  descripcion: z.string().optional(),
  precioBase: z.number().min(0).optional(),
  categoriaServicio: z.nativeEnum(CategoriaServicio).optional(),
});

export const updateTipoServicioStatusSchema = z.object({
  estado: z.nativeEnum(EstadoRegistroBasico),
});