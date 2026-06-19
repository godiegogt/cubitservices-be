export interface PagoDashboardFilters {
    fechaDesde: string;
    fechaHasta: string;
    clienteId?: string;
    metodoPagoId?: string;
    estado?: string;
}

export interface PagoDashboardRow {
    id: string;
    fecha: string;
    hora: string;
    cliente: string;
    metodoPago: string;
    monto: number;
    referencia: string | null;
    estado: string;
    registradoPor: string;
}

export interface PagoDashboardResponse {
    filters: PagoDashboardFilters;
    kpis: {
        totalCobrado: number;
        pagosRegistrados: number;
        pagosPendientes: number;
        pagosAnulados: number;
    };
    pagosRecientes: PagoDashboardRow[];
}
