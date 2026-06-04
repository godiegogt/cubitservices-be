import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function buildWhere(start: Date, end: Date, usuarioId?: string) {
    return {
    fechaPago: { gte: start, lte: end },
    ...(usuarioId ? { usuarioId } : {}),
    };
}

export async function getTotalCobradoHoy(
    start: Date,
    end: Date,
    usuarioId?: string,
): Promise<number> {
    const result = await prisma.pago.aggregate({
    _sum: { monto: true },
    where: buildWhere(start, end, usuarioId),
    });

    return result._sum.monto ?? 0;
}

export async function getPagosRegistradosHoy(
    start: Date,
    end: Date,
    usuarioId?: string,
): Promise<number> {
    return prisma.pago.count({
    where: buildWhere(start, end, usuarioId),
    });
}

export async function getDiferenciaCaja(
    start: Date,
    end: Date,
    usuarioId?: string,
): Promise<number> {
    const cierre = await prisma.cierreCaja.findFirst({
    where: {
        fecha: { gte: start, lte: end },
        ...(usuarioId ? { usuarioId } : {}),
    },
    orderBy: { fecha: 'desc' },
    });

    if (!cierre) return 0;

    return (cierre.montoEsperado ?? 0) - (cierre.montoReal ?? 0);
}

export async function getCobroPorMetodo(
    start: Date,
    end: Date,
    usuarioId?: string,
): Promise<{ metodoPago: string; _sum: { monto: number | null } }[]> {
    return prisma.pago.groupBy({
    by: ['metodoPago'],
    _sum: { monto: true },
    where: buildWhere(start, end, usuarioId),
    orderBy: { _sum: { monto: 'desc' } },
    }) as any;
}

export async function getPagosDia(
    start: Date,
    end: Date,
    usuarioId?: string,
) {
    return prisma.pago.findMany({
    where: buildWhere(start, end, usuarioId),
    orderBy: { fechaPago: 'desc' },
    select: {
        id: true,
        fechaPago: true,
        monto: true,
        metodoPago: true,
        cliente: {
        select: { nombre: true },
        },
        usuario: {
        select: { nombre: true },
        },
    },
    });
}