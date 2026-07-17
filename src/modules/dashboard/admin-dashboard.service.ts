import { Prisma } from "@prisma/client";
import {
    queryCargosEsperadosPeriodo,
    queryCarteraPendiente,
    queryClientesMorosos,
    queryCobradoPeriodo,
    queryIngresosPeriodo,
    queryIngresosPorZona,
    queryOrdenesPendientes,
    queryOrdenesEstado,
    queryOrdenesVencidas,
    queryServiciosSuspendidos,
} from "./admin-dashboard.query";
import {
    mapAlertas,
    mapFilters,
    mapIngresosPeriodo,
    mapIngresosPorZona,
    mapKpis,
    mapOrdenesEstado,
} from "./admin-dashboard.mapper";
import type { DashboardAdminResponse } from "./admin-dashboard.types";
import type { DashboardQueryInput } from "./admin-dashboard.schema";
import { getDefaultDateRange } from "../../utils/utils";
import { startOfDay, endOfDay, formatDateOnly } from "../../common/utils/datetime";

export async function getAdminDashboard(
    empresaId: string,
    input: DashboardQueryInput
): Promise<DashboardAdminResponse> {
    const defaults = getDefaultDateRange();
    const fechaDesde = input.fechaDesde ? startOfDay(input.fechaDesde) : defaults.desde;
    const fechaHasta = input.fechaHasta ? endOfDay(input.fechaHasta) : defaults.hasta;
    const zona = input.zona;
    const fechaDesdeStr = input.fechaDesde ?? formatDateOnly(defaults.desde);
    const fechaHastaStr = input.fechaHasta ?? formatDateOnly(defaults.hasta);

    const queryFilters = { empresaId, fechaDesde, fechaHasta, zona };

    const [
    cobradoPeriodo,
    carteraPendiente,
    serviciosSuspendidos,
    ordenesPendientes,
    cargosEsperadosPeriodo,
    ingresosPeriodoRaw,
    ingresosPorZonaRaw,
    ordenesEstadoRaw,
    clientesMorosos,
    ordenesVencidas,
    ] = await Promise.all([
    queryCobradoPeriodo(queryFilters),
    queryCarteraPendiente(queryFilters),
    queryServiciosSuspendidos(queryFilters),
    queryOrdenesPendientes(queryFilters),
    queryCargosEsperadosPeriodo(queryFilters),
    queryIngresosPeriodo(queryFilters),
    queryIngresosPorZona(queryFilters),
    queryOrdenesEstado(queryFilters),
    queryClientesMorosos(queryFilters),
    queryOrdenesVencidas(queryFilters),
    ]);

    const cobradoNum =
    cobradoPeriodo instanceof Prisma.Decimal
        ? cobradoPeriodo.toNumber()
        : Number(cobradoPeriodo);

    const esperadoNum =
    cargosEsperadosPeriodo instanceof Prisma.Decimal
        ? cargosEsperadosPeriodo.toNumber()
        : Number(cargosEsperadosPeriodo);

    const metaCobranza = esperadoNum > 0 ? (cobradoNum / esperadoNum) * 100 : 0;

    return {
    filters: mapFilters(fechaDesdeStr, fechaHastaStr, zona),
    kpis: mapKpis({
        cobradoPeriodo:
        cobradoPeriodo instanceof Prisma.Decimal
            ? cobradoPeriodo
            : new Prisma.Decimal(cobradoPeriodo),
        carteraPendiente:
        carteraPendiente instanceof Prisma.Decimal
            ? carteraPendiente
            : new Prisma.Decimal(carteraPendiente),
        serviciosSuspendidos,
        ordenesPendientes,
        metaCobranza: Math.round(metaCobranza * 100) / 100,
    }),
    ingresosPeriodo: mapIngresosPeriodo(ingresosPeriodoRaw, fechaDesde, fechaHasta),
    ingresosPorZona: mapIngresosPorZona(ingresosPorZonaRaw),
    ordenesEstado: mapOrdenesEstado(ordenesEstadoRaw),
    alertas: mapAlertas({
        clientesMorosos,
        serviciosSuspendidos,
        ordenesVencidas,
        metaCobranza: Math.round(metaCobranza * 100) / 100,
    }),
    };
}
