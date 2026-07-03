import { EstadoOrdenServicio, PrioridadOrden, OrigenOrden } from "@prisma/client";

export interface OrdenesReportFilters {
    estado?: EstadoOrdenServicio;
    tipoOrden?: string;
    tecnicoId?: string;
    zonaId?: number;
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
    ubicacion: { id: string; nombre: string; zona: number | null };
    tecnico: { id: string; nombre: string } | null;
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
