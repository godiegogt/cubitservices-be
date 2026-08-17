import {
    contarPendientes,
    contarProgramadas,
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
import { formatDate, startOfDay, endOfDay } from '../../../common/utils/datetime';

export async function getOrdenesDashboard(
    empresaId: string,
    query: OrdenesDashboardQuery,
): Promise<OrdenesDashboardResponse> {
    const hoy = formatDate(new Date());
    const fechaDesde = query.fechaDesde ?? hoy;
    const fechaHasta = query.fechaHasta ?? fechaDesde;
    const desde = startOfDay(fechaDesde);
    const hasta = endOfDay(fechaHasta);
    const ahora = new Date();

    const fechaHastaExplicita = query.fechaHasta ?? query.fechaDesde;
    const desdeExplicita = query.fechaDesde ? startOfDay(query.fechaDesde) : undefined;
    const hastaExplicita = fechaHastaExplicita ? endOfDay(fechaHastaExplicita) : undefined;

    const kpiFilters = { empresaId, desde, hasta, ahora, desdeExplicita, hastaExplicita, zona: query.zona, aldea: query.aldea };

    const dataFilters = {
        empresaId,
        desde,
        hasta,
        ahora,
        desdeExplicita,
        hastaExplicita,
        estado: query.estado,
        prioridad: query.prioridad,
        clienteId: query.clienteId,
        tipoServicioId: query.tipoServicioId,
        responsableId: query.responsableId,
        search: query.search,
        zona: query.zona,
        aldea: query.aldea,
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
        contarPendientes(kpiFilters),
        contarProgramadas(kpiFilters),
        contarEnProceso(kpiFilters),
        contarVencidas(kpiFilters),
        getOrdenesPorEstado(dataFilters),
        getProximasAEjecutar({ empresaId, zona: query.zona, aldea: query.aldea }),
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
        responsableId: query.responsableId,
        search: query.search,
        zona: query.zona,
        aldea: query.aldea,
        page: query.page,
        pageSize: query.pageSize,
    };

    const kpis = { ordenesPendientes, programadasHoy, enProceso, vencidas };
    const ordenesPorEstado = toChartRows(rawPorEstado);
    const proximasAEjecutar = rawProximas.map(toProximaRow);
    const data = rawData.map((raw) => toOrdenRow(raw, ahora));
    const totalPages = Math.ceil(total / query.pageSize);

    return toResponse(filters, kpis, ordenesPorEstado, proximasAEjecutar, data, {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
    });
}
