import { z } from "zod";
import { EstadoArchivo } from "@prisma/client";

export const createArchivoSchema = z.object({
    nombre: z.string().min(1).max(255),
    categoria: z.string().min(1).max(50),
    mimeType: z.string().min(1).max(120),
    storageKey: z.string().min(1),
    subidoPor: z.string(),
    estado: z.nativeEnum(EstadoArchivo).optional(),
});

export const updateArchivoEstadoSchema = z.object({
    estado: z.nativeEnum(EstadoArchivo),
});