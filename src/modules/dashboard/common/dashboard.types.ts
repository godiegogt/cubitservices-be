export interface DashboardCajeroKpis {
    totalCobradoHoy: number;
    pagosRegistrados: number;
    diferenciaCaja: number;
}

export interface CobroPorMetodo {
    metodo: string;
    total: number;
}

export interface DashboardCajeroResumen {
    cobroPorMetodo: CobroPorMetodo[];
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