import prisma from '../../../config/prisma';
import { EstadoOrdenServicio, PrioridadOrden, Prisma } from '@prisma/client';
import { RawOrdenRow } from './ordenes-dashboard.types';

const ORDEN_SELECT = {
    id: true,
    numeroOrden: true,
    titulo: true,
    estado: true,
    prioridad: true,
    fechaProgramada: true,
    cliente: { select: { nombreRazonSocial: true } },
    ubicacion: { select: { zona: true } },
    asignaciones: {
        where: { estado: 'ACTIVA' as const },
        take: 1,
        select: {
            usuario: { select: { nombres: true, apellidos: true } },
        },
    },
} satisfies Prisma.OrdenServicioSelect;

interface DataFilters {
    empresaId: string;
    desde: Date;
    hasta: Date;
    ahora: Date;
    estado?: EstadoOrdenServicio | 'VENCIDA';
    prioridad?: PrioridadOrden;
    clienteId?: string;
    tipoServicioId?: string;
    zona?: number;
}

function whereData(f: DataFilters): Prisma.OrdenServicioWhereInput {
    const base: Prisma.OrdenServicioWhereInput = {
        empresaId: f.empresaId,
        ...(f.prioridad && { prioridad: f.prioridad }),
        ...(f.clienteId && { clienteId: f.clienteId }),
        ...(f.tipoServicioId && { tipoServicioId: f.tipoServicioId }),
        ...(f.zona !== undefined && { ubicacion: { zona: f.zona } }),
    };

    if (f.estado === 'VENCIDA') {
        return {
            ...base,
            estado: { notIn: [EstadoOrdenServicio.FINALIZADA, EstadoOrdenServicio.CANCELADA] },
            fechaProgramada: { lt: f.ahora },
        };
    }

    return {
        ...base,
        fechaProgramada: { gte: f.desde, lte: f.hasta },
        ...(f.estado && { estado: f.estado }),
    };
}

export async function contarPendientes(empresaId: string): Promise<number> {
    return prisma.ordenServicio.count({
        where: { empresaId, estado: EstadoOrdenServicio.PENDIENTE },
    });
}

export async function contarProgramadasHoy(empresaId: string, inicioDia: Date, finDia: Date): Promise<number> {
    return prisma.ordenServicio.count({
        where: {
            empresaId,
            estado: EstadoOrdenServicio.PROGRAMADA,
            fechaProgramada: { gte: inicioDia, lte: finDia },
        },
    });
}

export async function contarEnProceso(empresaId: string): Promise<number> {
    return prisma.ordenServicio.count({
        where: { empresaId, estado: EstadoOrdenServicio.EN_PROCESO },
    });
}

export async function contarVencidas(empresaId: string, ahora: Date): Promise<number> {
    return prisma.ordenServicio.count({
        where: {
            empresaId,
            estado: { notIn: [EstadoOrdenServicio.FINALIZADA, EstadoOrdenServicio.CANCELADA] },
            fechaProgramada: { lt: ahora },
        },
    });
}

export async function getOrdenesPorEstado(
    filters: DataFilters,
): Promise<{ estado: string; cantidad: number }[]> {
    const grouped = await prisma.ordenServicio.groupBy({
        by: ['estado'],
        where: {
            empresaId: filters.empresaId,
            fechaProgramada: { gte: filters.desde, lte: filters.hasta },
        },
        _count: { _all: true },
        orderBy: { estado: 'asc' },
    });
    return grouped.map((g) => ({ estado: g.estado, cantidad: g._count._all }));
}

export async function getProximasAEjecutar(empresaId: string): Promise<RawOrdenRow[]> {
    return prisma.ordenServicio.findMany({
        where: {
            empresaId,
            estado: { in: [EstadoOrdenServicio.PENDIENTE, EstadoOrdenServicio.PROGRAMADA] },
        },
        orderBy: [{ fechaProgramada: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
        take: 5,
        select: ORDEN_SELECT,
    });
}

export async function getOrdenes(
    filters: DataFilters,
    skip: number,
    take: number,
): Promise<RawOrdenRow[]> {
    return prisma.ordenServicio.findMany({
        where: whereData(filters),
        orderBy: [{ fechaProgramada: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
        skip,
        take,
        select: ORDEN_SELECT,
    });
}

export async function contarOrdenes(filters: DataFilters): Promise<number> {
    return prisma.ordenServicio.count({ where: whereData(filters) });
}
