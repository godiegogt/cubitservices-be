import { EstadoRegistroBasico } from "@prisma/client";

export interface ZonaServiciosDto {
    zona: string | null;
    servicios: string[];
}

export interface ClienteReportItemDto {
    id: string;
    codigo: string;
    nombre: string;
    tipoCliente: string;
    identificacion: string | null;
    telefono: string | null;
    email: string | null;
    zonas: ZonaServiciosDto[];
    cuentas: string[];
    estado: EstadoRegistroBasico;
    totalCuentas: number;
    fechaRegistro: string;
}

export interface ClientesSummaryDto {
    totalClientes: number;
    activos: number;
    inactivos: number;
}

export interface ClientesReportFilters {
    estado?: EstadoRegistroBasico;
    zonaId?: string;
    aldea?: string;
    servicioId?: string;
    fechaInicio?: string;
    fechaFin?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    fetchAll?: boolean;
}

export interface ClientesReportResultDto {
    filters: Omit<ClientesReportFilters, "page" | "pageSize" | "fetchAll">;
    summary: ClientesSummaryDto;
    data: ClienteReportItemDto[];
    pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}
