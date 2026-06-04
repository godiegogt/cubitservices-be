import {
    getTotalCobradoHoy,
    getPagosRegistradosHoy,
    getDiferenciaCaja,
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
): Promise<DashboardCajeroResponse> {
    const totalCobradoHoy = await getTotalCobradoHoy(empresaId);
    const pagosRegistrados = await getPagosRegistradosHoy(empresaId);
    const diferenciaCaja = await getDiferenciaCaja(empresaId, totalCobradoHoy);
    const cobroPorMetodo = await getCobroPorMetodo(empresaId);
    const rawPagosDia = await getPagosDia(empresaId);

    const kpis = toKpis(totalCobradoHoy, pagosRegistrados, diferenciaCaja);
    const resumen = toResumen(cobroPorMetodo);
    const pagosDia = rawPagosDia.map(toPagoDiaRow);

    return toDashboardCajeroResponse(kpis, resumen, pagosDia);
}