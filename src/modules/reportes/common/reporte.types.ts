export interface ReportePagosFilters {
    fechaInicio: string;
    fechaFin: string;
    clienteId?: string;
    codigoCliente?: string;
    nombreCliente?: string;
    metodoPagoId?: string;
    estado?: "REGISTRADO" | "CONFIRMADO" | "ANULADO";
    usuarioRegistradorId?: string;
    referencia?: string;
    page?: number;
    pageSize?: number;
}

export type ReporteFormato = "json" | "pdf" | "xlsx";
