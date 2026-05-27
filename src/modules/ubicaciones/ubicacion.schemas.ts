import { z } from "zod";
import { EstadoUbicacion } from "@prisma/client";

export const createUbicacionSchema = z.object({
    nombre: z.string().min(1).max(120),
    direccion: z.string().min(1),
    referencia: z.string().optional(),
    latitud: z.number().nullable().optional(),
    longitud: z.number().nullable().optional(),
    esPrincipal: z.boolean().optional().default(false),
    zona: z.number().nullable().optional(),
    calle: z.string().nullable().optional(),
    avenida: z.string().nullable().optional(),
    numeroCasa: z.number().nullable().optional(),
});

export const updateUbicacionSchema = z.object({
    nombre: z.string().min(1).max(120).optional(),
    direccion: z.string().min(1).optional(),
    referencia: z.string().optional(),
    latitud: z.number().nullable().optional(),
    longitud: z.number().nullable().optional(),
    esPrincipal: z.boolean().optional(),
    zona: z.number().nullable().optional(),
    calle: z.string().nullable().optional(),
    avenida: z.string().nullable().optional(),
    numeroCasa: z.number().nullable().optional(),
});

export const updateUbicacionEstadoSchema = z.object({
    estado: z.nativeEnum(EstadoUbicacion),
});