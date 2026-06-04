import prisma from "../../../config/prisma";
import { EstadoPago } from "@prisma/client";
import { RawPagoDia } from "../common/dashboard.types";

const inicioDia = (fecha: Date): Date => {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    return d;
};

const finDia = (fecha: Date): Date => {
    const d = new Date(fecha);
    d.setHours(23, 59, 59, 999);
    return d;
};

const diaAnterior = (fecha: Date): Date => {
    const d = new Date(fecha);
    d.setDate(d.getDate() - 1);
    return d;
};

const whereActivos = (empresaId: string, desde: Date, hasta: Date) => ({
    empresaId,
    fechaPago: { gte: desde, lte: hasta },
    estado: { in: [EstadoPago.REGISTRADO, EstadoPago.CONFIRMADO] },
});

export async function getTotalCobradoHoy(empresaId: string, fecha: Date): Promise<number> {
    const result = await prisma.pago.aggregate({
        where: whereActivos(empresaId, inicioDia(fecha), finDia(fecha)),
        _sum: { montoTotal: true },
    });
    return parseFloat(result._sum.montoTotal?.toString() ?? '0');
}

export async function getTotalCobradoAyer(empresaId: string, fecha: Date): Promise<number> {
    const ayer = diaAnterior(fecha);
    const result = await prisma.pago.aggregate({
        where: whereActivos(empresaId, inicioDia(ayer), finDia(ayer)),
        _sum: { montoTotal: true },
    });
    return parseFloat(result._sum.montoTotal?.toString() ?? '0');
}

export async function getPagosRegistradosHoy(empresaId: string, fecha: Date): Promise<number> {
    return prisma.pago.count({
        where: whereActivos(empresaId, inicioDia(fecha), finDia(fecha)),
    });
}

export async function getPagosRegistradosAyer(empresaId: string, fecha: Date): Promise<number> {
    const ayer = diaAnterior(fecha);
    return prisma.pago.count({
        where: whereActivos(empresaId, inicioDia(ayer), finDia(ayer)),
    });
}

export async function getCobroPorMetodo(
    empresaId: string,
    fecha: Date,
): Promise<{ metodo: string; total: number }[]> {
    const pagos = await prisma.pago.findMany({
        where: whereActivos(empresaId, inicioDia(fecha), finDia(fecha)),
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

export async function getPagosDia(empresaId: string, fecha: Date): Promise<RawPagoDia[]> {
    return prisma.pago.findMany({
        where: whereActivos(empresaId, inicioDia(fecha), finDia(fecha)),
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
