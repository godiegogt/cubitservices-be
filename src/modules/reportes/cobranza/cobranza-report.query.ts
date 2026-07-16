import { EstadoCargo, Prisma } from "@prisma/client";
import prisma from "../../../config/prisma";
import { CobranzaReportFilters } from "./cobranza-report.dto";

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
    filters: CobranzaReportFilters,
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
    filters: CobranzaReportFilters,
): Prisma.CuentaServicioWhereInput | undefined {
    if (
    !filters.estadoServicio &&
    !filters.tipoServicioId &&
    filters.zona === undefined
    ) {
    return undefined;
    }

    return {
    ...(filters.estadoServicio ? { estado: filters.estadoServicio } : {}),
    ...(filters.tipoServicioId
        ? { tipoServicioId: filters.tipoServicioId }
        : {}),
    ...(filters.zona !== undefined
        ? { ubicacion: { zona: filters.zona } }
        : {}),
    };
}

function buildCargoWhere(
    empresaId: string,
    filters: CobranzaReportFilters,
): Prisma.CargoWhereInput {
    const estados = filters.estadoCargo?.length
    ? filters.estadoCargo
    : ESTADOS_CARGO_PENDIENTES;
    const clienteFilter = buildClienteFilter(filters);
    const cuentaServicioFilter = buildCuentaServicioFilter(filters);

    return {
    empresaId,
    estado: { in: estados },
    ...(clienteFilter ? { cliente: clienteFilter } : {}),
    ...(cuentaServicioFilter ? { cuentaServicio: cuentaServicioFilter } : {}),
    };
}

export async function getCobranzaRows(
    empresaId: string,
    filters: CobranzaReportFilters,
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
    filters: CobranzaReportFilters,
): Promise<CargoReporteItem[]> {
    return prisma.cargo.findMany({
        where: buildCargoWhere(empresaId, filters),
        include: cargoReporteInclude,
        orderBy: cargoReporteOrderBy,
    });
}

export async function countCobranzaRows(
    empresaId: string,
    filters: CobranzaReportFilters,
): Promise<number> {
    return prisma.cargo.count({ where: buildCargoWhere(empresaId, filters) });
}

export async function getTotalPendiente(
    empresaId: string,
    filters: CobranzaReportFilters,
): Promise<number> {
    const result = await prisma.cargo.aggregate({
        where: buildCargoWhere(empresaId, filters),
        _sum: { saldo: true },
    });

    return +(result._sum.saldo?.toNumber() ?? 0).toFixed(2);
}

export async function getCuentasPendientes(
    empresaId: string,
    filters: CobranzaReportFilters,
): Promise<number> {
    const clienteFilter = buildClienteFilter(filters);
    const cuentaServicioFilter = buildCuentaServicioFilter(filters);

    const distinct = await prisma.cargo.findMany({
    where: {
        empresaId,
        estado: { in: ESTADOS_CARGO_PENDIENTES },
        ...(clienteFilter ? { cliente: clienteFilter } : {}),
        ...(cuentaServicioFilter ? { cuentaServicio: cuentaServicioFilter } : {}),
    },
    distinct: ["cuentaServicioId"],
    select: { cuentaServicioId: true },
    });

    return distinct.length;
}
