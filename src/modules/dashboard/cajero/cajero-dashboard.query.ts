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

const ACTIVOS = [EstadoPago.REGISTRADO, EstadoPago.CONFIRMADO];
const PENDIENTES = [EstadoPago.REGISTRADO];
const ANULADOS = [EstadoPago.ANULADO];

const wherePagos = (empresaId: string, desde: Date, hasta: Date, estados: EstadoPago[]) => ({
    empresaId,
    fechaPago: { gte: desde, lte: hasta },
    estado: { in: estados },
});

async function sumarMonto(empresaId: string, desde: Date, hasta: Date, estados: EstadoPago[]): Promise<number> {
    const result = await prisma.pago.aggregate({
        where: wherePagos(empresaId, desde, hasta, estados),
        _sum: { montoTotal: true },
    });
    return parseFloat(result._sum.montoTotal?.toString() ?? '0');
}

async function contarPagos(empresaId: string, desde: Date, hasta: Date, estados: EstadoPago[]): Promise<number> {
    return prisma.pago.count({ where: wherePagos(empresaId, desde, hasta, estados) });
}

export async function getTotalCobradoHoy(empresaId: string, fecha: Date): Promise<number> {
    return sumarMonto(empresaId, inicioDia(fecha), finDia(fecha), ACTIVOS);
}

export async function getTotalCobradoAyer(empresaId: string, fecha: Date): Promise<number> {
    const ayer = diaAnterior(fecha);
    return sumarMonto(empresaId, inicioDia(ayer), finDia(ayer), ACTIVOS);
}

export async function getPagosRegistradosHoy(empresaId: string, fecha: Date): Promise<number> {
    return contarPagos(empresaId, inicioDia(fecha), finDia(fecha), ACTIVOS);
}

export async function getPagosRegistradosAyer(empresaId: string, fecha: Date): Promise<number> {
    const ayer = diaAnterior(fecha);
    return contarPagos(empresaId, inicioDia(ayer), finDia(ayer), ACTIVOS);
}

export async function getPagosPendientesHoy(empresaId: string, fecha: Date): Promise<number> {
    return contarPagos(empresaId, inicioDia(fecha), finDia(fecha), PENDIENTES);
}

export async function getPagosPendientesAyer(empresaId: string, fecha: Date): Promise<number> {
    const ayer = diaAnterior(fecha);
    return contarPagos(empresaId, inicioDia(ayer), finDia(ayer), PENDIENTES);
}

export async function getPagosAnuladosHoy(empresaId: string, fecha: Date): Promise<number> {
    return contarPagos(empresaId, inicioDia(fecha), finDia(fecha), ANULADOS);
}

export async function getPagosAnuladosAyer(empresaId: string, fecha: Date): Promise<number> {
    const ayer = diaAnterior(fecha);
    return contarPagos(empresaId, inicioDia(ayer), finDia(ayer), ANULADOS);
}

export async function getCobroPorMetodo(
    empresaId: string,
    fecha: Date,
): Promise<{ metodo: string; total: number }[]> {
    const pagos = await prisma.pago.findMany({
        where: wherePagos(empresaId, inicioDia(fecha), finDia(fecha), ACTIVOS),
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
        where: wherePagos(empresaId, inicioDia(fecha), finDia(fecha), ACTIVOS),
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
