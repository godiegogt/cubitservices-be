import { DashboardOrdenesKpis, DashboardOrdenesResponse, OrdenRow } from '../common/dashboard.dto';
import { RawOrdenRow } from '../common/dashboard.types';
import { toDateString } from '../common/dashboard.mapper';

export function toOrdenRow(raw: RawOrdenRow): OrdenRow {
    return {
        id: raw.id,
        numeroOrden: raw.numeroOrden,
        titulo: raw.titulo,
        cliente: raw.cliente.nombreRazonSocial,
        estado: raw.estado,
        prioridad: raw.prioridad,
        fechaProgramada: raw.fechaProgramada ? toDateString(raw.fechaProgramada) : null,
        zona: raw.ubicacion.zona,
    };
}

export function toKpisOrdenes(
    porEstado: { estado: string; cantidad: number }[],
): DashboardOrdenesKpis {
    const total = porEstado.reduce((acc, e) => acc + e.cantidad, 0);
    return { total, porEstado };
}

export function toDashboardOrdenesResponse(
    kpis: DashboardOrdenesKpis,
    ordenes: OrdenRow[],
): DashboardOrdenesResponse {
    return { kpis, ordenes };
}
