import { getOrdenes, getOrdenesPorEstado, FiltrosOrdenes } from './ordenes-dashboard.query';
import { toOrdenRow, toKpisOrdenes, toDashboardOrdenesResponse } from './ordenes-dashboard.mapper';
import { DashboardOrdenesResponse } from '../common/dashboard.dto';

function inicioDia(fecha: Date): Date {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    return d;
}

function finDia(fecha: Date): Date {
    const d = new Date(fecha);
    d.setHours(23, 59, 59, 999);
    return d;
}

export async function getDashboardOrdenes(
    fechaDesdeStr?: string,
    fechaHastaStr?: string,
    zona?: number,
    proximasAEjecutar?: boolean,
): Promise<DashboardOrdenesResponse> {
    const hoy = new Date();
    const desde = inicioDia(fechaDesdeStr ? new Date(`${fechaDesdeStr}T00:00:00`) : hoy);
    const hasta = finDia(fechaHastaStr ? new Date(`${fechaHastaStr}T00:00:00`) : desde);

    const filtros: FiltrosOrdenes = { desde, hasta, zona, proximasAEjecutar };

    const [rawOrdenes, porEstado] = await Promise.all([
        getOrdenes(filtros),
        getOrdenesPorEstado(filtros),
    ]);

    const kpis = toKpisOrdenes(porEstado);
    const ordenes = rawOrdenes.map(toOrdenRow);

    return toDashboardOrdenesResponse(kpis, ordenes);
}
