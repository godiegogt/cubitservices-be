import { EstadoAsignacionOrden } from "@prisma/client";
import { z } from "zod";

export const createAsignacionSchema = z.object({
  usuarioId: z.string().uuid(),
  rolEnOrden: z.string().min(1).max(50).default("ENCARGADO"),
});

export const updateAsignacionEstadoSchema = z.object({
  estado: z.nativeEnum(EstadoAsignacionOrden),
});
