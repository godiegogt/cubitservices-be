export interface ReportePagoItemDto {
    id: string;
    fechaPago: string;
    cliente: { id: string; codigo: string; nombre: string };
    metodoPago: { id: string; nombre: string };
    referencia: string | null;
    estado: string;
    montoTotal: number;
    montoAplicado: number;
    montoNoAplicado: number;
    registradoPor: { id: string; nombre: string };
}

export interface ReportePagosPorMetodoPagoDto {
    metodoPago: string;
    cantidad: number;
    total: number;
}

export interface ReportePagosResumenDto {
    totalPagos: number;
    totalCobrado: number;
    totalAplicado: number;
    totalNoAplicado: number;
}

export interface ReportePagosFiltrosDto {
    fechaInicio: string;
    fechaFin: string;
    clienteId?: string;
    metodoPagoId?: string;
    estado?: string;
}

export interface ReportePagosResultDto {
    filtros: ReportePagosFiltrosDto;
    resumen: ReportePagosResumenDto;
    porMetodoPago: ReportePagosPorMetodoPagoDto[];
    items: ReportePagoItemDto[];
    meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    };
}
