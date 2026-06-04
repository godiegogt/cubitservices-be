import { formatMonto, toPagoDiaRow } from '../common/dashboard.mapper';
import {
    CobroPorMetodo,
    DashboardCajeroKpis,
    DashboardCajeroResumen,
    PagoDiaRow,
} from '../common/dashboard.types';

export function mapKpis(raw: {
    totalCobradoHoy: number;
    pagosRegistrados: number;
    diferenciaCaja: number;
}): DashboardCajeroKpis {
    return {
    totalCobradoHoy: formatMonto(raw.totalCobradoHoy),
    pagosRegistrados: raw.pagosRegistrados,
    diferenciaCaja: formatMonto(raw.diferenciaCaja),
    };
}

export function mapResumen(
    rawCobros: { metodoPago: string; _sum: { monto: number | null } }[],
): DashboardCajeroResumen {
    const cobroPorMetodo: CobroPorMetodo[] = rawCobros.map((row) => ({
    metodo: row.metodoPago,
    total: formatMonto(row._sum.monto ?? 0),
    }));

    return { cobroPorMetodo };
}

export function mapPagosDia(
    rawPagos: {
    id: string;
    fechaPago: Date;
    monto: number | string;
    metodoPago: string;
    cliente: { nombre: string };
    usuario: { nombre: string };
    }[],
): PagoDiaRow[] {
    return rawPagos.map((p) =>
    toPagoDiaRow({
        id: p.id,
        fechaPago: p.fechaPago,
        clienteNombre: p.cliente?.nombre ?? 'Sin cliente',
        metodoPago: p.metodoPago,
        monto: p.monto,
        usuarioNombre: p.usuario?.nombre ?? 'Sin usuario',
    }),
    );
}