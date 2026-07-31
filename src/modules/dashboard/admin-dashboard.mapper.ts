import { EstadoOrdenServicio, Prisma } from "@prisma/client";
import type {
    DashboardAlert,
    DashboardFilters,
    DashboardKpis,
    IngresoPeriodoRow,
    IngresoZonaRow,
    OrdenEstadoRow,
} from "./admin-dashboard.types";
import { toNumber } from "../../utils/utils";
import { formatDateOnly } from "../../common/utils/datetime";

export function mapFilters(
    fechaDesde: string,
    fechaHasta: string,
    zona?: number
): DashboardFilters {
    return {
    fechaDesde,
    fechaHasta,
    zona: zona ?? null,
    };
}

export function mapKpis(raw: {
    cobradoPeriodo: Prisma.Decimal;
    carteraPendiente: Prisma.Decimal;
    serviciosSuspendidos: number;
    ordenesPendientes: number;
    metaCobranza: number;
}): DashboardKpis {
    return {
    cobradoPeriodo: toNumber(raw.cobradoPeriodo),
    carteraPendiente: toNumber(raw.carteraPendiente),
    serviciosSuspendidos: raw.serviciosSuspendidos,
    ordenesPendientes: raw.ordenesPendientes,
    metaCobranza: raw.metaCobranza,
    };
}

export function mapIngresosPeriodo(
    rows: { fecha: Date; total: Prisma.Decimal }[],
    fechaDesde: Date,
    fechaHasta: Date
): IngresoPeriodoRow[] {
    const totalsByDate = new Map<string, number>();
    for (const row of rows) {
        totalsByDate.set(formatDateOnly(row.fecha), toNumber(row.total));
    }

    const result: IngresoPeriodoRow[] = [];
    const current = new Date(fechaDesde);
    while (current <= fechaHasta) {
        const key = formatDateOnly(current);
        result.push({ fecha: key, total: totalsByDate.get(key) ?? 0 });
        current.setUTCDate(current.getUTCDate() + 1);
    }
    return result;
}

export function mapIngresosPorZona(
    rows: { zona: number | null; usuarios: bigint; esperado: Prisma.Decimal; ingreso: Prisma.Decimal }[]
): IngresoZonaRow[] {
    return rows.map((row) => {
    const esperado = toNumber(row.esperado);
    const ingreso = toNumber(row.ingreso);
    const porcentaje = esperado > 0 ? Math.round((ingreso / esperado) * 10000) / 100 : 0;

    return {
        zona: row.zona !== null ? `Zona ${row.zona}` : "Sin zona",
        usuarios: Number(row.usuarios),
        esperado,
        ingreso,
        porcentaje,
    };
    });
}

const ESTADO_LABELS: Record<EstadoOrdenServicio, string> = {
    [EstadoOrdenServicio.PENDIENTE]: "Pendientes",
    [EstadoOrdenServicio.PROGRAMADA]: "Programadas",
    [EstadoOrdenServicio.EN_PROCESO]: "En Proceso",
    [EstadoOrdenServicio.PAUSADA]: "Pausadas",
    [EstadoOrdenServicio.FINALIZADA]: "Finalizadas",
    [EstadoOrdenServicio.CANCELADA]: "Canceladas",
};

const ESTADO_ORDEN: EstadoOrdenServicio[] = [
    EstadoOrdenServicio.PENDIENTE,
    EstadoOrdenServicio.PROGRAMADA,
    EstadoOrdenServicio.EN_PROCESO,
    EstadoOrdenServicio.PAUSADA,
    EstadoOrdenServicio.FINALIZADA,
    EstadoOrdenServicio.CANCELADA,
];

export function mapOrdenesEstado(
    rows: { estado: EstadoOrdenServicio; cantidad: number }[]
): OrdenEstadoRow[] {
    const cantidadPorEstado = new Map(rows.map((r) => [r.estado, r.cantidad]));
    return ESTADO_ORDEN.map((estado) => ({
    estado: ESTADO_LABELS[estado],
    cantidad: cantidadPorEstado.get(estado) ?? 0,
    }));
}

export function mapAlertas(raw: {
    clientesMorosos: number;
    serviciosSuspendidos: number;
    ordenesVencidas: number;
    metaCobranza: number;
}): DashboardAlert[] {
    const alertas: DashboardAlert[] = [];

    if (raw.clientesMorosos > 0) {
    alertas.push({
        tipo: "MOROSIDAD",
        titulo: "Clientes morosos",
        descripcion: `${raw.clientesMorosos} cliente(s) con más de 10 días de atraso`,
        valor: raw.clientesMorosos,
    });
    }

    if (raw.serviciosSuspendidos > 0) {
    alertas.push({
        tipo: "SUSPENSION",
        titulo: "Servicios suspendidos",
        descripcion: `${raw.serviciosSuspendidos} servicio(s) suspendido(s)`,
        valor: raw.serviciosSuspendidos,
    });
    }

    if (raw.ordenesVencidas > 0) {
    alertas.push({
        tipo: "ORDEN_VENCIDA",
        titulo: "Órdenes vencidas",
        descripcion: `${raw.ordenesVencidas} orden(es) pasada(s) de fecha programada`,
        valor: raw.ordenesVencidas,
    });
    }

    if (raw.metaCobranza < 100) {
    alertas.push({
        tipo: "META_COBRANZA",
        titulo: "Meta de cobranza",
        descripcion: `Avance del ${raw.metaCobranza.toFixed(1)}% de la meta de cobranza`,
        valor: raw.metaCobranza,
    });
    }

    return alertas;
}
