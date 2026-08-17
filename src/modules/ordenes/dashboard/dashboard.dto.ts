import { EstadoOrdenServicio, PrioridadOrden } from "@prisma/client";

export interface OrdenesDashboardFilters {
    fechaDesde: string;
    fechaHasta: string;
    estado?: EstadoOrdenServicio | "VENCIDA";
    prioridad?: PrioridadOrden;
    clienteId?: string;
    tipoServicioId?: string;
    responsableId?: string;
    search?: string;
    zona?: string;
    aldea?: string;
    page: number;
    pageSize: number;
}

export interface OrdenEstadoChartRow {
    estado: EstadoOrdenServicio;
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
    prioridad: PrioridadOrden;
    responsable: OrdenResponsableDto;
}

export interface OrdenDashboardRow {
    id: string;
    numeroOrden: string;
    titulo: string;
    cliente: OrdenClienteDto;
    servicio: OrdenServicioDto;
    estado: EstadoOrdenServicio | "VENCIDA";
    prioridad: PrioridadOrden;
    fechaProgramada: string | null;
    zona: string | null;
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
