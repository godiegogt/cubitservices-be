import { EstadoCargo, EstadoCuentaServicio } from "@prisma/client";

export interface CobranzaReportFilters {
    fechaInicio?: string;
    fechaFin?: string;
    codigoCliente?: string;
    nombreCliente?: string;
    estadoCargo?: EstadoCargo[];
    estadoServicio?: EstadoCuentaServicio;
    tipoServicioId?: string;
    zona?: number;
}

export interface CobranzaReportKpis {
    totalPendiente: number;
    cuentasPendientes: number;
}

export interface CobranzaReportRow {
    clienteId: string;
    clienteNombre: string;
    cuentaServicioId: string;
    cuentaServicioNombre: string;
    tipoServicio: string;
    periodo: string;
    concepto: string;
    fechaVencimiento: string;
    saldoPendiente: number;
    estadoCargo: EstadoCargo;
    estadoServicio: EstadoCuentaServicio;
}

export interface PaginationDto {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface CobranzaReportResponse {
    kpis: CobranzaReportKpis;
    rows: CobranzaReportRow[];
    pagination: PaginationDto;
}
