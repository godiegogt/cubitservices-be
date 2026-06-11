import {
    EstadoOrdenServicio,
    EstadoAsignacionOrden,
    Prisma,
} from "@prisma/client";
import prisma from "../../../config/prisma";
import { OrdenesReportFilters } from "./ordenes-report.dto";

const ordenReportInclude = {
    cliente: {
        select: { id: true, codigo: true, nombreRazonSocial: true },
    },
    tipoServicio: {
        select: { id: true, nombre: true },
    },
    ubicacion: {
        select: { id: true, nombre: true, zona: true },
    },
    asignaciones: {
        where: { estado: EstadoAsignacionOrden.ACTIVA },
        select: {
            usuario: {
                select: { id: true, nombres: true, apellidos: true },
            },
        },
        take: 1,
    },
} satisfies Prisma.OrdenServicioInclude;

function buildBaseWhere(
    empresaId: string,
    filters: OrdenesReportFilters
): Prisma.OrdenServicioWhereInput {
    const where: Prisma.OrdenServicioWhereInput = { empresaId };

    if (filters.tipoOrden) {
        where.tipoServicioId = filters.tipoOrden;
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
        where.ubicacion = { zona: filters.zonaId };
    }

    if (filters.fechaInicio || filters.fechaFin) {
        where.fechaProgramada = {
            ...(filters.fechaInicio && { gte: new Date(filters.fechaInicio) }),
            ...(filters.fechaFin && {
                lte: new Date(`${filters.fechaFin}T23:59:59.999Z`),
            }),
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
            estado: filters.estado as EstadoOrdenServicio,
        }),
    };

    const [totalOrdenes, pendientes, enProceso, completadas, data, total] =
        await Promise.all([
            prisma.ordenServicio.count({ where: baseWhere }),
            prisma.ordenServicio.count({
                where: { ...baseWhere, estado: EstadoOrdenServicio.PENDIENTE },
            }),
            prisma.ordenServicio.count({
                where: { ...baseWhere, estado: EstadoOrdenServicio.EN_PROCESO },
            }),
            prisma.ordenServicio.count({
                where: { ...baseWhere, estado: EstadoOrdenServicio.FINALIZADA },
            }),
            prisma.ordenServicio.findMany({
                where: filteredWhere,
                include: ordenReportInclude,
                orderBy: { fechaProgramada: "asc" },
                ...(skip !== undefined && { skip }),
                ...(pageSize !== undefined && { take: pageSize }),
            }),
            prisma.ordenServicio.count({ where: filteredWhere }),
        ]);

    return {
        summary: { totalOrdenes, pendientes, enProceso, completadas },
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
