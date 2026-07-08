import { EstadoPago } from '@prisma/client';
import prisma from '../../../config/prisma';

export async function findCuentaServicioConRelaciones(cuentaServicioId: string) {
    return prisma.cuentaServicio.findUnique({
    where: { id: cuentaServicioId },
    include: {
        cliente: {
        select: {
            id: true,
            codigo: true,
            nombreRazonSocial: true,
            telefono: true,
            email: true,
            estado: true,
        },
        },
        ubicacion: {
        select: {
            id: true,
            nombre: true,
            direccion: true,
            referencia: true,
        },
        },
        tipoServicio: {
        select: {
            id: true,
            nombre: true,
        },
        },
        politicaCobro: {
        select: {
            id: true,
            nombre: true,
        },
        },
    },
    });
}

export async function findCargosDeCuenta(cuentaServicioId: string, empresaId: string) {
    return prisma.cargo.findMany({
    where: { cuentaServicioId, empresaId },
    orderBy: [{ fechaEmision: 'asc' }, { createdAt: 'asc' }],
    });
}

export async function findAplicacionesPagoDeCuenta(cuentaServicioId: string, empresaId: string) {
    return prisma.aplicacionPago.findMany({
    where: {
        cargo: { cuentaServicioId, empresaId },
    },
    include: {
        pago: {
        include: {
            metodoPago: {
            select: { nombre: true },
            },
        },
        },
    },
    orderBy: { createdAt: 'asc' },
    });
}

export async function calcularSaldoDisponibleCliente(clienteId: string, empresaId: string) {
    const [totalPagosResult, totalAplicadoResult] = await Promise.all([
    prisma.pago.aggregate({
        where: {
        clienteId,
        empresaId,
        estado: EstadoPago.CONFIRMADO,
        },
        _sum: { montoTotal: true },
    }),
    prisma.aplicacionPago.aggregate({
        where: {
        pago: { clienteId, empresaId },
        },
        _sum: { montoAplicado: true },
    }),
    ]);

    const totalPagos = Number(totalPagosResult._sum.montoTotal ?? 0);
    const totalAplicado = Number(totalAplicadoResult._sum.montoAplicado ?? 0);

    return totalPagos - totalAplicado;
}
