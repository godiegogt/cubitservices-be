import { TipoCargo } from '@prisma/client';

export const TIPOS_MOVIMIENTO_ESTADO_CUENTA = [
    'CARGO',
    'APLICACION_PAGO',
    TipoCargo.MORA,
    TipoCargo.AJUSTE,
    'ANULACION',
] as const;

export type TipoMovimientoEstadoCuenta = (typeof TIPOS_MOVIMIENTO_ESTADO_CUENTA)[number];

export const TIPO_MOVIMIENTO_PRIORIDAD: Record<TipoMovimientoEstadoCuenta, number> = {
    CARGO: 1,
    MORA: 2,
    AJUSTE: 3,
    APLICACION_PAGO: 4,
    ANULACION: 5,
};
