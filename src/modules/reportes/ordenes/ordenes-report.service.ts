import { OrdenesReportFilters, OrdenesReportResultDto } from "./ordenes-report.dto";
import { queryOrdenesReport } from "./ordenes-report.query";
import { mapOrdenesReportResult } from "./ordenes-report.mapper";

export async function generarReporteOrdenes(
    empresaId: string,
    filters: OrdenesReportFilters
): Promise<OrdenesReportResultDto> {
    const queryResult = await queryOrdenesReport(empresaId, filters);
    return mapOrdenesReportResult(filters, queryResult);
}
