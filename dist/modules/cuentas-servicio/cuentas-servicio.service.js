"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCuentasServicio = getCuentasServicio;
exports.getCuentaServicioByIdService = getCuentaServicioByIdService;
exports.createCuentaServicioService = createCuentaServicioService;
exports.updateCuentaServicioService = updateCuentaServicioService;
exports.updateCuentaServicioStatusService = updateCuentaServicioStatusService;
exports.getCuentasServicioSelectByClienteService = getCuentasServicioSelectByClienteService;
exports.getCuentasServicioSelectService = getCuentasServicioSelectService;
const client_1 = require("@prisma/client");
const cuentas_servicio_repository_1 = require("./cuentas-servicio.repository");
const terminalStates = new Set([
    client_1.EstadoCuentaServicio.CANCELADA,
    client_1.EstadoCuentaServicio.FINALIZADA,
]);
const allowedStatusTransitions = {
    [client_1.EstadoCuentaServicio.ACTIVA]: [
        client_1.EstadoCuentaServicio.SUSPENDIDA,
        client_1.EstadoCuentaServicio.CANCELADA,
        client_1.EstadoCuentaServicio.FINALIZADA,
    ],
    [client_1.EstadoCuentaServicio.SUSPENDIDA]: [
        client_1.EstadoCuentaServicio.ACTIVA,
        client_1.EstadoCuentaServicio.CANCELADA,
    ],
    [client_1.EstadoCuentaServicio.CANCELADA]: [],
    [client_1.EstadoCuentaServicio.FINALIZADA]: [],
};
function parseDateOnly(value) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return new Date(`${value}T00:00:00.000Z`);
}
async function validateCuentaServicioRelations(input) {
    const [cliente, tipoServicio, politicaCobro] = await Promise.all([
        (0, cuentas_servicio_repository_1.findClienteById)(input.clienteId),
        (0, cuentas_servicio_repository_1.findTipoServicioById)(input.tipoServicioId),
        input.politicaCobroId ? (0, cuentas_servicio_repository_1.findPoliticaCobroById)(input.politicaCobroId) : Promise.resolve(null),
    ]);
    if (!cliente || cliente.empresaId !== input.empresaId) {
        throw new Error("Cliente no encontrado");
    }
    if (!tipoServicio || tipoServicio.empresaId !== input.empresaId) {
        throw new Error("Tipo de servicio no encontrado");
    }
    if (tipoServicio.estado !== client_1.EstadoRegistroBasico.ACTIVO) {
        throw new Error("El tipo de servicio debe estar ACTIVO");
    }
    if (input.ubicacionId) {
        const ubicacion = await (0, cuentas_servicio_repository_1.findUbicacionById)(input.ubicacionId);
        if (!ubicacion || ubicacion.clienteId !== input.clienteId) {
            throw new Error("UbicaciÃ³n no encontrada para el cliente");
        }
    }
    if (input.modalidad === client_1.ModalidadServicio.RECURRENTE) {
        if (!input.politicaCobroId) {
            throw new Error("politicaCobroId es obligatoria para modalidad RECURRENTE");
        }
        if (!input.frecuencia) {
            throw new Error("frecuencia es obligatoria para modalidad RECURRENTE");
        }
    }
    if (input.modalidad === client_1.ModalidadServicio.PUNTUAL && input.frecuencia) {
        throw new Error("frecuencia no debe enviarse para modalidad PUNTUAL");
    }
    if (input.politicaCobroId) {
        if (!politicaCobro || politicaCobro.empresaId !== input.empresaId) {
            throw new Error("PolÃ­tica de cobro no encontrada");
        }
        if (politicaCobro.estado !== client_1.EstadoRegistroBasico.ACTIVO) {
            throw new Error("La polÃ­tica de cobro debe estar ACTIVA");
        }
    }
}
async function getCuentasServicio(empresaId, filters) {
    return (0, cuentas_servicio_repository_1.findCuentasServicioByEmpresa)(empresaId, filters);
}
async function getCuentaServicioByIdService(id, empresaId) {
    const cuentaServicio = await (0, cuentas_servicio_repository_1.findCuentaServicioById)(id);
    if (!cuentaServicio || cuentaServicio.empresaId !== empresaId) {
        throw new Error("Cuenta de servicio no encontrada");
    }
    return cuentaServicio;
}
async function createCuentaServicioService(input) {
    const existing = await (0, cuentas_servicio_repository_1.findCuentaServicioByCodigo)(input.empresaId, input.codigo);
    if (existing) {
        throw new Error("Ya existe una cuenta de servicio con ese cÃ³digo");
    }
    await validateCuentaServicioRelations({
        empresaId: input.empresaId,
        clienteId: input.clienteId,
        ubicacionId: input.ubicacionId,
        tipoServicioId: input.tipoServicioId,
        politicaCobroId: input.politicaCobroId,
        modalidad: input.modalidad,
        frecuencia: input.frecuencia,
    });
    return (0, cuentas_servicio_repository_1.createCuentaServicio)({
        ...input,
        fechaInicio: parseDateOnly(input.fechaInicio) ?? undefined,
        fechaFin: parseDateOnly(input.fechaFin),
    });
}
async function updateCuentaServicioService(id, empresaId, input) {
    const cuentaServicio = await (0, cuentas_servicio_repository_1.findCuentaServicioById)(id);
    if (!cuentaServicio || cuentaServicio.empresaId !== empresaId) {
        throw new Error("Cuenta de servicio no encontrada");
    }
    if (terminalStates.has(cuentaServicio.estado)) {
        throw new Error("No se puede editar una cuenta en estado CANCELADA o FINALIZADA");
    }
    if (input.codigo && input.codigo !== cuentaServicio.codigo) {
        const existing = await (0, cuentas_servicio_repository_1.findCuentaServicioByCodigo)(empresaId, input.codigo);
        if (existing && existing.id !== id) {
            throw new Error("Ya existe una cuenta de servicio con ese código");
        }
    }
    const modalidad = input.modalidad ?? cuentaServicio.modalidad;
    const clienteId = input.clienteId ?? cuentaServicio.clienteId;
    const ubicacionId = input.ubicacionId !== undefined ? input.ubicacionId : cuentaServicio.ubicacionId;
    const tipoServicioId = input.tipoServicioId ?? cuentaServicio.tipoServicioId;
    const politicaCobroId = input.politicaCobroId !== undefined
        ? input.politicaCobroId
        : cuentaServicio.politicaCobroId;
    const frecuencia = input.frecuencia !== undefined ? input.frecuencia : cuentaServicio.frecuencia;
    await validateCuentaServicioRelations({
        empresaId,
        clienteId,
        ubicacionId,
        tipoServicioId,
        politicaCobroId,
        modalidad,
        frecuencia,
    });
    const dataToUpdate = {
        ...input,
        fechaInicio: parseDateOnly(input.fechaInicio),
        fechaFin: parseDateOnly(input.fechaFin),
    };
    return (0, cuentas_servicio_repository_1.updateCuentaServicio)(id, dataToUpdate);
}
async function updateCuentaServicioStatusService(id, empresaId, estado) {
    const cuentaServicio = await (0, cuentas_servicio_repository_1.findCuentaServicioById)(id);
    if (!cuentaServicio || cuentaServicio.empresaId !== empresaId) {
        throw new Error("Cuenta de servicio no encontrada");
    }
    if (cuentaServicio.estado === estado) {
        throw new Error("La cuenta ya tiene ese estado");
    }
    const allowedTransitions = allowedStatusTransitions[cuentaServicio.estado];
    if (!allowedTransitions.includes(estado)) {
        throw new Error(`No se permite cambiar de ${cuentaServicio.estado} a ${estado}`);
    }
    return (0, cuentas_servicio_repository_1.updateCuentaServicioStatus)(id, estado);
}
async function getCuentasServicioSelectByClienteService(clienteId, empresaId) {
    const cliente = await (0, cuentas_servicio_repository_1.findClienteById)(clienteId);
    if (!cliente || cliente.empresaId !== empresaId) {
        throw new Error("Cliente no encontrado");
    }
    return (0, cuentas_servicio_repository_1.findCuentasServicioSelectByCliente)(clienteId, empresaId);
}
async function getCuentasServicioSelectService(empresaId, filters) {
    if (filters?.clienteId) {
        const cliente = await (0, cuentas_servicio_repository_1.findClienteById)(filters.clienteId);
        if (!cliente || cliente.empresaId !== empresaId) {
            throw new Error("Cliente no encontrado");
        }
    }
    return (0, cuentas_servicio_repository_1.findCuentasServicioSelect)(empresaId, filters);
}
