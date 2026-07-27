import { formatDateOnly, decimalToNumber  } from "../../../common/utils/datetime";
import {
    CobranzaReportKpis,
    CobranzaReportResponse,
    CobranzaReportRow,
} from "./cobranza-report.dto";
import { CargoReporteItem } from "./cobranza-report.query";

export function mapToRow(cargo: CargoReporteItem): CobranzaReportRow {
    return {
    clienteId: cargo.cliente.id,
    clienteNombre: cargo.cliente.nombreRazonSocial,
    cuentaServicioId: cargo.cuentaServicio.id,
    cuentaServicioNombre: cargo.cuentaServicio.nombre,
    cuentaServicioDireccion: cargo.cuentaServicio.ubicacion?.direccion || "-",
    tipoServicio: cargo.cuentaServicio.tipoServicio.nombre,
    periodo: cargo.periodoReferencia ?? "",
    concepto: cargo.concepto,
    fechaVencimiento: cargo.fechaVencimiento ? formatDateOnly(cargo.fechaVencimiento): "",
    fechaCreacion: cargo.createdAt ? formatDateOnly(cargo.createdAt): "",
    saldoPendiente: decimalToNumber(cargo.saldo),
    estadoCargo: cargo.estado,
    estadoServicio: cargo.cuentaServicio.estado,
    };
}

export function buildCobranzaReportResponse(
    cargos: CargoReporteItem[],
    kpis: CobranzaReportKpis,
    page: number,
    pageSize: number,
    total: number,
): CobranzaReportResponse {
    return {
    kpis,
    rows: cargos.map(mapToRow),
    pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
    },
    };
}
