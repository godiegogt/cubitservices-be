import { EstadoOrdenServicio } from '@prisma/client';
import {
    OrdenDashboardRow,
    OrdenProximaRow,
    OrdenEstadoChartRow,
    OrdenesDashboardResponse,
    OrdenesDashboardFilters,
    OrdenClienteDto,
    OrdenServicioDto,
    OrdenResponsableDto,
} from './dashboard.dto';
import { RawOrdenRow } from './ordenes-dashboard.types';
import { formatDate } from '../../../common/utils/datetime';

function extraerCliente(cliente: RawOrdenRow['cliente']): OrdenClienteDto {
    return {
        id: cliente.id,
        nombre: cliente.nombreRazonSocial,
        telefono: cliente.telefono ?? undefined,
    };
}

function extraerServicio(tipoServicio: RawOrdenRow['tipoServicio']): OrdenServicioDto {
    return { id: tipoServicio.id, nombre: tipoServicio.nombre };
}

function extraerResponsable(asignaciones: RawOrdenRow['asignaciones']): OrdenResponsableDto {
    if (!asignaciones.length) return { id: '', nombre: 'Sin asignar' };
    const { id, nombres, apellidos } = asignaciones[0].usuario;
    return { id, nombre: [nombres, apellidos].filter(Boolean).join(' ') };
}

function esVencida(estado: RawOrdenRow['estado'], fechaProgramada: Date | null, ahora: Date): boolean {
    return (
        fechaProgramada !== null &&
        fechaProgramada < ahora &&
        estado !== EstadoOrdenServicio.FINALIZADA &&
        estado !== EstadoOrdenServicio.CANCELADA
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
        cliente: extraerCliente(raw.cliente),
        servicio: extraerServicio(raw.tipoServicio),
        estado: calcularEstado(raw, ahora),
        prioridad: raw.prioridad,
        fechaProgramada: raw.fechaProgramada ? formatDate(raw.fechaProgramada) : null,
        zona: raw.ubicacion.zona,
        responsable: extraerResponsable(raw.asignaciones),
    };
}

export function toProximaRow(raw: RawOrdenRow): OrdenProximaRow {
    return {
        id: raw.id,
        numeroOrden: raw.numeroOrden,
        titulo: raw.titulo,
        cliente: extraerCliente(raw.cliente),
        servicio: extraerServicio(raw.tipoServicio),
        fechaProgramada: raw.fechaProgramada ? formatDate(raw.fechaProgramada) : null,
        prioridad: raw.prioridad,
        responsable: extraerResponsable(raw.asignaciones),
    };
}

export function toChartRows(
    porEstado: { estado: EstadoOrdenServicio; cantidad: number }[],
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
