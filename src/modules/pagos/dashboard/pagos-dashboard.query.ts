import prisma from '../../../config/prisma';
import { EstadoPago, Prisma } from '@prisma/client';
import { RawPagoReciente } from './pagos-dashboard.types';

const CONFIRMADO = [EstadoPago.CONFIRMADO];
const REGISTRADO = [EstadoPago.REGISTRADO];
const ANULADO = [EstadoPago.ANULADO];
const TODOS = [EstadoPago.REGISTRADO, EstadoPago.CONFIRMADO, EstadoPago.ANULADO];

export { CONFIRMADO, REGISTRADO, ANULADO, TODOS };

interface BaseFilters {
    empresaId: string;
    desde: Date;
    hasta: Date;
    clienteId?: string;
    metodoPagoId?: string;
}

function whereBase(filters: BaseFilters, estados: EstadoPago[]): Prisma.PagoWhereInput {
    return {
        empresaId: filters.empresaId,
        fechaPago: { gte: filters.desde, lte: filters.hasta },
        estado: { in: estados },
        ...(filters.clienteId && { clienteId: filters.clienteId }),
        ...(filters.metodoPagoId && { metodoPagoId: filters.metodoPagoId }),
    };
}

export async function sumCobrado(filters: BaseFilters): Promise<number> {
    const result = await prisma.pago.aggregate({
        where: whereBase(filters, CONFIRMADO),
        _sum: { montoTotal: true },
    });
    return parseFloat(result._sum.montoTotal?.toString() ?? '0');
}

export async function contarPagos(filters: BaseFilters, estados: EstadoPago[]): Promise<number> {
    return prisma.pago.count({ where: whereBase(filters, estados) });
}

export async function getPagosRecientes(
    filters: BaseFilters,
    estado?: EstadoPago,
): Promise<RawPagoReciente[]> {
    return prisma.pago.findMany({
        where: whereBase(filters, estado ? [estado] : TODOS),
        orderBy: { fechaRegistro: 'desc' },
        take: 20,
        select: {
            id: true,
            fechaRegistro: true,
            montoTotal: true,
            referencia: true,
            estado: true,
            metodoPago: { select: { nombre: true } },
            cliente: { select: { nombreRazonSocial: true } },
            registradoBy: { select: { nombres: true, apellidos: true } },
        },
    });
}
