export type TipoMovimientoEstadoCuenta =
    | 'CARGO'
    | 'APLICACION_PAGO'
    | 'MORA'
    | 'AJUSTE'
    | 'ANULACION';

export const TIPO_MOVIMIENTO_PRIORIDAD: Record<TipoMovimientoEstadoCuenta, number> = {
    CARGO: 1,
    MORA: 2,
    AJUSTE: 3,
    APLICACION_PAGO: 4,
    ANULACION: 5,
};
