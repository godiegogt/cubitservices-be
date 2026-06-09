import { EstadoPago } from "@prisma/client";
import { ReporteFormato, ReportePagosFilters } from "../common/reporte.types";
import { queryPagosReporte } from "./pagos-report.query";
import {
    buildReportePagosResult,
    buildReportePagosResultFull,
} from "./pagos-report.mapper";

export async function generarReportePagos(
    empresaId: string,
    filters: ReportePagosFilters,
    formato: ReporteFormato
) {
    const pagos = await queryPagosReporte(empresaId, {
    fechaInicio: new Date(`${filters.fechaInicio}T00:00:00.000Z`),
    fechaFin: new Date(`${filters.fechaFin}T23:59:59.999Z`),
    clienteId: filters.clienteId,
    metodoPagoId: filters.metodoPagoId,
    estado: filters.estado as EstadoPago | undefined,
    usuarioRegistradorId: filters.usuarioRegistradorId,
    referencia: filters.referencia,
    });

    if (formato === "pdf" || formato === "xlsx") {
    return buildReportePagosResultFull(pagos, filters);
    }

    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(500, Math.max(1, filters.pageSize ?? 50));

    return buildReportePagosResult(pagos, filters, page, pageSize);
}
