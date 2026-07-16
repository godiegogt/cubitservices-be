import { CobranzaReportFilters, CobranzaReportKpis, CobranzaReportResponse } from "./cobranza-report.dto";
import {
    getCobranzaRows,
    getCobranzaRowsAll,
    countCobranzaRows,
    getTotalPendiente,
    getCuentasPendientes,
} from "./cobranza-report.query";
import { buildCobranzaReportResponse } from "./cobranza-report.mapper";

async function getKpis(
    empresaId: string,
    filters: CobranzaReportFilters,
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
    const skip = (safePage - 1) * safePageSize;

    const [rows, total, kpis] = await Promise.all([
    getCobranzaRows(empresaId, filters, skip, safePageSize),
    countCobranzaRows(empresaId, filters),
    getKpis(empresaId, filters),
    ]);

    return buildCobranzaReportResponse(rows, kpis, safePage, safePageSize, total);
}

export async function getCobranzaReportCompleto(
    empresaId: string,
    filters: CobranzaReportFilters,
): Promise<CobranzaReportResponse> {
    const [rows, kpis] = await Promise.all([
    getCobranzaRowsAll(empresaId, filters),
    getKpis(empresaId, filters),
    ]);

    const total = rows.length;

    return buildCobranzaReportResponse(rows, kpis, 1, total || 1, total);
}
