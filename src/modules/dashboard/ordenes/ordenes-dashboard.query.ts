import prisma from "../../../config/prisma";
import { EstadoOrdenServicio } from "@prisma/client";
import { RawOrdenRow } from "../common/dashboard.types";

const PROXIMAS_ESTADOS = [EstadoOrdenServicio.PENDIENTE, EstadoOrdenServicio.PROGRAMADA];

export interface FiltrosOrdenes {
    desde: Date;
    hasta: Date;
    zona?: number;
    proximasAEjecutar?: boolean;
}

function buildWhere({ desde, hasta, zona, proximasAEjecutar }: FiltrosOrdenes) {
    return {
        fechaProgramada: { gte: desde, lte: hasta },
        ...(zona !== undefined ? { ubicacion: { zona } } : {}),
        ...(proximasAEjecutar ? { estado: { in: PROXIMAS_ESTADOS } } : {}),
    };
}

export async function getOrdenes(filtros: FiltrosOrdenes): Promise<RawOrdenRow[]> {
    return prisma.ordenServicio.findMany({
        where: buildWhere(filtros),
        orderBy: { fechaProgramada: 'asc' },
        select: {
            id: true,
            numeroOrden: true,
            titulo: true,
            estado: true,
            prioridad: true,
            fechaProgramada: true,
            cliente: { select: { nombreRazonSocial: true } },
            ubicacion: { select: { zona: true } },
        },
    });
}

export async function getOrdenesPorEstado(
    filtros: FiltrosOrdenes,
): Promise<{ estado: string; cantidad: number }[]> {
    const grouped = await prisma.ordenServicio.groupBy({
        by: ['estado'],
        where: buildWhere(filtros),
        _count: { _all: true },
        orderBy: { estado: 'asc' },
    });
    return grouped.map(g => ({ estado: g.estado, cantidad: g._count._all }));
}
