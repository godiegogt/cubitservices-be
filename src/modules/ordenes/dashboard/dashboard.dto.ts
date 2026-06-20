export interface OrdenesDashboardFilters {
    fechaDesde: string;
    fechaHasta: string;
    estado?: string;
    prioridad?: string;
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
    fechaProgramada: string | null;
    prioridad: string;
    responsable: string | null;
}

export interface OrdenDashboardRow {
    id: string;
    numeroOrden: string;
    titulo: string;
    cliente: string;
    estado: string;
    prioridad: string;
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
