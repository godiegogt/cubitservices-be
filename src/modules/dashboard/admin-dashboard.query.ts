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
    zona?: string;
    aldea?: string;
}

function ubicacionFilter(zona?: string, aldea?: string) {
    if (!zona && !aldea) return {};
    return {
        ubicacion: {
            ...(zona && { zona: { equals: zona, mode: "insensitive" as const } }),
            ...(aldea && { aldea: { equals: aldea, mode: "insensitive" as const } }),
        },
    };
}

function zonaFilterCuentaServicio(zona?: string, aldea?: string) {
    if (!zona && !aldea) return {};
    return { cuentaServicio: ubicacionFilter(zona, aldea) };
}

function zonaFilterUbicacion(zona?: string, aldea?: string) {
    return ubicacionFilter(zona, aldea);
}

export async function queryCobradoPeriodo(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona, aldea } = filters;

    const result = await prisma.aplicacionPago.aggregate({
        where: {
        createdAt: { gte: fechaDesde, lte: fechaHasta },
        pago: {
            empresaId,
            estado: EstadoPago.CONFIRMADO,
        },
        ...((zona || aldea) ? { cargo: { cuentaServicio: ubicacionFilter(zona, aldea) } } : {}),
    },
    _sum: { montoAplicado: true },
    });
    return result._sum.montoAplicado ?? new Prisma.Decimal(0);
}

export async function queryCarteraPendiente(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona, aldea } = filters;

    const result = await prisma.cargo.aggregate({
    where: {
        empresaId,
        estado: { in: [EstadoCargo.PENDIENTE, EstadoCargo.PARCIAL, EstadoCargo.VENCIDO] },
        fechaEmision: { gte: fechaDesde, lte: fechaHasta },
        ...zonaFilterCuentaServicio(zona, aldea),
    },
    _sum: { saldo: true },
    });
    return result._sum.saldo ?? new Prisma.Decimal(0);
}

export async function queryServiciosSuspendidos(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona, aldea } = filters;

    return prisma.cuentaServicio.count({
    where: {
        empresaId,
        estado: EstadoCuentaServicio.SUSPENDIDA,
        createdAt: { gte: fechaDesde, lte: fechaHasta },
        ...zonaFilterUbicacion(zona, aldea),
    },
    });
}

export async function queryOrdenesPendientes(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona, aldea } = filters;

    return prisma.ordenServicio.count({
    where: {
        empresaId,
        estado: {
        notIn: [EstadoOrdenServicio.FINALIZADA, EstadoOrdenServicio.CANCELADA],
        },
        fechaProgramada: { gte: fechaDesde, lte: fechaHasta },
        ...zonaFilterUbicacion(zona, aldea),
    },
    });
}

export async function queryIngresosPeriodo(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona, aldea } = filters;

    if (zona || aldea) {
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
        ${zona ? Prisma.sql`AND cu.zona ILIKE ${zona}` : Prisma.empty}
        ${aldea ? Prisma.sql`AND cu.aldea ILIKE ${aldea}` : Prisma.empty}
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
    { zona: string | null; usuarios: bigint; esperado: Prisma.Decimal; ingreso: Prisma.Decimal }[]
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
    const { empresaId, fechaDesde, fechaHasta, zona, aldea } = filters;

    const grouped = await prisma.ordenServicio.groupBy({
    by: ["estado"],
    where: {
        empresaId,
        fechaProgramada: { gte: fechaDesde, lte: fechaHasta },
        ...zonaFilterUbicacion(zona, aldea),
    },
    _count: { _all: true },
    });

    return grouped.map((g) => ({ estado: g.estado, cantidad: g._count._all }));
}

export async function queryClientesMorosos(filters: DashboardQueryFilters) {
    const { empresaId, zona, aldea } = filters;

    const count = await prisma.cargo.groupBy({
    by: ["clienteId"],
    where: {
        empresaId,
        estado: { in: [EstadoCargo.PENDIENTE, EstadoCargo.PARCIAL, EstadoCargo.VENCIDO] },
        fechaVencimiento: {
        lte: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        ...zonaFilterCuentaServicio(zona, aldea),
    },
    });
    return count.length;
}

export async function queryOrdenesVencidas(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesdeExplicita, fechaHastaExplicita, zona, aldea } = filters;

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
        ...zonaFilterUbicacion(zona, aldea),
    },
    });
}

export async function queryCargosEsperadosPeriodo(filters: DashboardQueryFilters) {
    const { empresaId, fechaDesde, fechaHasta, zona, aldea } = filters;

    const result = await prisma.cargo.aggregate({
    where: {
        empresaId,
        fechaEmision: { gte: fechaDesde, lte: fechaHasta },
        ...zonaFilterCuentaServicio(zona, aldea),
    },
    _sum: { monto: true },
    });
    return result._sum.monto ?? new Prisma.Decimal(0);
}
