import {
    OrdenDashboardRow,
    OrdenProximaRow,
    OrdenEstadoChartRow,
    OrdenesDashboardResponse,
    OrdenesDashboardFilters,
} from './dashboard.dto';
import { RawOrdenRow } from './ordenes-dashboard.types';
import { formatDate } from '../../../common/utils/datetime';

function formatFecha(date: Date | null): string | null {
    return date ? formatDate(date) : null;
}

function extraerResponsable(asignaciones: RawOrdenRow['asignaciones']): string {
    if (!asignaciones.length) return 'Sin asignar';
    const { nombres, apellidos } = asignaciones[0].usuario;
    return [nombres, apellidos].filter(Boolean).join(' ');
}

function esVencida(estado: RawOrdenRow['estado'], fechaProgramada: Date | null, ahora: Date): boolean {
    return (
        fechaProgramada !== null &&
        fechaProgramada < ahora &&
        estado !== 'FINALIZADA' &&
        estado !== 'CANCELADA'
    );
}

function calcularEstado(raw: RawOrdenRow, ahora: Date): OrdenDashboardRow['estado'] {
    return esVencida(raw.estado, raw.fechaProgramada, ahora) ? 'VENCIDA' : raw.estado;
}

export function toOrdenRow(raw: RawOrdenRow, ahora: Date): OrdenDashboardRow {
    return {
        id: raw.id,
        numeroOrden: raw.numeroOrden,
        titulo: raw.titulo,
        cliente: raw.cliente.nombreRazonSocial,
        servicio: raw.tipoServicio.nombre,
        estado: calcularEstado(raw, ahora),
        prioridad: raw.prioridad,
        fechaProgramada: formatFecha(raw.fechaProgramada),
        zona: raw.ubicacion.zona,
        responsable: extraerResponsable(raw.asignaciones),
    };
}

export function toProximaRow(raw: RawOrdenRow): OrdenProximaRow {
    return {
        id: raw.id,
        numeroOrden: raw.numeroOrden,
        titulo: raw.titulo,
        cliente: raw.cliente.nombreRazonSocial,
        servicio: raw.tipoServicio.nombre,
        fechaProgramada: formatFecha(raw.fechaProgramada),
        prioridad: raw.prioridad,
        responsable: extraerResponsable(raw.asignaciones),
    };
}

export function toChartRows(
    porEstado: { estado: string; cantidad: number }[],
): OrdenEstadoChartRow[] {
    const total = porEstado.reduce((acc, e) => acc + e.cantidad, 0);
    return porEstado.map((e) => ({
        estado: e.estado,
        cantidad: e.cantidad,
        porcentaje: total > 0 ? parseFloat(((e.cantidad / total) * 100).toFixed(2)) : 0,
    }));
}

export function toResponse(
    filters: OrdenesDashboardFilters,
    kpis: OrdenesDashboardResponse['kpis'],
    ordenesPorEstado: OrdenEstadoChartRow[],
    proximasAEjecutar: OrdenProximaRow[],
    data: OrdenDashboardRow[],
    pagination: OrdenesDashboardResponse['pagination'],
): OrdenesDashboardResponse {
    return {
        filters,
        kpis,
        charts: { ordenesPorEstado },
        proximasAEjecutar,
        data,
        pagination,
    };
}
