import {
    EstadoCargo,
    EstadoCuentaServicio,
    EstadoOrdenServicio,
    EstadoPago,
    Prisma,
} from "@prisma/client";
import prisma from "../../config/prisma";

interface DashboardQueryFilters {
    empresaId: string;
    fechaDesde: Date;
    fechaHasta: Date;
    zona?: number;
}

function zonaFilterCuentaServicio(zona?: number) {
    if (!zona) return {};
    return { cuentaServicio: { ubicacion: { zona } } };
}

function zonaFilterUbicacion(zona?: number) {
    if (!zona) return {};
    return { ubicacion: { zona } };
}

export async function queryCobradoPeriodo(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona } = filters;

    if (zona) {
    const result = await prisma.aplicacionPago.aggregate({
        where: {
        pago: {
            empresaId,
            estado: EstadoPago.CONFIRMADO,
            fechaPago: { gte: fechaDesde, lte: fechaHasta },
        },
        cargo: { cuentaServicio: { ubicacion: { zona } } },
        },
        _sum: { montoAplicado: true },
    });
    return result._sum.montoAplicado ?? new Prisma.Decimal(0);
    }

    const result = await prisma.pago.aggregate({
    where: {
        empresaId,
        estado: EstadoPago.CONFIRMADO,
        fechaPago: { gte: fechaDesde, lte: fechaHasta },
    },
    _sum: { montoTotal: true },
    });
    return result._sum.montoTotal ?? new Prisma.Decimal(0);
}

export async function queryCarteraPendiente(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona } = filters;

    const result = await prisma.cargo.aggregate({
    where: {
        empresaId,
        estado: { in: [EstadoCargo.PENDIENTE, EstadoCargo.PARCIAL, EstadoCargo.VENCIDO] },
        fechaEmision: { gte: fechaDesde, lte: fechaHasta },
        ...zonaFilterCuentaServicio(zona),
    },
    _sum: { saldo: true },
    });
    return result._sum.saldo ?? new Prisma.Decimal(0);
}

export async function queryServiciosSuspendidos(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona } = filters;

    return prisma.cuentaServicio.count({
    where: {
        empresaId,
        estado: EstadoCuentaServicio.SUSPENDIDA,
        createdAt: { gte: fechaDesde, lte: fechaHasta },
        ...zonaFilterUbicacion(zona),
    },
    });
}

export async function queryOrdenesPendientes(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona } = filters;

    return prisma.ordenServicio.count({
    where: {
        empresaId,
        estado: {
        notIn: [EstadoOrdenServicio.FINALIZADA, EstadoOrdenServicio.CANCELADA],
        },
        fechaProgramada: { gte: fechaDesde, lte: fechaHasta },
        ...zonaFilterUbicacion(zona),
    },
    });
}

export async function queryIngresosPeriodo(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona } = filters;

    if (zona) {
    const rows = await prisma.$queryRaw<
        { fecha: Date; total: Prisma.Decimal }[]
    >`
        SELECT p.fecha_pago AS fecha, SUM(ap.monto_aplicado) AS total
        FROM aplicacion_pago ap
        JOIN pago p ON p.id = ap.pago_id
        JOIN cargo c ON c.id = ap.cargo_id
        JOIN cuenta_servicio cs ON cs.id = c.cuenta_servicio_id
        JOIN cliente_ubicacion cu ON cu.id = cs.ubicacion_id
        WHERE p.empresa_id = ${empresaId}::uuid
        AND p.estado = 'CONFIRMADO'
        AND p.fecha_pago >= ${fechaDesde}
        AND p.fecha_pago <= ${fechaHasta}
        AND cu.zona = ${zona}
        GROUP BY p.fecha_pago
        ORDER BY p.fecha_pago ASC
    `;
    return rows;
    }

    const rows = await prisma.$queryRaw<
    { fecha: Date; total: Prisma.Decimal }[]
    >`
    SELECT fecha_pago AS fecha, SUM(monto_total) AS total
    FROM pago
    WHERE empresa_id = ${empresaId}::uuid
        AND estado = 'CONFIRMADO'
        AND fecha_pago >= ${fechaDesde}
        AND fecha_pago <= ${fechaHasta}
    GROUP BY fecha_pago
    ORDER BY fecha_pago ASC
    `;
    return rows;
}

export async function queryIngresosPorZona(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta } = filters;

    const rows = await prisma.$queryRaw<
    { zona: number | null; usuarios: bigint; esperado: Prisma.Decimal; ingreso: Prisma.Decimal }[]
    >`
    WITH zona_base AS (
        SELECT
        cu.zona,
        COUNT(DISTINCT cs.cliente_id) AS usuarios,
        COALESCE(SUM(cs.monto_base), 0) AS esperado
        FROM cuenta_servicio cs
        JOIN cliente_ubicacion cu ON cu.id = cs.ubicacion_id
        WHERE cs.empresa_id = ${empresaId}::uuid
        AND cs.estado = 'ACTIVA'
        AND cu.zona IS NOT NULL
        GROUP BY cu.zona
    ),
    zona_ingreso AS (
        SELECT
        cu.zona,
        COALESCE(SUM(ap.monto_aplicado), 0) AS ingreso
        FROM aplicacion_pago ap
        JOIN pago p ON p.id = ap.pago_id
        JOIN cargo c ON c.id = ap.cargo_id
        JOIN cuenta_servicio cs ON cs.id = c.cuenta_servicio_id
        JOIN cliente_ubicacion cu ON cu.id = cs.ubicacion_id
        WHERE p.empresa_id = ${empresaId}::uuid
        AND p.estado = 'CONFIRMADO'
        AND p.fecha_pago >= ${fechaDesde}
        AND p.fecha_pago <= ${fechaHasta}
        AND cu.zona IS NOT NULL
        GROUP BY cu.zona
    )
    SELECT
        zb.zona,
        zb.usuarios,
        zb.esperado,
        COALESCE(zi.ingreso, 0) AS ingreso
    FROM zona_base zb
    LEFT JOIN zona_ingreso zi ON zi.zona = zb.zona
    ORDER BY ingreso DESC
    `;
    return rows;
}

export async function queryOrdenesEstado(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona } = filters;

    const baseWhere = {
    empresaId,
    estado: {
        notIn: [EstadoOrdenServicio.FINALIZADA, EstadoOrdenServicio.CANCELADA],
    },
    fechaProgramada: { gte: fechaDesde, lte: fechaHasta },
    ...zonaFilterUbicacion(zona),
    };

    const [pendientes, programadas, enProceso] = await Promise.all([
    prisma.ordenServicio.count({
        where: { ...baseWhere, estado: EstadoOrdenServicio.PENDIENTE },
    }),
    prisma.ordenServicio.count({
        where: { ...baseWhere, estado: EstadoOrdenServicio.PROGRAMADA },
    }),
    prisma.ordenServicio.count({
        where: {
        ...baseWhere,
        estado: { in: [EstadoOrdenServicio.EN_PROCESO, EstadoOrdenServicio.PAUSADA] },
        },
    }),
    ]);

    return { pendientes, programadas, enProceso };
}

export async function queryClientesMorosos(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona } = filters;

    const count = await prisma.cargo.groupBy({
    by: ["clienteId"],
    where: {
        empresaId,
        estado: EstadoCargo.VENCIDO,
        fechaEmision: { gte: fechaDesde, lte: fechaHasta },
        fechaVencimiento: {
        lte: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        ...zonaFilterCuentaServicio(zona),
    },
    });
    return count.length;
}

export async function queryOrdenesVencidas(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona } = filters;

    return prisma.ordenServicio.count({
    where: {
        empresaId,
        estado: {
        notIn: [EstadoOrdenServicio.FINALIZADA, EstadoOrdenServicio.CANCELADA],
        },
        fechaProgramada: { gte: fechaDesde, lte: fechaHasta, lt: new Date() },
        ...zonaFilterUbicacion(zona),
    },
    });
}

export async function queryMetaCobranza(empresaId: string, zona?: number) {
    if (zona) {
    const result = await prisma.$queryRaw<{ meta: Prisma.Decimal | null }[]>`
        SELECT SUM(cs.monto_base) AS meta
        FROM cuenta_servicio cs
        JOIN cliente_ubicacion cu ON cu.id = cs.ubicacion_id
        WHERE cs.empresa_id = ${empresaId}::uuid
        AND cs.estado = 'ACTIVA'
        AND cu.zona = ${zona}
    `;
    return result[0]?.meta ?? new Prisma.Decimal(0);
    }

    const result = await prisma.$queryRaw<{ meta: Prisma.Decimal | null }[]>`
    SELECT SUM(monto_base) AS meta
    FROM cuenta_servicio
    WHERE empresa_id = ${empresaId}::uuid
        AND estado = 'ACTIVA'
    `;
    return result[0]?.meta ?? new Prisma.Decimal(0);
}
