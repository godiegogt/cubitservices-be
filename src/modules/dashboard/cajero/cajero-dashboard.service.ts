import {
    getTotalCobradoHoy,
    getTotalCobradoAyer,
    getPagosRegistradosHoy,
    getPagosRegistradosAyer,
    getPagosPendientesHoy,
    getPagosPendientesAyer,
    getPagosAnuladosHoy,
    getPagosAnuladosAyer,
    getCobroPorMetodo,
    getPagosDia,
} from './cajero-dashboard.query';
import {
    toKpis,
    toResumen,
    toPagoDiaRow,
    toDashboardCajeroResponse,
} from './cajero-dashboard.mapper';
import { DashboardCajeroResponse } from '../common/dashboard.dto';

export async function getDashboardCajero(
    empresaId: string,
    fechaStr?: string,
): Promise<DashboardCajeroResponse> {
    const fecha = fechaStr ? new Date(`${fechaStr}T00:00:00`) : new Date();

    const [
        totalCobradoHoy,
        totalCobradoAyer,
        pagosRegistrados,
        pagosRegistradosAyer,
        pagosPendientes,
        pagosPendientesAyer,
        pagosAnulados,
        pagosAnuladosAyer,
        cobroPorMetodo,
        rawPagosDia,
    ] = await Promise.all([
        getTotalCobradoHoy(empresaId, fecha),
        getTotalCobradoAyer(empresaId, fecha),
        getPagosRegistradosHoy(empresaId, fecha),
        getPagosRegistradosAyer(empresaId, fecha),
        getPagosPendientesHoy(empresaId, fecha),
        getPagosPendientesAyer(empresaId, fecha),
        getPagosAnuladosHoy(empresaId, fecha),
        getPagosAnuladosAyer(empresaId, fecha),
        getCobroPorMetodo(empresaId, fecha),
        getPagosDia(empresaId, fecha),
    ]);

    const kpis = toKpis(
        totalCobradoHoy,
        totalCobradoAyer,
        pagosRegistrados,
        pagosRegistradosAyer,
        pagosPendientes,
        pagosPendientesAyer,
        pagosAnulados,
        pagosAnuladosAyer,
    );
    const resumen = toResumen(cobroPorMetodo);
    const pagosDia = rawPagosDia.map(toPagoDiaRow);

    return toDashboardCajeroResponse(kpis, resumen, pagosDia);
}
