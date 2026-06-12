export interface ClienteReportItemDto {
    id: string;
    codigo: string;
    nombre: string;
    tipoCliente: string;
    identificacion: string | null;
    telefono: string | null;
    email: string | null;
    estado: string;
    totalCuentas: number;
    fechaRegistro: string;
}

export interface ClientesResumenDto {
    totalClientes: number;
    activos: number;
    inactivos: number;
}

export interface ClientesFiltrosDto {
    estado?: string;
    zonaId?: number;
    servicioId?: string;
    search?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface ClientesReportResultDto {
    filtros: ClientesFiltrosDto;
    resumen: ClientesResumenDto;
    items: ClienteReportItemDto[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}
