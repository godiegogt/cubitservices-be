import {
    getTotalCobradoHoy,
    getTotalCobradoAyer,
    getPagosRegistradosHoy,
    getPagosRegistradosAyer,
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

    const [totalCobradoHoy, totalCobradoAyer, pagosRegistrados, pagosRegistradosAyer, cobroPorMetodo, rawPagosDia] =
        await Promise.all([
            getTotalCobradoHoy(empresaId, fecha),
            getTotalCobradoAyer(empresaId, fecha),
            getPagosRegistradosHoy(empresaId, fecha),
            getPagosRegistradosAyer(empresaId, fecha),
            getCobroPorMetodo(empresaId, fecha),
            getPagosDia(empresaId, fecha),
        ]);

    const kpis = toKpis(totalCobradoHoy, totalCobradoAyer, pagosRegistrados, pagosRegistradosAyer);
    const resumen = toResumen(cobroPorMetodo);
    const pagosDia = rawPagosDia.map(toPagoDiaRow);

    return toDashboardCajeroResponse(kpis, resumen, pagosDia);
}