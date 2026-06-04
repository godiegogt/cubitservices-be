import {
    DashboardCajeroKpis,
    DashboardCajeroResumen,
    DashboardCajeroResponse,
    PagoDiaRow,
} from '../common/dashboard.dto';
import { toDateString } from '../common/dashboard.mapper';

export function toKpis(
    totalCobradoHoy: number,
    pagosRegistrados: number,
    diferenciaCaja: number,
): DashboardCajeroKpis {
    return {
    totalCobradoHoy,
    pagosRegistrados,
    diferenciaCaja,
    };
}

export function toResumen(
    cobroPorMetodo: { metodo: string; total: number }[],
): DashboardCajeroResumen {
    return { cobroPorMetodo };
}

export function toPagoDiaRow(raw: {
    id: string;
    fechaPago: Date;
    montoTotal: { toString(): string } | number | string;
    metodoPago: { nombre: string };
    cliente: { nombreRazonSocial: string };
    registradoBy: { nombres: string; apellidos: string | null };
}): PagoDiaRow {
    const usuario = [raw.registradoBy.nombres, raw.registradoBy.apellidos]
    .filter(Boolean)
    .join(' ');

    return {
    id: raw.id,
    fecha: toDateString(raw.fechaPago),
    cliente: raw.cliente.nombreRazonSocial,
    metodoPago: raw.metodoPago.nombre,
    monto: parseFloat(raw.montoTotal.toString()),
    usuario,
    };
}

export function toDashboardCajeroResponse(
    kpis: DashboardCajeroKpis,
    resumen: DashboardCajeroResumen,
    pagosDia: PagoDiaRow[],
): DashboardCajeroResponse {
    return { kpis, resumen, pagosDia };
}