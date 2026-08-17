import {
    EstadoOrdenServicio,
    EstadoAsignacionOrden,
    Prisma,
} from "@prisma/client";
import prisma from "../../../config/prisma";
import { startOfDay, endOfDay } from "../../../common/utils/datetime";
import { OrdenesReportFilters } from "./ordenes-report.dto";

const ordenReportInclude = {
    cliente: {
        select: { id: true, codigo: true, nombreRazonSocial: true },
    },
    tipoServicio: {
        select: { id: true, nombre: true },
    },
    ubicacion: {
        select: {
            direccion: true,
        },
    },
    asignaciones: {
        where: { estado: EstadoAsignacionOrden.ACTIVA },
        select: {
            rolEnOrden: true,
            usuario: {
                select: { id: true, nombres: true, apellidos: true },
            },
        },
    },
} satisfies Prisma.OrdenServicioInclude;

function buildBaseWhere(
    empresaId: string,
    filters: OrdenesReportFilters
): Prisma.OrdenServicioWhereInput {
    const where: Prisma.OrdenServicioWhereInput = { empresaId };

    if (filters.tipoServicioId) {
        where.tipoServicioId = filters.tipoServicioId;
    }

    if (filters.tecnicoId) {
        where.asignaciones = {
            some: {
                usuarioId: filters.tecnicoId,
                estado: EstadoAsignacionOrden.ACTIVA,
            },
        };
    }

    if (filters.zonaId !== undefined) {
        where.ubicacion = { zona: { equals: filters.zonaId, mode: "insensitive" } };
    }

    if (filters.fechaInicio || filters.fechaFin) {
        where.fechaProgramada = {
            ...(filters.fechaInicio && { gte: startOfDay(filters.fechaInicio) }),
            ...(filters.fechaFin && { lte: endOfDay(filters.fechaFin) }),
        };
    }

    if (filters.search) {
        where.OR = [
            {
                numeroOrden: {
                    contains: filters.search,
                    mode: "insensitive",
                },
            },
            {
                titulo: {
                    contains: filters.search,
                    mode: "insensitive",
                },
            },
            {
                cliente: {
                    nombreRazonSocial: {
                        contains: filters.search,
                        mode: "insensitive",
                    },
                },
            },
        ];
    }

    return where;
}

export async function queryOrdenesReport(
    empresaId: string,
    filters: OrdenesReportFilters
) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize;
    const skip = pageSize ? (page - 1) * pageSize : undefined;

    const baseWhere = buildBaseWhere(empresaId, filters);

    const filteredWhere: Prisma.OrdenServicioWhereInput = {
        ...baseWhere,
        ...(filters.estado && {
            estado: filters.estado,
        }),
    };

    const [pendientes, enProceso, completadas, vencidas, data, total] =
        await Promise.all([
            prisma.ordenServicio.count({
                where: { AND: [filteredWhere, { estado: EstadoOrdenServicio.PENDIENTE }] },
            }),
            prisma.ordenServicio.count({
                where: { AND: [filteredWhere, { estado: EstadoOrdenServicio.EN_PROCESO }] },
            }),
            prisma.ordenServicio.count({
                where: { AND: [filteredWhere, { estado: EstadoOrdenServicio.FINALIZADA }] },
            }),
            prisma.ordenServicio.count({
                where: {
                    AND: [
                        filteredWhere,
                        { fechaProgramada: { lt: new Date() } },
                        {
                            estado: {
                                notIn: [
                                    EstadoOrdenServicio.FINALIZADA,
                                    EstadoOrdenServicio.CANCELADA,
                                ],
                            },
                        },
                    ],
                },
            }),
            prisma.ordenServicio.findMany({
                where: filteredWhere,
                include: ordenReportInclude,
                orderBy: [{ createdAt: "desc" }, { numeroOrden: "desc" }],
                ...(skip !== undefined && { skip }),
                ...(pageSize !== undefined && { take: pageSize }),
            }),
            prisma.ordenServicio.count({ where: filteredWhere }),
        ]);

    return {
        summary: { totalOrdenes: total, pendientes, enProceso, completadas, vencidas },
        data,
        pagination: pageSize
            ? {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize) || 1,
                }
            : {
                    page: 1,
                    pageSize: total,
                    total,
                    totalPages: 1,
                },
    };
}

export type OrdenReportRaw = Awaited<
    ReturnType<typeof queryOrdenesReport>
>["data"][number];
