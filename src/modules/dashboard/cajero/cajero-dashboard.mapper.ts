import {
    DashboardCajeroKpis,
    DashboardCajeroResumen,
    DashboardCajeroResponse,
    PagoDiaRow,
} from '../common/dashboard.dto';
import { RawPagoDia } from '../common/dashboard.types';
import { toDateString } from '../common/dashboard.mapper';

function calcularVariacion(hoy: number, ayer: number): number {
    if (ayer === 0) return 0;
    return parseFloat(((hoy - ayer) / ayer * 100).toFixed(2));
}

export function toKpis(
    totalCobradoHoy: number,
    totalCobradoAyer: number,
    pagosRegistrados: number,
    pagosRegistradosAyer: number,
    pagosPendientes: number,
    pagosPendientesAyer: number,
    pagosAnulados: number,
    pagosAnuladosAyer: number,
): DashboardCajeroKpis {
    return {
        totalCobradoHoy,
        totalCobradoAyer,
        variacionTotal: calcularVariacion(totalCobradoHoy, totalCobradoAyer),
        pagosRegistrados,
        pagosRegistradosAyer,
        variacionPagos: calcularVariacion(pagosRegistrados, pagosRegistradosAyer),
        pagosPendientes,
        pagosPendientesAyer,
        variacionPendientes: calcularVariacion(pagosPendientes, pagosPendientesAyer),
        pagosAnulados,
        pagosAnuladosAyer,
        variacionAnulados: calcularVariacion(pagosAnulados, pagosAnuladosAyer),
    };
}

export function toResumen(
    cobroPorMetodo: { metodo: string; total: number }[],
): DashboardCajeroResumen {
    return { cobroPorMetodo };
}

export function toPagoDiaRow(raw: RawPagoDia): PagoDiaRow {
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