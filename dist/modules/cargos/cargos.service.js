"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCargosService = getCargosService;
exports.getCargoByIdService = getCargoByIdService;
exports.createCargoService = createCargoService;
exports.createCargoFromCuentaService = createCargoFromCuentaService;
exports.updateCargoStatusService = updateCargoStatusService;
const client_1 = require("@prisma/client");
const cargos_repository_1 = require("./cargos.repository");
function parseDateOnly(value) {
    return new Date(`${value}T00:00:00.000Z`);
}
function formatDateOnly(value) {
    if (!value) {
        return null;
    }
    return value.toISOString().slice(0, 10);
}
function addDays(date, days) {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
}
function getLastDayOfMonth(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}
function calculateFechaVencimiento(fechaEmision, politica) {
    if (!politica) {
        return null;
    }
    if (politica.tipoVencimiento === client_1.TipoVencimiento.FIN_MES) {
        return getLastDayOfMonth(fechaEmision);
    }
    if (politica.tipoVencimiento === client_1.TipoVencimiento.FECHA_FIJA) {
        if (!politica.diaVencimiento) {
            throw new Error("diaVencimiento es obligatorio para FECHA_FIJA");
        }
        const lastDay = getLastDayOfMonth(fechaEmision).getUTCDate();
        const day = Math.min(politica.diaVencimiento, lastDay);
        return new Date(Date.UTC(fechaEmision.getUTCFullYear(), fechaEmision.getUTCMonth(), day));
    }
    // MVP: el modelo no tiene un campo de dias despues, se usa diasGracia.
    return addDays(fechaEmision, politica.diasGracia);
}
function formatCargo(cargo) {
    return {
        ...cargo,
        monto: cargo.monto.toString(),
        saldo: cargo.saldo.toString(),
        fechaEmision: formatDateOnly(cargo.fechaEmision),
        fechaVencimiento: formatDateOnly(cargo.fechaVencimiento),
        fechaUltimaMoraCalculada: formatDateOnly(cargo.fechaUltimaMoraCalculada),
        valorMoraAplicado: cargo.valorMoraAplicado?.toString() ?? null,
        politicaCobro: cargo.politicaCobro
            ? {
                ...cargo.politicaCobro,
                ...("valorMora" in cargo.politicaCobro
                    ? {
                        valorMora: cargo.politicaCobro.valorMora?.toString() ?? null,
                    }
                    : {}),
            }
            : null,
    };
}
async function createCargoInternal(input) {
    const cuentaServicio = await (0, cargos_repository_1.findCuentaServicioById)(input.cuentaServicioId);
    if (!cuentaServicio || cuentaServicio.empresaId !== input.empresaId) {
        throw new Error("Cuenta de servicio no encontrada");
    }
    if (cuentaServicio.estado === client_1.EstadoCuentaServicio.CANCELADA ||
        cuentaServicio.estado === client_1.EstadoCuentaServicio.FINALIZADA) {
        throw new Error("No se pueden crear cargos para cuentas CANCELADA o FINALIZADA");
    }
    if (cuentaServicio.estado === client_1.EstadoCuentaServicio.SUSPENDIDA &&
        input.tipoCargo !== client_1.TipoCargo.AJUSTE &&
        input.tipoCargo !== client_1.TipoCargo.EXTRAORDINARIO) {
        throw new Error("Solo se pueden crear cargos AJUSTE o EXTRAORDINARIO para cuentas SUSPENDIDA");
    }
    const politica = cuentaServicio.politicaCobroId
        ? await (0, cargos_repository_1.findPoliticaCobroById)(cuentaServicio.politicaCobroId)
        : null;
    if (cuentaServicio.politicaCobroId && !politica) {
        throw new Error("Politica de cobro no encontrada");
    }
    if (!politica &&
        (input.tipoCargo === client_1.TipoCargo.SERVICIO || input.tipoCargo === client_1.TipoCargo.MORA)) {
        throw new Error("La cuenta requiere politica de cobro para cargos SERVICIO o MORA");
    }
    if (input.tipoCargo === client_1.TipoCargo.SERVICIO) {
        if (!input.periodoReferencia) {
            throw new Error("periodoReferencia es obligatorio para cargos SERVICIO");
        }
        const duplicate = await (0, cargos_repository_1.findDuplicateServicioCargo)({
            empresaId: input.empresaId,
            cuentaServicioId: input.cuentaServicioId,
            periodoReferencia: input.periodoReferencia,
        });
        if (duplicate) {
            throw new Error("Ya existe un cargo SERVICIO para ese periodo");
        }
    }
    if (input.ordenServicioId) {
        const orden = await (0, cargos_repository_1.findOrdenServicioById)(input.ordenServicioId);
        if (!orden || orden.empresaId !== input.empresaId) {
            throw new Error("Orden de servicio no encontrada");
        }
        if (orden.cuentaServicioId !== input.cuentaServicioId) {
            throw new Error("La orden de servicio no pertenece a la cuenta");
        }
    }
    const fechaEmision = parseDateOnly(input.fechaEmision);
    const fechaVencimiento = calculateFechaVencimiento(fechaEmision, politica);
    const cargo = await (0, cargos_repository_1.createCargo)({
        empresaId: input.empresaId,
        clienteId: cuentaServicio.clienteId,
        cuentaServicioId: cuentaServicio.id,
        ordenServicioId: input.ordenServicioId,
        politicaCobroId: politica?.id ?? null,
        tipoCargo: input.tipoCargo,
        concepto: input.concepto,
        periodoReferencia: input.periodoReferencia,
        monto: input.monto,
        saldo: input.monto,
        fechaEmision,
        fechaVencimiento,
        diasGraciaAplicados: politica?.diasGracia ?? null,
        tipoMoraAplicada: politica?.tipoMora ?? null,
        valorMoraAplicado: politica?.valorMora ?? null,
        estado: client_1.EstadoCargo.PENDIENTE,
    });
    return {
        id: cargo.id,
        tipoCargo: cargo.tipoCargo,
        concepto: cargo.concepto,
        periodoReferencia: cargo.periodoReferencia,
        monto: cargo.monto.toString(),
        saldo: cargo.saldo.toString(),
        fechaEmision: formatDateOnly(cargo.fechaEmision),
        fechaVencimiento: formatDateOnly(cargo.fechaVencimiento),
        estado: cargo.estado,
    };
}
async function getCargosService(empresaId, filters) {
    const page = Math.max(1, filters?.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters?.limit ?? 20));
    const { cargos, total } = await (0, cargos_repository_1.findCargosByEmpresa)(empresaId, filters, { page, limit });
    return {
        data: cargos.map(formatCargo),
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
}
async function getCargoByIdService(id, empresaId) {
    const cargo = await (0, cargos_repository_1.findCargoById)(id);
    if (!cargo || cargo.empresaId !== empresaId) {
        throw new Error("Cargo no encontrado");
    }
    return formatCargo(cargo);
}
async function createCargoService(input) {
    return createCargoInternal(input);
}
async function createCargoFromCuentaService(input) {
    return createCargoInternal(input);
}
const TRANSICIONES_VALIDAS = {
    [client_1.EstadoCargo.PENDIENTE]: [client_1.EstadoCargo.ANULADO, client_1.EstadoCargo.VENCIDO, client_1.EstadoCargo.PAGADO, client_1.EstadoCargo.PARCIAL],
    [client_1.EstadoCargo.PARCIAL]: [client_1.EstadoCargo.ANULADO, client_1.EstadoCargo.VENCIDO, client_1.EstadoCargo.PAGADO, client_1.EstadoCargo.PENDIENTE],
    [client_1.EstadoCargo.PAGADO]: [],
    [client_1.EstadoCargo.VENCIDO]: [],
    [client_1.EstadoCargo.ANULADO]: [],
};
async function updateCargoStatusService(id, empresaId, input) {
    const cargo = await (0, cargos_repository_1.findCargoById)(id);
    if (!cargo || cargo.empresaId !== empresaId) {
        throw new Error("Cargo no encontrado");
    }
    const transicionesPermitidas = TRANSICIONES_VALIDAS[cargo.estado] ?? [];
    if (!transicionesPermitidas.includes(input.estado)) {
        throw new Error(`No se puede cambiar el estado de ${cargo.estado} a ${input.estado}`);
    }
    if (input.estado === client_1.EstadoCargo.ANULADO && (!input.motivo || input.motivo.trim().length < 3)) {
        throw new Error("El motivo es obligatorio para anular un cargo (mínimo 3 caracteres)");
    }
    return (0, cargos_repository_1.updateCargoStatus)(id, input.estado);
}
