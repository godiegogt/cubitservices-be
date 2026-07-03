import { EstadoPago } from "@prisma/client";
import { startOfDay, endOfDay } from "../../../common/utils/datetime";
import { ReportePagosFilters, ReportePagosResponse } from "./pagos-report.dto";
import {
  queryPagosReporte,
  queryPagosReportePage,
  countPagosReporte,
  queryPagosReporteSummary,
} from "./pagos-report.query";
import {
  buildReportePagosResponsePage,
  buildReportePagosResponseFull,
} from "./pagos-report.mapper";

export async function generarReportePagos(
  empresaId: string,
  filters: ReportePagosFilters,
  page: number,
  pageSize: number,
): Promise<ReportePagosResponse> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(100, Math.max(1, pageSize));
  const queryFilters = buildQueryFilters(filters);
  const skip = (safePage - 1) * safePageSize;

  const [pagos, total, summary] = await Promise.all([
    queryPagosReportePage(empresaId, queryFilters, skip, safePageSize),
    countPagosReporte(empresaId, queryFilters),
    queryPagosReporteSummary(empresaId, queryFilters),
  ]);

  return buildReportePagosResponsePage(
    pagos,
    filters,
    summary,
    safePage,
    safePageSize,
    total,
  );
}

export async function generarReportePagosCompleto(
  empresaId: string,
  filters: ReportePagosFilters,
): Promise<ReportePagosResponse> {
  const pagos = await queryPagosReporte(empresaId, buildQueryFilters(filters));

  return buildReportePagosResponseFull(pagos, filters);
}

function buildQueryFilters(filters: ReportePagosFilters) {
  return {
    fechaInicio: filters.fechaInicio
      ? startOfDay(filters.fechaInicio) : undefined,
    fechaFin: filters.fechaFin ? endOfDay(filters.fechaFin) : undefined,
    clienteId: filters.clienteId,
    codigoCliente: filters.codigoCliente,
    nombreCliente: filters.nombreCliente,
    zona: filters.zona,
    metodoPagoId: filters.metodoPagoId,
    estado: filters.estado as EstadoPago | undefined,
    usuarioRegistradorId: filters.usuarioRegistradorId,
    referencia: filters.referencia,
  };
}
