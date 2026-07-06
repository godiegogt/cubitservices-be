import { z } from 'zod';

export const filtrosSchema = z.object({
    fechaInicio: z.string().date().optional(),
    fechaFin: z.string().date().optional(),
    tipoMovimiento: z
        .enum(['TODOS', 'CARGO', 'APLICACION_PAGO', 'MORA', 'AJUSTE', 'ANULACION'])
        .optional(),
});

export const estadoCuentaQuerySchema = filtrosSchema.extend({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
});
