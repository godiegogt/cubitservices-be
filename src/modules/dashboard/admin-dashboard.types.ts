export interface DashboardFilters {
    fechaDesde: string;
    fechaHasta: string;
    zona: number | null;
}

export interface DashboardKpis {
    cobradoPeriodo: number;
    carteraPendiente: number;
    serviciosSuspendidos: number;
    ordenesPendientes: number;
    metaCobranza: number;
}

export interface IngresoPeriodoRow {
    fecha: string;
    total: number;
}

export interface IngresoZonaRow {
    zona: string;
    usuarios: number;
    esperado: number;
    ingreso: number;
    porcentaje: number;
}

export interface OrdenEstadoRow {
    estado: string;
    cantidad: number;
}

export interface DashboardAlert {
    tipo: "MOROSIDAD" | "SUSPENSION" | "ORDEN_VENCIDA" | "META_COBRANZA";
    titulo: string;
    descripcion: string;
    valor: number;
}

export interface DashboardAdminResponse {
    filters: DashboardFilters;
    kpis: DashboardKpis;
    ingresosPeriodo: IngresoPeriodoRow[];
    ingresosPorZona: IngresoZonaRow[];
    ordenesEstado: OrdenEstadoRow[];
    alertas: DashboardAlert[];
}
