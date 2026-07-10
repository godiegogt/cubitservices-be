import type { EstadoCuentaResponse } from './estado-cuenta.dto';
import {
    calcularSaldoDisponibleCliente,
    findAplicacionesPagoDeCuenta,
    findCargosDeCuenta,
    findCuentaServicioConRelaciones,
} from './estado-cuenta.query';
import {
    construirMovimientos,
    filtrarMovimientos,
    mapHeader,
    mapResumen,
} from './estado-cuenta.mapper';

interface EstadoCuentaFiltros {
    fechaInicio?: string;
    fechaFin?: string;
    tipoMovimiento?: string;
}

interface EstadoCuentaParams extends EstadoCuentaFiltros {
    page?: number;
    limit?: number;
}

export async function getEstadoCuenta(
    cuentaServicioId: string,
    empresaId: string,
    params: EstadoCuentaParams,
): Promise<EstadoCuentaResponse> {
    const cuenta = await findCuentaServicioConRelaciones(cuentaServicioId);

    if (!cuenta || cuenta.empresaId !== empresaId) {
    throw new Error('Cuenta de servicio no encontrada');
    }

    const [cargos, aplicaciones, saldoDisponibleCliente] = await Promise.all([
    findCargosDeCuenta(cuentaServicioId, empresaId),
    findAplicacionesPagoDeCuenta(cuentaServicioId, empresaId),
    calcularSaldoDisponibleCliente(cuenta.clienteId, empresaId),
    ]);

    const header = mapHeader(cuenta);
    const resumen = mapResumen(cargos, aplicaciones, saldoDisponibleCliente);
    const todosMovimientos = construirMovimientos(cargos, aplicaciones);
    const filtrados = filtrarMovimientos(todosMovimientos, params);

    const total = filtrados.length;

    if (params.page === undefined && params.limit === undefined) {
    return {
        cuenta: header,
        resumen,
        movimientos: filtrados,
        meta: { total, page: 1, limit: total || 1, totalPages: 1 },
    };
    }

    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(200, Math.max(1, params.limit ?? 10));
    const totalPages = Math.ceil(total / limit) || 1;
    const movimientos = filtrados.slice((page - 1) * limit, page * limit);

    return {
    cuenta: header,
    resumen,
    movimientos,
    meta: { total, page, limit, totalPages },
    };
}
