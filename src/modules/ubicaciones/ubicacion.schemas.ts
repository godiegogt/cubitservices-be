import { z } from "zod";
import { EstadoUbicacion } from "@prisma/client";

export const createUbicacionSchema = z.object({
    nombre: z.string().min(1).max(120),
    direccion: z.string().min(1),
    referencia: z.string().optional(),
    latitud: z.number().nullable().optional(),
    longitud: z.number().nullable().optional(),
    esPrincipal: z.boolean().optional().default(false),
});

export const updateUbicacionSchema = z.object({
    nombre: z.string().min(1).max(120).optional(),
    direccion: z.string().min(1).optional(),
    referencia: z.string().optional(),
    latitud: z.number().nullable().optional(),
    longitud: z.number().nullable().optional(),
    esPrincipal: z.boolean().optional(),
});

export const updateUbicacionEstadoSchema = z.object({
    estado: z.nativeEnum(EstadoUbicacion),
});