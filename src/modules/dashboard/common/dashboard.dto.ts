export interface DashboardCajeroKpis {
    totalCobradoHoy: number;
    totalCobradoAyer: number;
    variacionTotal: number;
    pagosRegistrados: number;
    pagosRegistradosAyer: number;
    variacionPagos: number;
    pagosPendientes: number;
    pagosPendientesAyer: number;
    variacionPendientes: number;
    pagosAnulados: number;
    pagosAnuladosAyer: number;
    variacionAnulados: number;
}

export interface DashboardCajeroResumen {
    cobroPorMetodo: {
    metodo: string;
    total: number;
    }[];
}

export interface PagoDiaRow {
    id: string;
    fecha: string;
    cliente: string;
    metodoPago: string;
    monto: number;
    usuario: string;
}

export interface DashboardCajeroResponse {
    kpis: DashboardCajeroKpis;
    resumen: DashboardCajeroResumen;
    pagosDia: PagoDiaRow[];
}

// Órdenes
export interface DashboardOrdenesKpis {
    total: number;
    porEstado: { estado: string; cantidad: number }[];
}

export interface OrdenRow {
    id: string;
    numeroOrden: string;
    titulo: string;
    cliente: string;
    estado: string;
    prioridad: string;
    fechaProgramada: string | null;
    zona: number | null;
}

export interface DashboardOrdenesResponse {
    kpis: DashboardOrdenesKpis;
    ordenes: OrdenRow[];
}
