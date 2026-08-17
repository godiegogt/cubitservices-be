import { EstadoCargo, EstadoCuentaServicio, Prisma } from "@prisma/client";
import prisma from "../../../config/prisma";

export interface CobranzaQueryFilters {
    fechaInicio?: Date;
    fechaFin?: Date;
    codigoCliente?: string;
    nombreCliente?: string;
    estadoCargo?: EstadoCargo[];
    estadoServicio?: EstadoCuentaServicio;
    tipoServicioId?: string;
    zona?: string;
    aldea?: string;
}

const ESTADOS_CARGO_PENDIENTES: EstadoCargo[] = [
    EstadoCargo.PENDIENTE,
    EstadoCargo.PARCIAL,
    EstadoCargo.VENCIDO,
];

const cargoReporteInclude = {
    cliente: {
    select: { id: true, nombreRazonSocial: true },
    },
    cuentaServicio: {
    select: {
        id: true,
        nombre: true,
        estado: true,
        tipoServicio: { select: { nombre: true } },
        ubicacion: {
        select: {
            direccion: true,
        },
        },
    },
    },
} satisfies Prisma.CargoInclude;

export type CargoReporteItem = Prisma.CargoGetPayload<{
    include: typeof cargoReporteInclude;
}>;

const cargoReporteOrderBy: Prisma.CargoOrderByWithRelationInput[] = [
    { createdAt: "desc" },
];

function buildClienteFilter(
    filters: CobranzaQueryFilters,
): Prisma.ClienteWhereInput | undefined {
    if (!filters.codigoCliente && !filters.nombreCliente) return undefined;

    return {
    ...(filters.codigoCliente
        ? { codigo: { contains: filters.codigoCliente, mode: "insensitive" as const } }
        : {}),
    ...(filters.nombreCliente
        ? {
            nombreRazonSocial: {
            contains: filters.nombreCliente,
            mode: "insensitive" as const,
            },
        }
        : {}),
    };
}

function buildCuentaServicioFilter(
    filters: CobranzaQueryFilters,
): Prisma.CuentaServicioWhereInput | undefined {
    if (
    !filters.estadoServicio &&
    !filters.tipoServicioId &&
    filters.zona === undefined &&
    filters.aldea === undefined
    ) {
    return undefined;
    }

    return {
    ...(filters.estadoServicio ? { estado: filters.estadoServicio } : {}),
    ...(filters.tipoServicioId
        ? { tipoServicioId: filters.tipoServicioId }
        : {}),
    ...((filters.zona !== undefined || filters.aldea !== undefined)
        ? {
            ubicacion: {
                ...(filters.zona !== undefined && { zona: { equals: filters.zona, mode: "insensitive" as const } }),
                ...(filters.aldea !== undefined && { aldea: { equals: filters.aldea, mode: "insensitive" as const } }),
            },
        }
        : {}),
    };
}

function buildCargoWhere(
    empresaId: string,
    filters: CobranzaQueryFilters,
): Prisma.CargoWhereInput {
    const estados = filters.estadoCargo?.length
    ? filters.estadoCargo
    : ESTADOS_CARGO_PENDIENTES;
    const clienteFilter = buildClienteFilter(filters);
    const cuentaServicioFilter = buildCuentaServicioFilter(filters);

    return {
    empresaId,
    estado: { in: estados },
    ...(filters.fechaInicio || filters.fechaFin
        ? {
            fechaEmision: {
            ...(filters.fechaInicio ? { gte: filters.fechaInicio } : {}),
            ...(filters.fechaFin ? { lte: filters.fechaFin } : {}),
            },
        }
        : {}),
    ...(clienteFilter ? { cliente: clienteFilter } : {}),
    ...(cuentaServicioFilter ? { cuentaServicio: cuentaServicioFilter } : {}),
    };
}

export async function getCobranzaRows(
    empresaId: string,
    filters: CobranzaQueryFilters,
    skip: number,
    take: number,
): Promise<CargoReporteItem[]> {
    return prisma.cargo.findMany({
        where: buildCargoWhere(empresaId, filters),
        include: cargoReporteInclude,
        orderBy: cargoReporteOrderBy,
        skip,
        take,
    });
}

export async function getCobranzaRowsAll(
    empresaId: string,
    filters: CobranzaQueryFilters,
): Promise<CargoReporteItem[]> {
    return prisma.cargo.findMany({
        where: buildCargoWhere(empresaId, filters),
        include: cargoReporteInclude,
        orderBy: cargoReporteOrderBy,
    });
}

export async function countCobranzaRows(
    empresaId: string,
    filters: CobranzaQueryFilters,
): Promise<number> {
    return prisma.cargo.count({ where: buildCargoWhere(empresaId, filters) });
}

export async function getTotalPendiente(
    empresaId: string,
    filters: CobranzaQueryFilters,
): Promise<number> {
    const result = await prisma.cargo.aggregate({
        where: buildCargoWhere(empresaId, filters),
        _sum: { saldo: true },
    });

    return +(result._sum.saldo?.toNumber() ?? 0).toFixed(2);
}

export async function getCuentasPendientes(
    empresaId: string,
    filters: CobranzaQueryFilters,
): Promise<number> {
    const clienteFilter = buildClienteFilter(filters);
    const cuentaServicioFilter = buildCuentaServicioFilter(filters);

    const distinct = await prisma.cargo.findMany({
    where: {
        empresaId,
        estado: { in: ESTADOS_CARGO_PENDIENTES },
        ...(filters.fechaInicio || filters.fechaFin
        ? {
            fechaEmision: {
                ...(filters.fechaInicio ? { gte: filters.fechaInicio } : {}),
                ...(filters.fechaFin ? { lte: filters.fechaFin } : {}),
            },
            }
        : {}),
        ...(clienteFilter ? { cliente: clienteFilter } : {}),
        ...(cuentaServicioFilter ? { cuentaServicio: cuentaServicioFilter } : {}),
    },
    distinct: ["cuentaServicioId"],
    select: { cuentaServicioId: true },
    });

    return distinct.length;
}
