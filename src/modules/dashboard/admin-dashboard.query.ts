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
    fechaDesdeExplicita?: Date;
    fechaHastaExplicita?: Date;
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

    const result = await prisma.aplicacionPago.aggregate({
        where: {
        createdAt: { gte: fechaDesde, lte: fechaHasta },
        pago: {
            empresaId,
            estado: EstadoPago.CONFIRMADO,
        },
        ...(zona ? { cargo: { cuentaServicio: { ubicacion: { zona } } } } : {}),
    },
    _sum: { montoAplicado: true },
    });
    return result._sum.montoAplicado ?? new Prisma.Decimal(0);
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
        SELECT DATE(ap.created_at) AS fecha, SUM(ap.monto_aplicado) AS total
        FROM aplicacion_pago ap
        JOIN pago p ON p.id = ap.pago_id
        JOIN cargo c ON c.id = ap.cargo_id
        JOIN cuenta_servicio cs ON cs.id = c.cuenta_servicio_id
        JOIN cliente_ubicacion cu ON cu.id = cs.ubicacion_id
        WHERE p.empresa_id = ${empresaId}::uuid
        AND p.estado = 'CONFIRMADO'
        AND ap.created_at >= ${fechaDesde}
        AND ap.created_at <= ${fechaHasta}
        AND cu.zona = ${zona}
        GROUP BY DATE(ap.created_at)
        ORDER BY DATE(ap.created_at) ASC
    `;
    return rows;
    }

    const rows = await prisma.$queryRaw<
    { fecha: Date; total: Prisma.Decimal }[]
    >`
    SELECT DATE(ap.created_at) AS fecha, SUM(ap.monto_aplicado) AS total
    FROM aplicacion_pago ap
    JOIN pago p ON p.id = ap.pago_id
    WHERE p.empresa_id = ${empresaId}::uuid
        AND p.estado = 'CONFIRMADO'
        AND ap.created_at >= ${fechaDesde}
        AND ap.created_at <= ${fechaHasta}
    GROUP BY DATE(ap.created_at)
    ORDER BY DATE(ap.created_at) ASC
    `;
    return rows;
}

export async function queryIngresosPorZona(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta } = filters;

    const rows = await prisma.$queryRaw<
    { zona: number | null; usuarios: bigint; esperado: Prisma.Decimal; ingreso: Prisma.Decimal }[]
    >`
    WITH zona_usuarios AS (
        SELECT
        cu.zona,
        COUNT(DISTINCT cs.cliente_id) AS usuarios
        FROM cuenta_servicio cs
        JOIN cliente_ubicacion cu ON cu.id = cs.ubicacion_id
        WHERE cs.empresa_id = ${empresaId}::uuid
        AND cs.estado = 'ACTIVA'
        AND cu.zona IS NOT NULL
        GROUP BY cu.zona
    ),
    zona_esperado AS (
        SELECT
        cu.zona,
        COALESCE(SUM(c.monto), 0) AS esperado
        FROM cargo c
        JOIN cuenta_servicio cs ON cs.id = c.cuenta_servicio_id
        JOIN cliente_ubicacion cu ON cu.id = cs.ubicacion_id
        WHERE c.empresa_id = ${empresaId}::uuid
        AND c.fecha_emision >= ${fechaDesde}
        AND c.fecha_emision <= ${fechaHasta}
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
        AND ap.created_at >= ${fechaDesde}
        AND ap.created_at <= ${fechaHasta}
        AND cu.zona IS NOT NULL
        GROUP BY cu.zona
    ),
    zonas AS (
        SELECT zona FROM zona_usuarios
        UNION
        SELECT zona FROM zona_esperado
        UNION
        SELECT zona FROM zona_ingreso
    )
    SELECT
        z.zona,
        COALESCE(zu.usuarios, 0) AS usuarios,
        COALESCE(ze.esperado, 0) AS esperado,
        COALESCE(zi.ingreso, 0) AS ingreso
    FROM zonas z
    LEFT JOIN zona_usuarios zu ON zu.zona = z.zona
    LEFT JOIN zona_esperado ze ON ze.zona = z.zona
    LEFT JOIN zona_ingreso zi ON zi.zona = z.zona
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
    const { empresaId, fechaDesdeExplicita, fechaHastaExplicita, zona } = filters;

    return prisma.ordenServicio.count({
    where: {
        empresaId,
        estado: {
        notIn: [EstadoOrdenServicio.FINALIZADA, EstadoOrdenServicio.CANCELADA],
        },
        fechaProgramada: {
        ...(fechaDesdeExplicita && { gte: fechaDesdeExplicita }),
        ...(fechaHastaExplicita && { lte: fechaHastaExplicita }),
        lt: new Date(),
        },
        ...zonaFilterUbicacion(zona),
    },
    });
}

export async function queryCargosEsperadosPeriodo(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona } = filters;

    const result = await prisma.cargo.aggregate({
    where: {
        empresaId,
        fechaEmision: { gte: fechaDesde, lte: fechaHasta },
        ...zonaFilterCuentaServicio(zona),
    },
    _sum: { monto: true },
    });
    return result._sum.monto ?? new Prisma.Decimal(0);
}
