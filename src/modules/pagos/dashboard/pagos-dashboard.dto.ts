import { EstadoPago } from "@prisma/client";

export interface PagoDashboardFilters {
    fechaDesde: string;
    fechaHasta: string;
    clienteId?: string;
    metodoPagoId?: string;
    estado?: EstadoPago;
}

export interface PagoDashboardRow {
    id: string;
    fecha: string;
    hora: string;
    cliente: string;
    metodoPago: string;
    monto: number;
    referencia: string | null;
    estado: EstadoPago;
    registradoPor: string;
}

export interface PagoDashboardResponse {
    filters: PagoDashboardFilters;
    kpis: {
        totalCobrado: number;
        pagosRegistrados: number;
        pagosPendientes: number;
        pagosAnulados: number;
    };
    pagosRecientes: PagoDashboardRow[];
}
