import { z } from "zod";

export const createObservacionSchema = z.object({
  texto: z.string().min(1).max(1000),
  creadoPor: z.string().min(1).max(180).optional(),
});

export const updateObservacionSchema = z.object({
  texto: z.string().min(1).max(1000),
});

export type CreateObservacionDto = z.infer<typeof createObservacionSchema>;
export type UpdateObservacionDto = z.infer<typeof updateObservacionSchema>;

export interface Observacion {
    id: string;
    texto: string;
    creadoPor?: string;
    creadoEn: string;
    actualizadoEn?: string;
}