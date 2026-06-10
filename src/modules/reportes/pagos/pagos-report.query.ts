import { EstadoPago, Prisma } from "@prisma/client";
import prisma from "../../../config/prisma";

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
    select: { montoAplicado: true },
    },
} satisfies Prisma.PagoInclude;

export type PagoReporteItem = Prisma.PagoGetPayload<{
    include: typeof pagoReporteInclude;
}>;

export async function queryPagosReporte(
    empresaId: string,
    filters: {
    fechaInicio: Date;
    fechaFin: Date;
    clienteId?: string;
    codigoCliente?: string;
    nombreCliente?: string;
    metodoPagoId?: string;
    estado?: EstadoPago;
    usuarioRegistradorId?: string;
    referencia?: string;
    }
): Promise<PagoReporteItem[]> {
    const where: Prisma.PagoWhereInput = {
    empresaId,
    fechaPago: {
        gte: filters.fechaInicio,
        lte: filters.fechaFin,
    },
    ...(filters.clienteId ? { clienteId: filters.clienteId } : {}),
    ...(filters.codigoCliente || filters.nombreCliente
        ? {
            cliente: {
            ...(filters.codigoCliente
                ? { codigo: { contains: filters.codigoCliente, mode: "insensitive" as const } }
                : {}),
            ...(filters.nombreCliente
                ? { nombreRazonSocial: { contains: filters.nombreCliente, mode: "insensitive" as const } }
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

    return prisma.pago.findMany({
    where,
    include: pagoReporteInclude,
    orderBy: [{ fechaPago: "desc" }, { createdAt: "desc" }],
    });
}
