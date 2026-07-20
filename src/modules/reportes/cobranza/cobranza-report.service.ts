import { startOfDay, endOfDay } from "../../../common/utils/datetime";
import { CobranzaReportFilters, CobranzaReportKpis, CobranzaReportResponse } from "./cobranza-report.dto";
import {
    getCobranzaRows,
    getCobranzaRowsAll,
    countCobranzaRows,
    getTotalPendiente,
    getCuentasPendientes,
    CobranzaQueryFilters,
} from "./cobranza-report.query";
import { buildCobranzaReportResponse } from "./cobranza-report.mapper";

function buildQueryFilters(filters: CobranzaReportFilters): CobranzaQueryFilters {
    return {
    ...filters,
    fechaInicio: filters.fechaInicio ? startOfDay(filters.fechaInicio) : undefined,
    fechaFin: filters.fechaFin ? endOfDay(filters.fechaFin) : undefined,
    };
}

async function getKpis(
    empresaId: string,
    filters: CobranzaQueryFilters,
): Promise<CobranzaReportKpis> {
    const [totalPendiente, cuentasPendientes] =
    await Promise.all([
        getTotalPendiente(empresaId, filters),
        getCuentasPendientes(empresaId, filters),
    ]);

    return { totalPendiente, cuentasPendientes };
}

export async function getCobranzaReport(
    empresaId: string,
    filters: CobranzaReportFilters,
    page: number,
    pageSize: number,
): Promise<CobranzaReportResponse> {
    const safePage = Math.max(1, page);
    const safePageSize = Math.min(100, Math.max(1, pageSize));
    const queryFilters = buildQueryFilters(filters);
    const skip = (safePage - 1) * safePageSize;

    const [rows, total, kpis] = await Promise.all([
    getCobranzaRows(empresaId, queryFilters, skip, safePageSize),
    countCobranzaRows(empresaId, queryFilters),
    getKpis(empresaId, queryFilters),
    ]);

    return buildCobranzaReportResponse(rows, kpis, safePage, safePageSize, total);
}

export async function getCobranzaReportCompleto(
    empresaId: string,
    filters: CobranzaReportFilters,
): Promise<CobranzaReportResponse> {
    const queryFilters = buildQueryFilters(filters);
    const [rows, kpis] = await Promise.all([
    getCobranzaRowsAll(empresaId, queryFilters),
    getKpis(empresaId, queryFilters),
    ]);

    const total = rows.length;

    return buildCobranzaReportResponse(rows, kpis, 1, total || 1, total);
}
