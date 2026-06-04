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
