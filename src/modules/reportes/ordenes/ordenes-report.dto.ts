import { EstadoOrdenServicio, PrioridadOrden, OrigenOrden, RolEnOrden } from "@prisma/client";

export interface OrdenesReportFilters {
    estado?: EstadoOrdenServicio;
    tipoServicioId?: string;
    tecnicoId?: string;
    zonaId?: string;
    fechaInicio?: string;
    fechaFin?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface OrdenReportItemDto {
    id: string;
    numeroOrden: string;
    titulo: string;
    estado: EstadoOrdenServicio;
    prioridad: PrioridadOrden;
    origen: OrigenOrden;
    fechaProgramada: string | null;
    fechaInicio: string | null;
    fechaCierre: string | null;
    cliente: { id: string; codigo: string; nombre: string };
    tipoServicio: { id: string; nombre: string };
    ubicacion: {
        direccion: string,
    };
    asignados: { id: string; nombre: string; rol: RolEnOrden }[];
    createdAt: string;
}

export interface OrdenesReportSummaryDto {
    totalOrdenes: number;
    pendientes: number;
    enProceso: number;
    completadas: number;
    vencidas: number;
}

export interface OrdenesReportResultDto {
    filters: Omit<OrdenesReportFilters, "page" | "pageSize">;
    summary: OrdenesReportSummaryDto;
    data: OrdenReportItemDto[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}
