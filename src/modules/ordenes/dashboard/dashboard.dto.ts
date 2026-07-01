export interface OrdenesDashboardFilters {
    fechaDesde: string;
    fechaHasta: string;
    estado?: "PENDIENTE" | "PROGRAMADA" | "EN_PROCESO" | "PAUSADA" | "FINALIZADA" | "CANCELADA" | "VENCIDA";
    prioridad?: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
    clienteId?: string;
    tipoServicioId?: string;
    zona?: number;
}

export interface OrdenEstadoChartRow {
    estado: string;
    cantidad: number;
    porcentaje: number;
}

export interface OrdenProximaRow {
    id: string;
    numeroOrden: string;
    titulo: string;
    cliente: string;
    servicio: string;
    fechaProgramada: string | null;
    prioridad: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
    responsable: string | null;
}

export interface OrdenDashboardRow {
    id: string;
    numeroOrden: string;
    titulo: string;
    cliente: string;
    servicio: string;
    estado: "PENDIENTE" | "PROGRAMADA" | "EN_PROCESO" | "PAUSADA" | "FINALIZADA" | "CANCELADA";
    prioridad: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
    fechaProgramada: string | null;
    zona: number | null;
    responsable: string | null;
}

export interface OrdenesDashboardResponse {
    filters: OrdenesDashboardFilters;

    kpis: {
        ordenesPendientes: number;
        programadasHoy: number;
        enProceso: number;
        vencidas: number;
    };

    charts: {
        ordenesPorEstado: OrdenEstadoChartRow[];
    };

    proximasAEjecutar: OrdenProximaRow[];

    data: OrdenDashboardRow[];

    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}
