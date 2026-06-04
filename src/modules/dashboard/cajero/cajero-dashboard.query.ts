import prisma from "../../../config/prisma";
import { EstadoPago } from "@prisma/client";
import { RawPagoDia } from "../common/dashboard.types";

const ACTIVOS = [EstadoPago.REGISTRADO, EstadoPago.CONFIRMADO];
const PENDIENTES = [EstadoPago.REGISTRADO];
const ANULADOS = [EstadoPago.ANULADO];

export { ACTIVOS, PENDIENTES, ANULADOS };

const wherePagos = (empresaId: string, desde: Date, hasta: Date, estados: EstadoPago[]) => ({
    empresaId,
    fechaPago: { gte: desde, lte: hasta },
    estado: { in: estados },
});

export async function getTotalCobrado(empresaId: string, desde: Date, hasta: Date): Promise<number> {
    const result = await prisma.pago.aggregate({
        where: wherePagos(empresaId, desde, hasta, ACTIVOS),
        _sum: { montoTotal: true },
    });
    return parseFloat(result._sum.montoTotal?.toString() ?? '0');
}

export async function contarPagos(
    empresaId: string,
    desde: Date,
    hasta: Date,
    estados: EstadoPago[],
): Promise<number> {
    return prisma.pago.count({ where: wherePagos(empresaId, desde, hasta, estados) });
}

export async function getCobroPorMetodo(
    empresaId: string,
    desde: Date,
    hasta: Date,
): Promise<{ metodo: string; total: number }[]> {
    const pagos = await prisma.pago.findMany({
        where: wherePagos(empresaId, desde, hasta, ACTIVOS),
        select: {
            montoTotal: true,
            metodoPago: { select: { nombre: true } },
        },
    });

    const acumulado: Record<string, number> = {};
    for (const pago of pagos) {
        const nombre = pago.metodoPago.nombre;
        acumulado[nombre] = (acumulado[nombre] ?? 0) + parseFloat(pago.montoTotal.toString());
    }

    return Object.entries(acumulado).map(([metodo, total]) => ({
        metodo,
        total: parseFloat(total.toFixed(2)),
    }));
}

export async function getPagosDia(empresaId: string, desde: Date, hasta: Date): Promise<RawPagoDia[]> {
    return prisma.pago.findMany({
        where: wherePagos(empresaId, desde, hasta, ACTIVOS),
        orderBy: { fechaRegistro: 'desc' },
        select: {
            id: true,
            fechaPago: true,
            montoTotal: true,
            metodoPago: { select: { nombre: true } },
            cliente: { select: { nombreRazonSocial: true } },
            registradoBy: { select: { nombres: true, apellidos: true } },
        },
    });
}
