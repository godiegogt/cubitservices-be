import { z } from 'zod';
import { EstadoPago } from '@prisma/client';

export const dashboardQuerySchema = z.object({
    fechaDesde: z.string().date().optional(),
    fechaHasta: z.string().date().optional(),
    clienteId: z.string().uuid().optional(),
    metodoPagoId: z.string().uuid().optional(),
    estado: z.nativeEnum(EstadoPago).optional(),
}).refine(
    (d) => !(d.fechaHasta && !d.fechaDesde),
    { message: 'fechaDesde es requerido cuando se especifica fechaHasta', path: ['fechaDesde'] },
).refine(
    (d) => !(d.fechaDesde && d.fechaHasta && d.fechaDesde > d.fechaHasta),
    { message: 'fechaDesde no puede ser mayor que fechaHasta', path: ['fechaDesde'] },
);

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
