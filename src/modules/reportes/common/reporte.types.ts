export interface ReportePagosFilters {
    fechaInicio: string;
    fechaFin: string;
    clienteId?: string;
    metodoPagoId?: string;
    estado?: "REGISTRADO" | "CONFIRMADO" | "ANULADO";
    usuarioRegistradorId?: string;
    referencia?: string;
    page?: number;
    pageSize?: number;
}

export interface ClientesReportFilters {
    estado?: string;
    zonaId?: number;
    servicioId?: string;
    fechaInicio?: string;
    fechaFin?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    fetchAll?: boolean;
}

export type ReporteFormato = "json" | "pdf" | "xlsx";
