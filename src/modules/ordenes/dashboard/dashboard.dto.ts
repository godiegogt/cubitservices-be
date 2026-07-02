export interface OrdenesDashboardFilters {
    fechaDesde: string;
    fechaHasta: string;
    estado?: "PENDIENTE" | "PROGRAMADA" | "EN_PROCESO" | "PAUSADA" | "FINALIZADA" | "CANCELADA" | "VENCIDA";
    prioridad?: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
    clienteId?: string;
    tipoServicioId?: string;
    responsableId?: string;
    zona?: number;
}

export interface OrdenEstadoChartRow {
    estado: string;
    cantidad: number;
    porcentaje: number;
}

export interface OrdenClienteDto {
    id: string;
    nombre: string;
    telefono?: string;
}

export interface OrdenServicioDto {
    id: string;
    nombre: string;
}

export interface OrdenResponsableDto {
    id: string;
    nombre: string;
}

export interface OrdenProximaRow {
    id: string;
    numeroOrden: string;
    titulo: string;
    cliente: OrdenClienteDto;
    servicio: OrdenServicioDto;
    fechaProgramada: string | null;
    prioridad: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
    responsable: OrdenResponsableDto;
}

export interface OrdenDashboardRow {
    id: string;
    numeroOrden: string;
    titulo: string;
    cliente: OrdenClienteDto;
    servicio: OrdenServicioDto;
    estado: "PENDIENTE" | "PROGRAMADA" | "EN_PROCESO" | "PAUSADA" | "FINALIZADA" | "CANCELADA" | "VENCIDA";
    prioridad: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
    fechaProgramada: string | null;
    zona: number | null;
    responsable: OrdenResponsableDto;
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
