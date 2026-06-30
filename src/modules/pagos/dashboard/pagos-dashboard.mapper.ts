import {
    PagoDashboardRow,
    PagoDashboardResponse,
    PagoDashboardFilters,
} from './pagos-dashboard.dto';
import { RawPagoReciente } from './pagos-dashboard.types';
import { formatDate, formatTime } from "../../../common/utils/datetime";

export function toKpis(
    totalCobrado: number,
    pagosRegistrados: number,
    pagosPendientes: number,
    pagosAnulados: number,
): PagoDashboardResponse['kpis'] {
    return { totalCobrado, pagosRegistrados, pagosPendientes, pagosAnulados };
}

export function toPagoRow(raw: RawPagoReciente): PagoDashboardRow {
    return {
        id: raw.id,
        fecha: formatDate(raw.fechaRegistro),
        hora: formatTime(raw.fechaRegistro),
        cliente: raw.cliente.nombreRazonSocial,
        metodoPago: raw.metodoPago.nombre,
        monto: parseFloat(raw.montoTotal.toString()),
        referencia: raw.referencia,
        estado: raw.estado,
        registradoPor: [raw.registradoBy.nombres, raw.registradoBy.apellidos]
            .filter(Boolean)
            .join(' '),
    };
}

export function toResponse(
    filters: PagoDashboardFilters,
    kpis: PagoDashboardResponse['kpis'],
    pagosRecientes: PagoDashboardRow[],
): PagoDashboardResponse {
    return { filters, kpis, pagosRecientes };
}
