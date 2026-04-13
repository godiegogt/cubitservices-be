import { z } from "zod";
import { EstadoRegistroBasico } from "@prisma/client";

export const createRoleSchema = z.object({
  nombre: z.string().min(1).max(80),
  descripcion: z.string().max(500).optional(),
});

export const updateRoleSchema = z.object({
  nombre: z.string().min(1).max(80).optional(),
  descripcion: z.string().max(500).optional(),
});

export const updateRoleStatusSchema = z.object({
  estado: z.nativeEnum(EstadoRegistroBasico),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateRoleStatusInput = z.infer<typeof updateRoleStatusSchema>;