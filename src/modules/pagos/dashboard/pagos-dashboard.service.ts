import { sumCobrado, contarPagos, getPagosRecientes, TODOS, REGISTRADO, ANULADO } from './pagos-dashboard.query';
import { toKpis, toPagoRow, toResponse } from './pagos-dashboard.mapper';
import { PagoDashboardResponse } from './pagos-dashboard.dto';
import { DashboardQuery } from './pagos-dashboard.schema';
import { formatDate } from '../../../common/utils/datetime';

export async function getPagosDashboard(
    empresaId: string,
    query: DashboardQuery,
): Promise<PagoDashboardResponse> {
    const hoy = formatDate(new Date());
    const fechaDesde = query.fechaDesde ?? hoy;
    const fechaHasta = query.fechaHasta ?? fechaDesde;
    const desde = new Date(`${fechaDesde}T00:00:00.000Z`);
    const hasta = new Date(`${fechaHasta}T00:00:00.000Z`);
    hasta.setUTCDate(hasta.getUTCDate() + 1);

    const baseFilters = {
        empresaId,
        desde,
        hasta,
        clienteId: query.clienteId,
        metodoPagoId: query.metodoPagoId,
    };

    const [totalCobrado, pagosRegistrados, pagosPendientes, pagosAnulados, rawRecientes] =
        await Promise.all([
            sumCobrado(baseFilters),
            contarPagos(baseFilters, TODOS),
            contarPagos(baseFilters, REGISTRADO),
            contarPagos(baseFilters, ANULADO),
            getPagosRecientes(baseFilters, query.estado),
        ]);

    const filters = {
        fechaDesde,
        fechaHasta,
        clienteId: query.clienteId,
        metodoPagoId: query.metodoPagoId,
        estado: query.estado,
    };

    const kpis = toKpis(totalCobrado, pagosRegistrados, pagosPendientes, pagosAnulados);
    const pagosRecientes = rawRecientes.map(toPagoRow);

    return toResponse(filters, kpis, pagosRecientes);
}
