import { z } from 'zod';
import { EstadoOrdenServicio, PrioridadOrden } from '@prisma/client';

export const ordenesDashboardQuerySchema = z.object({
    fechaDesde: z.string().date().optional(),
    fechaHasta: z.string().date().optional(),
    estado: z.union([z.nativeEnum(EstadoOrdenServicio), z.literal('VENCIDA')]).optional(),
    prioridad: z.nativeEnum(PrioridadOrden).optional(),
    clienteId: z.string().uuid().optional(),
    tipoServicioId: z.string().uuid().optional(),
    zona: z.coerce.number().int().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
}).refine(
    (d) => !(d.fechaHasta && !d.fechaDesde),
    { message: 'fechaDesde es requerido cuando se especifica fechaHasta', path: ['fechaDesde'] },
).refine(
    (d) => !(d.fechaDesde && d.fechaHasta && d.fechaDesde > d.fechaHasta),
    { message: 'fechaDesde no puede ser mayor que fechaHasta', path: ['fechaDesde'] },
);

export type OrdenesDashboardQuery = z.infer<typeof ordenesDashboardQuerySchema>;
