import { z } from "zod";
import { EstadoUsuario } from "@prisma/client";

export const createUserSchema = z.object({
  nombres: z.string().min(1),
  apellidos: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  telefono: z.string().optional(),
  rolId: z.string().uuid(),
});

export const updateUserSchema = z.object({
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  telefono: z.string().optional(),
  rolId: z.string().uuid().optional(),
});

export const updateUserStatusSchema = z.object({
  estado: z.nativeEnum(EstadoUsuario),
});