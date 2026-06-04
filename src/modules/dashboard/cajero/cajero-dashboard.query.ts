import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const hoyInicio = (): Date => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const hoyFin = (): Date => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
};

export async function getTotalCobradoHoy(empresaId: string): Promise<number> {
    const result = await prisma.pago.aggregate({
    where: {
        empresaId,
        fechaPago: {
        gte: hoyInicio(),
        lte: hoyFin(),
        },
        estado: { in: ['REGISTRADO', 'CONFIRMADO'] },
    },
    _sum: { montoTotal: true },
    });

    return parseFloat(result._sum.montoTotal?.toString() ?? '0');
}

export async function getPagosRegistradosHoy(empresaId: string): Promise<number> {
    return prisma.pago.count({
    where: {
        empresaId,
        fechaPago: {
        gte: hoyInicio(),
        lte: hoyFin(),
        },
        estado: { in: ['REGISTRADO', 'CONFIRMADO'] },
    },
    });
}

export async function getDiferenciaCaja(
    empresaId: string,
    totalCobrado: number,
): Promise<number> {
    const pagosHoy = await prisma.pago.findMany({
    where: {
        empresaId,
        fechaPago: {
        gte: hoyInicio(),
        lte: hoyFin(),
        },
        estado: { in: ['REGISTRADO', 'CONFIRMADO'] },
    },
    select: { id: true },
    });

    const pagoIds = pagosHoy.map((p) => p.id);

    if (pagoIds.length === 0) return 0;

    const aplicado = await prisma.aplicacionPago.aggregate({
    where: { pagoId: { in: pagoIds } },
    _sum: { montoAplicado: true },
    });

    const totalAplicado = parseFloat(aplicado._sum.montoAplicado?.toString() ?? '0');
    return parseFloat((totalCobrado - totalAplicado).toFixed(2));
}

export async function getCobroPorMetodo(
    empresaId: string,
): Promise<{ metodo: string; total: number }[]> {
    const pagos = await prisma.pago.findMany({
    where: {
        empresaId,
        fechaPago: {
        gte: hoyInicio(),
        lte: hoyFin(),
        },
        estado: { in: ['REGISTRADO', 'CONFIRMADO'] },
    },
    select: {
        montoTotal: true,
        metodoPago: { select: { nombre: true } },
    },
    });

    const acumulado: Record<string, number> = {};
    for (const pago of pagos) {
    const nombre = pago.metodoPago.nombre;
    const monto = parseFloat(pago.montoTotal.toString());
    acumulado[nombre] = (acumulado[nombre] ?? 0) + monto;
    }

    return Object.entries(acumulado).map(([metodo, total]) => ({
    metodo,
    total: parseFloat(total.toFixed(2)),
    }));
}

export async function getPagosDia(empresaId: string) {
    return prisma.pago.findMany({
    where: {
        empresaId,
        fechaPago: {
        gte: hoyInicio(),
        lte: hoyFin(),
        },
        estado: { in: ['REGISTRADO', 'CONFIRMADO'] },
    },
    orderBy: { fechaRegistro: 'desc' },
    select: {
        id: true,
        fechaPago: true,
        montoTotal: true,
        metodoPago: { select: { nombre: true } },
        cliente: { select: { nombre: true } },
        registradoBy: { select: { nombre: true } },
    },
    });
}