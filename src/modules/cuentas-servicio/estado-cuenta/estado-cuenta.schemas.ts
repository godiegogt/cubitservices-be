import { z } from 'zod';
import { TIPOS_MOVIMIENTO_ESTADO_CUENTA } from './estado-cuenta.types';

export const filtrosSchema = z.object({
    fechaInicio: z.string().date().optional(),
    fechaFin: z.string().date().optional(),
    tipoMovimiento: z.enum(['TODOS', ...TIPOS_MOVIMIENTO_ESTADO_CUENTA]).optional(),
});

export const estadoCuentaQuerySchema = filtrosSchema.extend({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
});
