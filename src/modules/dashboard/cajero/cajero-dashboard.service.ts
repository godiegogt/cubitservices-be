import {
    getTotalCobrado,
    contarPagos,
    getCobroPorMetodo,
    getPagosDia,
    ACTIVOS,
    PENDIENTES,
    ANULADOS,
} from './cajero-dashboard.query';
import {
    toKpis,
    toResumen,
    toPagoDiaRow,
    toDashboardCajeroResponse,
} from './cajero-dashboard.mapper';
import { DashboardCajeroResponse } from '../common/dashboard.dto';
import { generarPdfPagosDia } from './cajero-dashboard.report';

const MS_POR_DIA = 86_400_000;

function inicioDia(fecha: Date): Date {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    return d;
}

function finDia(fecha: Date): Date {
    const d = new Date(fecha);
    d.setHours(23, 59, 59, 999);
    return d;
}

function restarDias(fecha: Date, dias: number): Date {
    return new Date(fecha.getTime() - dias * MS_POR_DIA);
}

function parsearPeriodo(fechaDesdeStr?: string, fechaHastaStr?: string): { desde: Date; hasta: Date } {
    const hoy = new Date();
    const desde = inicioDia(fechaDesdeStr ? new Date(`${fechaDesdeStr}T00:00:00`) : hoy);
    const hasta = finDia(fechaHastaStr ? new Date(`${fechaHastaStr}T00:00:00`) : desde);
    return { desde, hasta };
}

function periodoPrevio(desde: Date, hasta: Date): { desde: Date; hasta: Date } {
    const duracion = Math.round((hasta.getTime() - desde.getTime()) / MS_POR_DIA) + 1;
    return {
        desde: inicioDia(restarDias(desde, duracion)),
        hasta: finDia(restarDias(hasta, duracion)),
    };
}

export async function getReporteCajeroPagosDia(
    empresaId: string,
    fechaDesdeStr?: string,
    fechaHastaStr?: string,
): Promise<Buffer> {
    const { desde, hasta } = parsearPeriodo(fechaDesdeStr, fechaHastaStr);
    const rawPagosDia = await getPagosDia(empresaId, desde, hasta);
    const pagosDia = rawPagosDia.map(toPagoDiaRow);
    return generarPdfPagosDia(pagosDia, desde, hasta);
}

export async function getDashboardCajero(
    empresaId: string,
    fechaDesdeStr?: string,
    fechaHastaStr?: string,
): Promise<DashboardCajeroResponse> {
    const { desde, hasta } = parsearPeriodo(fechaDesdeStr, fechaHastaStr);
    const { desde: prevDesde, hasta: prevHasta } = periodoPrevio(desde, hasta);

    const [
        totalHoy,
        totalAyer,
        registradosHoy,
        registradosAyer,
        pendientesHoy,
        pendientesAyer,
        anuladosHoy,
        anuladosAyer,
        cobroPorMetodo,
        rawPagosDia,
    ] = await Promise.all([
        getTotalCobrado(empresaId, desde, hasta),
        getTotalCobrado(empresaId, prevDesde, prevHasta),
        contarPagos(empresaId, desde, hasta, ACTIVOS),
        contarPagos(empresaId, prevDesde, prevHasta, ACTIVOS),
        contarPagos(empresaId, desde, hasta, PENDIENTES),
        contarPagos(empresaId, prevDesde, prevHasta, PENDIENTES),
        contarPagos(empresaId, desde, hasta, ANULADOS),
        contarPagos(empresaId, prevDesde, prevHasta, ANULADOS),
        getCobroPorMetodo(empresaId, desde, hasta),
        getPagosDia(empresaId, desde, hasta),
    ]);

    const kpis = toKpis(
        totalHoy, totalAyer,
        registradosHoy, registradosAyer,
        pendientesHoy, pendientesAyer,
        anuladosHoy, anuladosAyer,
    );
    const resumen = toResumen(cobroPorMetodo);
    const pagosDia = rawPagosDia.map(toPagoDiaRow);

    return toDashboardCajeroResponse(kpis, resumen, pagosDia);
}
