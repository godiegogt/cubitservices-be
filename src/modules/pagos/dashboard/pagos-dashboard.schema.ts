import { z } from 'zod';
import { EstadoPago } from '@prisma/client';

export const dashboardQuerySchema = z.object({
    clienteId: z.string().uuid().optional(),
    metodoPagoId: z.string().uuid().optional(),
    estado: z.nativeEnum(EstadoPago).optional(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
