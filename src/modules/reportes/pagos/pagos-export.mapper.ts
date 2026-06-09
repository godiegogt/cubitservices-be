import { ReportePagosResultDto } from "../common/reportes.dto";

export interface PagosExcelRow {
    fecha: string;
    codigo: string;
    cliente: string;
    metodoPago: string;
    referencia: string;
    estado: string;
    montoTotal: number;
    montoAplicado: number;
    montoNoAplicado: number;
    registradoPor: string;
}

export function buildPagosExcelRows(
    report: ReportePagosResultDto
): PagosExcelRow[] {
    return report.items.map((item) => ({
    fecha: item.fechaPago,
    codigo: item.cliente.codigo,
    cliente: item.cliente.nombre,
    metodoPago: item.metodoPago.nombre,
    referencia: item.referencia ?? "-",
    estado: item.estado,
    montoTotal: item.montoTotal,
    montoAplicado: item.montoAplicado,
    montoNoAplicado: item.montoNoAplicado,
    registradoPor: item.registradoPor.nombre,
    }));
}
