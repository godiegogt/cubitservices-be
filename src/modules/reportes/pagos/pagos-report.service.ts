import { EstadoPago } from "@prisma/client";
import { ReportePagosFilters, ReportePagosResponse } from "./pagos-report.dto";
import { queryPagosReporte } from "./pagos-report.query";
import {
  buildReportePagosResponse,
  buildReportePagosResponseFull,
} from "./pagos-report.mapper";

export async function generarReportePagos(
  empresaId: string,
  filters: ReportePagosFilters,
  page: number,
  pageSize: number,
): Promise<ReportePagosResponse> {
  const pagos = await queryPagosReporte(empresaId, buildQueryFilters(filters));

  return buildReportePagosResponse(
    pagos,
    filters,
    Math.max(1, page),
    Math.min(100, Math.max(1, pageSize)),
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
      ? new Date(`${filters.fechaInicio}T00:00:00.000Z`)
      : undefined,
    fechaFin: filters.fechaFin
      ? new Date(`${filters.fechaFin}T23:59:59.999Z`)
      : undefined,
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
