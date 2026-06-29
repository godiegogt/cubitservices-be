import { Prisma } from "@prisma/client";
import {
    queryCarteraPendiente,
    queryClientesMorosos,
    queryCobradoPeriodo,
    queryIngresosPeriodo,
    queryIngresosPorZona,
    queryMetaCobranza,
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
import { getDefaultDateRange, parseDateOnly, formatDateOnly } from "../../utils/utils";

export async function getAdminDashboard(
    empresaId: string,
    input: DashboardQueryInput
): Promise<DashboardAdminResponse> {
    const defaults = getDefaultDateRange();
    const fechaDesde = input.fechaDesde ? parseDateOnly(input.fechaDesde) : defaults.desde;
    const fechaHasta = input.fechaHasta ? parseDateOnly(input.fechaHasta) : defaults.hasta;
    const zona = input.zona;
    const fechaDesdeStr = input.fechaDesde ?? formatDateOnly(defaults.desde);
    const fechaHastaStr = input.fechaHasta ?? formatDateOnly(defaults.hasta);

    const queryFilters = { empresaId, fechaDesde, fechaHasta, zona };

    const [
    cobradoPeriodo,
    carteraPendiente,
    serviciosSuspendidos,
    ordenesPendientes,
    metaCobranzaBase,
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
    queryMetaCobranza(empresaId, zona),
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

    const metaNum =
    metaCobranzaBase instanceof Prisma.Decimal
        ? metaCobranzaBase.toNumber()
        : Number(metaCobranzaBase);

    const metaCobranza = metaNum > 0 ? (cobradoNum / metaNum) * 100 : 0;

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
