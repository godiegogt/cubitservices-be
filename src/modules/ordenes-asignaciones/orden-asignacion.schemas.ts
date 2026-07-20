import { EstadoAsignacionOrden, RolEnOrden } from "@prisma/client";
import { z } from "zod";

export const createAsignacionSchema = z.object({
  usuarioId: z.string().uuid(),
  rolEnOrden: z.nativeEnum(RolEnOrden),
});

export const updateAsignacionEstadoSchema = z.object({
  estado: z.nativeEnum(EstadoAsignacionOrden),
});
