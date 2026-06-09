import { Prisma } from "@prisma/client";
import {
    ReportePagoItemDto,
    ReportePagosFiltrosDto,
    ReportePagosPorMetodoPagoDto,
    ReportePagosResumenDto,
    ReportePagosResultDto,
} from "../common/reportes.dto";
import { decimalToNumber, formatDateOnly } from "../common/reportes.mapper";
import { ReportePagosFilters } from "../common/reporte.types";
import { PagoReporteItem } from "./pagos-report.query";

function sumAplicaciones(
    aplicaciones: { montoAplicado: Prisma.Decimal }[]
): number {
    return aplicaciones
    .reduce((acc, a) => acc.plus(a.montoAplicado), new Prisma.Decimal(0))
    .toNumber();
}

function mapToItemDto(pago: PagoReporteItem): ReportePagoItemDto {
    const montoTotal = decimalToNumber(pago.montoTotal);
    const montoAplicado = +sumAplicaciones(pago.aplicaciones).toFixed(2);
    const montoNoAplicado = +(montoTotal - montoAplicado).toFixed(2);

    return {
    id: pago.id,
    fechaPago: formatDateOnly(pago.fechaPago),
    cliente: {
        id: pago.cliente.id,
        codigo: pago.cliente.codigo,
        nombre: pago.cliente.nombreRazonSocial,
    },
    metodoPago: {
        id: pago.metodoPago.id,
        nombre: pago.metodoPago.nombre,
    },
    referencia: pago.referencia,
    estado: pago.estado,
    montoTotal,
    montoAplicado,
    montoNoAplicado,
    registradoPor: {
        id: pago.registradoBy.id,
        nombre: [pago.registradoBy.nombres, pago.registradoBy.apellidos]
        .filter(Boolean)
        .join(" "),
    },
    };
}

function calcularResumen(items: ReportePagoItemDto[]): ReportePagosResumenDto {
    return items.reduce(
    (acc, item) => ({
        totalPagos: acc.totalPagos + 1,
        totalCobrado: +(acc.totalCobrado + item.montoTotal).toFixed(2),
        totalAplicado: +(acc.totalAplicado + item.montoAplicado).toFixed(2),
        totalNoAplicado: +(acc.totalNoAplicado + item.montoNoAplicado).toFixed(2),
    }),
    { totalPagos: 0, totalCobrado: 0, totalAplicado: 0, totalNoAplicado: 0 }
    );
}

function agruparPorMetodoPago(
    items: ReportePagoItemDto[]
): ReportePagosPorMetodoPagoDto[] {
    const map = new Map<string, { cantidad: number; total: number }>();

    for (const item of items) {
    const key = item.metodoPago.nombre;
    const prev = map.get(key) ?? { cantidad: 0, total: 0 };
    map.set(key, {
        cantidad: prev.cantidad + 1,
        total: +(prev.total + item.montoTotal).toFixed(2),
    });
    }

    return Array.from(map.entries()).map(([metodoPago, { cantidad, total }]) => ({
    metodoPago,
    cantidad,
    total,
    }));
}

function buildFiltrosDto(filters: ReportePagosFilters): ReportePagosFiltrosDto {
    return {
    fechaInicio: filters.fechaInicio,
    fechaFin: filters.fechaFin,
    clienteId: filters.clienteId,
    metodoPagoId: filters.metodoPagoId,
    estado: filters.estado,
    };
}

export function buildReportePagosResult(
    pagos: PagoReporteItem[],
    filters: ReportePagosFilters,
    page: number,
    pageSize: number
): ReportePagosResultDto {
    const allItems = pagos.map(mapToItemDto);
    const resumen = calcularResumen(allItems);
    const porMetodoPago = agruparPorMetodoPago(allItems);

    const total = allItems.length;
    const start = (page - 1) * pageSize;
    const pagedItems = allItems.slice(start, start + pageSize);

    return {
    filtros: buildFiltrosDto(filters),
    resumen,
    porMetodoPago,
    items: pagedItems,
    meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    },
    };
}

export function buildReportePagosResultFull(
    pagos: PagoReporteItem[],
    filters: ReportePagosFilters
): ReportePagosResultDto {
    const allItems = pagos.map(mapToItemDto);
    const resumen = calcularResumen(allItems);
    const porMetodoPago = agruparPorMetodoPago(allItems);
    const total = allItems.length;

    return {
    filtros: buildFiltrosDto(filters),
    resumen,
    porMetodoPago,
    items: allItems,
    meta: {
        total,
        page: 1,
        pageSize: total || 1,
        totalPages: 1,
    },
    };
}
