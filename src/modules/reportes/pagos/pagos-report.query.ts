import { EstadoPago, Prisma } from "@prisma/client";
import prisma from "../../../config/prisma";
import { ReportePagosSummary } from "./pagos-report.dto";

const pagoReporteInclude = {
    cliente: {
    select: { id: true, codigo: true, nombreRazonSocial: true },
    },
    metodoPago: {
    select: { id: true, nombre: true },
    },
    registradoBy: {
    select: { id: true, nombres: true, apellidos: true },
    },
    aplicaciones: {
    select: {
        montoAplicado: true,
        cargo: {
        select: {
            id: true,
            concepto: true,
            tipoCargo: true,
            periodoReferencia: true,
            monto: true,
            fechaEmision: true,
            fechaVencimiento: true,
            estado: true,
        },
        },
    },
    },
} satisfies Prisma.PagoInclude;

export type PagoReporteItem = Prisma.PagoGetPayload<{
    include: typeof pagoReporteInclude;
}>;

export interface PagosReporteFilters {
    fechaInicio?: Date;
    fechaFin?: Date;
    clienteId?: string;
    codigoCliente?: string;
    nombreCliente?: string;
    zona?: number;
    metodoPagoId?: string;
    estado?: EstadoPago;
    usuarioRegistradorId?: string;
    referencia?: string;
}

const pagoReporteOrderBy: Prisma.PagoOrderByWithRelationInput[] = [
    { fechaPago: "desc" },
    { createdAt: "desc" },
];

function buildPagoWhere(
    empresaId: string,
    filters: PagosReporteFilters,
): Prisma.PagoWhereInput {
    return {
    empresaId,
    ...(filters.fechaInicio || filters.fechaFin
        ? {
            fechaPago: {
            ...(filters.fechaInicio ? { gte: filters.fechaInicio } : {}),
            ...(filters.fechaFin ? { lte: filters.fechaFin } : {}),
            },
        }
        : {}),
    ...(filters.clienteId ? { clienteId: filters.clienteId } : {}),
    ...(filters.codigoCliente || filters.nombreCliente || filters.zona !== undefined
        ? {
            cliente: {
            ...(filters.codigoCliente
                ? { codigo: { contains: filters.codigoCliente, mode: "insensitive" as const } }
                : {}),
            ...(filters.nombreCliente
                ? { nombreRazonSocial: { contains: filters.nombreCliente, mode: "insensitive" as const } }
                : {}),
            ...(filters.zona !== undefined
                ? { ubicaciones: { some: { zona: filters.zona } } }
                : {}),
            },
        }
        : {}),
    ...(filters.metodoPagoId ? { metodoPagoId: filters.metodoPagoId } : {}),
    ...(filters.estado ? { estado: filters.estado } : {}),
    ...(filters.usuarioRegistradorId
        ? { registradoPor: filters.usuarioRegistradorId }
        : {}),
    ...(filters.referencia
        ? { referencia: { contains: filters.referencia, mode: "insensitive" } }
        : {}),
    };
}

export async function queryPagosReporte(
    empresaId: string,
    filters: PagosReporteFilters,
): Promise<PagoReporteItem[]> {
    return prisma.pago.findMany({
    where: buildPagoWhere(empresaId, filters),
    include: pagoReporteInclude,
    orderBy: pagoReporteOrderBy,
    });
}

export async function queryPagosReportePage(
    empresaId: string,
    filters: PagosReporteFilters,
    skip: number,
    take: number,
): Promise<PagoReporteItem[]> {
    return prisma.pago.findMany({
    where: buildPagoWhere(empresaId, filters),
    include: pagoReporteInclude,
    orderBy: pagoReporteOrderBy,
    skip,
    take,
    });
}

export async function countPagosReporte(
    empresaId: string,
    filters: PagosReporteFilters,
): Promise<number> {
    return prisma.pago.count({ where: buildPagoWhere(empresaId, filters) });
}

export async function queryPagosReporteSummary(
    empresaId: string,
    filters: PagosReporteFilters,
): Promise<ReportePagosSummary> {
    const where = buildPagoWhere(empresaId, filters);
    const confirmadoWhere: Prisma.PagoWhereInput = {
    AND: [where, { estado: EstadoPago.CONFIRMADO }],
    };
    const anuladoWhere: Prisma.PagoWhereInput = {
    AND: [where, { estado: EstadoPago.ANULADO }],
    };

    const [cantidadPagos, pagosAnulados, montoRecibidoAgg, montoAplicadoAgg] =
    await Promise.all([
        prisma.pago.count({ where }),
        prisma.pago.count({ where: anuladoWhere }),
        prisma.pago.aggregate({
        where: confirmadoWhere,
        _sum: { montoTotal: true },
        }),
        prisma.aplicacionPago.aggregate({
        where: { pago: confirmadoWhere },
        _sum: { montoAplicado: true },
        }),
    ]);

    const totalRecibido = +(
    montoRecibidoAgg._sum.montoTotal?.toNumber() ?? 0
    ).toFixed(2);
    const totalAplicado = +(
    montoAplicadoAgg._sum.montoAplicado?.toNumber() ?? 0
    ).toFixed(2);

    return {
    totalRecibido,
    totalAplicado,
    totalDisponible: +(totalRecibido - totalAplicado).toFixed(2),
    cantidadPagos,
    pagosAnulados,
    };
}
