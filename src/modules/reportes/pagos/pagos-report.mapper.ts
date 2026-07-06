import { EstadoPago, Prisma } from "@prisma/client";
import { formatDate } from "../../../common/utils/datetime";
import {
  AplicacionPagoDto,
  ReportePagoRow,
  ReportePagosSummary,
  ReportePagosFilters,
  ReportePagosResponse,
} from "./pagos-report.dto";
import { PagoReporteItem } from "./pagos-report.query";

function decimalToNumber(value: Prisma.Decimal): number {
  return value.toNumber();
}

function sumAplicaciones(
  aplicaciones: { montoAplicado: Prisma.Decimal }[],
): number {
  return aplicaciones
    .reduce((acc, a) => acc.plus(a.montoAplicado), new Prisma.Decimal(0))
    .toNumber();
}

export function mapToRow(pago: PagoReporteItem): ReportePagoRow {
  const montoRecibido = decimalToNumber(pago.montoTotal);
  const montoAplicado = +sumAplicaciones(pago.aplicaciones).toFixed(2);
  const montoDisponible = pago.estado === EstadoPago.ANULADO ? 0 : +(montoRecibido - montoAplicado).toFixed(2);

  const aplicaciones: AplicacionPagoDto[] = pago.aplicaciones.map((a) => ({
    cargoId: a.cargo.id,
    concepto: a.cargo.concepto,
    tipoCargo: a.cargo.tipoCargo,
    periodoReferencia: a.cargo.periodoReferencia ?? null,
    montoOriginalCargo: decimalToNumber(a.cargo.monto),
    montoAplicado: decimalToNumber(a.montoAplicado),
    fechaEmisionCargo: formatDate(a.cargo.fechaEmision),
    fechaVencimientoCargo: a.cargo.fechaVencimiento
      ? formatDate(a.cargo.fechaVencimiento)
      : null,
    estadoCargo: a.cargo.estado,
  }));

  return {
    id: pago.id,
    fechaPago: formatDate(pago.fechaPago),
    cliente: {
      id: pago.cliente.id,
      codigo: pago.cliente.codigo,
      nombre: pago.cliente.nombreRazonSocial,
    },
    metodoPago: {
      id: pago.metodoPago.id,
      nombre: pago.metodoPago.nombre,
    },
    montoRecibido,
    montoAplicado,
    montoDisponible,
    referencia: pago.referencia,
    estado: pago.estado,
    registradoPor: {
      id: pago.registradoBy.id,
      nombre: [pago.registradoBy.nombres, pago.registradoBy.apellidos]
        .filter(Boolean)
        .join(" "),
    },
    aplicaciones,
  };
}

function calcularSummary(rows: ReportePagoRow[]): ReportePagosSummary {
  const rowsConfirmados = rows.filter(
    (r) => r.estado === EstadoPago.CONFIRMADO,
  );

  const totalRecibido = +rowsConfirmados
    .reduce((acc, r) => acc + r.montoRecibido, 0)
    .toFixed(2);

  const totalAplicado = +rowsConfirmados
    .reduce((acc, r) => acc + r.montoAplicado, 0)
    .toFixed(2);

  return {
    totalRecibido,
    totalAplicado,
    totalDisponible: +(totalRecibido - totalAplicado).toFixed(2),
    cantidadPagos: rows.length,
    pagosAnulados: rows.filter((r) => r.estado === EstadoPago.ANULADO).length,
  };
}

export function buildReportePagosResponsePage(
  pagos: PagoReporteItem[],
  filters: ReportePagosFilters,
  summary: ReportePagosSummary,
  page: number,
  pageSize: number,
  total: number,
): ReportePagosResponse {
  return {
    filters,
    summary,
    data: pagos.map(mapToRow),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
}

export function buildReportePagosResponseFull(
  pagos: PagoReporteItem[],
  filters: ReportePagosFilters,
): ReportePagosResponse {
  const allRows = pagos.map(mapToRow);
  const summary = calcularSummary(allRows);
  const total = allRows.length;

  return {
    filters,
    summary,
    data: allRows,
    pagination: {
      page: 1,
      pageSize: total || 1,
      total,
      totalPages: 1,
    },
  };
}
