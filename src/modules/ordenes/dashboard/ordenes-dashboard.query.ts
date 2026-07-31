import prisma from '../../../config/prisma';
import { EstadoAsignacionOrden, EstadoOrdenServicio, PrioridadOrden, Prisma, RolEnOrden } from '@prisma/client';
import { RawOrdenRow } from './ordenes-dashboard.types';

const ORDEN_SELECT = {
    id: true,
    numeroOrden: true,
    titulo: true,
    estado: true,
    prioridad: true,
    fechaProgramada: true,
    cliente: { select: { id: true, nombreRazonSocial: true, telefono: true } },
    tipoServicio: { select: { id: true, nombre: true } },
    ubicacion: { select: { zona: true } },
    asignaciones: {
        where: { estado: EstadoAsignacionOrden.ACTIVA },
        take: 1,
        select: {
            usuario: { select: { id: true, nombres: true, apellidos: true } },
        },
    },
} satisfies Prisma.OrdenServicioSelect;

interface DataFilters {
    empresaId: string;
    desde: Date;
    hasta: Date;
    ahora: Date;
    desdeExplicita?: Date;
    hastaExplicita?: Date;
    estado?: EstadoOrdenServicio | 'VENCIDA';
    prioridad?: PrioridadOrden;
    clienteId?: string;
    tipoServicioId?: string;
    responsableId?: string;
    search?: string;
    zona?: number;
}

function whereData(f: DataFilters): Prisma.OrdenServicioWhereInput {
    const base: Prisma.OrdenServicioWhereInput = {
        empresaId: f.empresaId,
        ...(f.prioridad && { prioridad: f.prioridad }),
        ...(f.clienteId && { clienteId: f.clienteId }),
        ...(f.tipoServicioId && { tipoServicioId: f.tipoServicioId }),
        ...(f.zona !== undefined && { ubicacion: { zona: f.zona } }),
        ...(f.responsableId && {
            asignaciones: {
                some: {
                    estado: EstadoAsignacionOrden.ACTIVA,
                    usuarioId: f.responsableId,
                    rolEnOrden: RolEnOrden.TECNICO,
                },
            },
        }),
        ...(f.search && {
            OR: [
                { numeroOrden: { contains: f.search, mode: 'insensitive' } },
                { cliente: { nombreRazonSocial: { contains: f.search, mode: 'insensitive' } } },
                { cliente: { telefono: { contains: f.search, mode: 'insensitive' } } },
                { tipoServicio: { nombre: { contains: f.search, mode: 'insensitive' } } },
            ],
        }),
    };

    if (f.estado === 'VENCIDA') {
        return {
            ...base,
            estado: { notIn: [EstadoOrdenServicio.FINALIZADA, EstadoOrdenServicio.CANCELADA] },
            fechaProgramada: {
                ...(f.desdeExplicita && { gte: f.desdeExplicita }),
                ...(f.hastaExplicita && { lte: f.hastaExplicita }),
                lt: f.ahora,
            },
        };
    }
    
    const incluyePendientesSinFecha = !f.estado || f.estado === EstadoOrdenServicio.PENDIENTE;

    return {
        ...base,
        AND: [
            {
                OR: [
                    { fechaProgramada: { gte: f.desde, lte: f.hasta } },
                    ...(incluyePendientesSinFecha
                        ? [{ estado: EstadoOrdenServicio.PENDIENTE, fechaProgramada: null } as Prisma.OrdenServicioWhereInput]
                        : []),
                ],
            },
        ],
        ...(f.estado && { estado: f.estado }),
    };
}

interface KpiFilters {
    empresaId: string;
    desde: Date;
    hasta: Date;
    ahora: Date;
    desdeExplicita?: Date;
    hastaExplicita?: Date;
    zona?: number;
}

function whereKpi(f: KpiFilters, estado: Prisma.OrdenServicioWhereInput['estado']): Prisma.OrdenServicioWhereInput {
    return {
        empresaId: f.empresaId,
        estado,
        fechaProgramada: { gte: f.desde, lte: f.hasta },
        ...(f.zona !== undefined && { ubicacion: { zona: f.zona } }),
    };
}

export async function contarPendientes(f: KpiFilters): Promise<number> {
    return prisma.ordenServicio.count({
        where: {
            ...whereKpi(f, EstadoOrdenServicio.PENDIENTE),
            fechaProgramada: null,
        },
    });
}

export async function contarProgramadas(f: KpiFilters): Promise<number> {
    return prisma.ordenServicio.count({
        where: whereKpi(f, EstadoOrdenServicio.PROGRAMADA),
    });
}

export async function contarEnProceso(f: KpiFilters): Promise<number> {
    return prisma.ordenServicio.count({
        where: whereKpi(f, EstadoOrdenServicio.EN_PROCESO),
    });
}

export async function contarVencidas(f: KpiFilters): Promise<number> {
    return prisma.ordenServicio.count({
        where: {
            empresaId: f.empresaId,
            estado: { notIn: [EstadoOrdenServicio.FINALIZADA, EstadoOrdenServicio.CANCELADA] },
            fechaProgramada: {
                ...(f.desdeExplicita && { gte: f.desdeExplicita }),
                ...(f.hastaExplicita && { lte: f.hastaExplicita }),
                lt: f.ahora,
            },
            ...(f.zona !== undefined && { ubicacion: { zona: f.zona } }),
        },
    });
}

export async function getOrdenesPorEstado(
    filters: DataFilters,
): Promise<{ estado: EstadoOrdenServicio; cantidad: number }[]> {
    const [grouped, pendientes] = await Promise.all([
        prisma.ordenServicio.groupBy({
            by: ['estado'],
            where: {
                empresaId: filters.empresaId,
                estado: { not: EstadoOrdenServicio.PENDIENTE },
                fechaProgramada: { gte: filters.desde, lte: filters.hasta },
                ...(filters.zona !== undefined && { ubicacion: { zona: filters.zona } }),
            },
            _count: { _all: true },
            orderBy: { estado: 'asc' },
        }),
        contarPendientes(filters),
    ]);
    const resultado = grouped.map((g) => ({ estado: g.estado, cantidad: g._count._all }));
    if (pendientes > 0) {
        resultado.push({ estado: EstadoOrdenServicio.PENDIENTE, cantidad: pendientes });
    }
    return resultado.sort((a, b) => a.estado.localeCompare(b.estado));
}

export async function getProximasAEjecutar(filters: {
    empresaId: string;
    zona?: number;
}): Promise<RawOrdenRow[]> {
    return prisma.ordenServicio.findMany({
        where: {
            empresaId: filters.empresaId,
            estado: EstadoOrdenServicio.PROGRAMADA,
            ...(filters.zona !== undefined && { ubicacion: { zona: filters.zona } }),
        },
        orderBy: [{ fechaProgramada: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
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
