import {
    contarPendientes,
    contarProgramadasHoy,
    contarEnProceso,
    contarVencidas,
    getOrdenesPorEstado,
    getProximasAEjecutar,
    getOrdenes,
    contarOrdenes,
} from './ordenes-dashboard.query';
import { toOrdenRow, toProximaRow, toChartRows, toResponse } from './ordenes-dashboard.mapper';
import { OrdenesDashboardResponse } from './dashboard.dto';
import { OrdenesDashboardQuery } from './ordenes-dashboard.schema';

export async function getOrdenesDashboard(
    empresaId: string,
    query: OrdenesDashboardQuery,
): Promise<OrdenesDashboardResponse> {
    const hoy = new Date().toISOString().split('T')[0];
    const fechaDesde = query.fechaDesde ?? hoy;
    const fechaHasta = query.fechaHasta ?? fechaDesde;
    const desde = new Date(`${fechaDesde}T00:00:00.000Z`);
    const hasta = new Date(`${fechaHasta}T23:59:59.999Z`);

    const inicioDiaHoy = new Date(`${hoy}T00:00:00.000Z`);
    const finDiaHoy = new Date(`${hoy}T23:59:59.999Z`);

    const dataFilters = {
        empresaId,
        desde,
        hasta,
        ahora: inicioDiaHoy,
        estado: query.estado,
        prioridad: query.prioridad,
        clienteId: query.clienteId,
        tipoServicioId: query.tipoServicioId,
        zona: query.zona,
    };

    const skip = (query.page - 1) * query.pageSize;

    const [
        ordenesPendientes,
        programadasHoy,
        enProceso,
        vencidas,
        rawPorEstado,
        rawProximas,
        rawData,
        total,
    ] = await Promise.all([
        contarPendientes(empresaId),
        contarProgramadasHoy(empresaId, inicioDiaHoy, finDiaHoy),
        contarEnProceso(empresaId),
        contarVencidas(empresaId, inicioDiaHoy),
        getOrdenesPorEstado(dataFilters),
        getProximasAEjecutar(empresaId),
        getOrdenes(dataFilters, skip, query.pageSize),
        contarOrdenes(dataFilters),
    ]);

    const filters = {
        fechaDesde,
        fechaHasta,
        estado: query.estado,
        prioridad: query.prioridad,
        clienteId: query.clienteId,
        tipoServicioId: query.tipoServicioId,
        zona: query.zona,
    };

    const kpis = { ordenesPendientes, programadasHoy, enProceso, vencidas };
    const ordenesPorEstado = toChartRows(rawPorEstado);
    const proximasAEjecutar = rawProximas.map(toProximaRow);
    const data = rawData.map(toOrdenRow);
    const totalPages = Math.ceil(total / query.pageSize);

    return toResponse(filters, kpis, ordenesPorEstado, proximasAEjecutar, data, {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
    });
}
