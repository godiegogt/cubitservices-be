"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdenes = getOrdenes;
exports.getOrdenByIdService = getOrdenByIdService;
exports.createOrdenService = createOrdenService;
exports.updateOrdenService = updateOrdenService;
exports.updateOrdenStatusService = updateOrdenStatusService;
exports.getOrdenEstadosService = getOrdenEstadosService;
exports.getOrdenesSelectService = getOrdenesSelectService;
const client_1 = require("@prisma/client");
const ordenes_repository_1 = require("./ordenes.repository");
const terminalStates = new Set([
    client_1.EstadoOrdenServicio.FINALIZADA,
    client_1.EstadoOrdenServicio.CANCELADA,
]);
const allowedStatusTransitions = {
    [client_1.EstadoOrdenServicio.PENDIENTE]: [
        client_1.EstadoOrdenServicio.PROGRAMADA,
        client_1.EstadoOrdenServicio.EN_PROCESO,
        client_1.EstadoOrdenServicio.CANCELADA,
    ],
    [client_1.EstadoOrdenServicio.PROGRAMADA]: [
        client_1.EstadoOrdenServicio.EN_PROCESO,
        client_1.EstadoOrdenServicio.CANCELADA,
    ],
    [client_1.EstadoOrdenServicio.EN_PROCESO]: [
        client_1.EstadoOrdenServicio.PAUSADA,
        client_1.EstadoOrdenServicio.FINALIZADA,
        client_1.EstadoOrdenServicio.CANCELADA,
    ],
    [client_1.EstadoOrdenServicio.PAUSADA]: [
        client_1.EstadoOrdenServicio.EN_PROCESO,
        client_1.EstadoOrdenServicio.CANCELADA,
    ],
    [client_1.EstadoOrdenServicio.FINALIZADA]: [],
    [client_1.EstadoOrdenServicio.CANCELADA]: [],
};
function parseDateTime(value) {
    if (value === undefined) {
        return undefined;
    }
    return new Date(value);
}
async function generateNumeroOrden(empresaId) {
    let sequence = (await (0, ordenes_repository_1.countOrdenesByEmpresa)(empresaId)) + 1;
    while (true) {
        const numeroOrden = `OS-${String(sequence).padStart(6, "0")}`;
        const existing = await (0, ordenes_repository_1.findOrdenByNumero)(empresaId, numeroOrden);
        if (!existing) {
            return numeroOrden;
        }
        sequence += 1;
    }
}
async function validateTipoServicio(empresaId, tipoServicioId) {
    const tipoServicio = await (0, ordenes_repository_1.findTipoServicioById)(tipoServicioId);
    if (!tipoServicio || tipoServicio.empresaId !== empresaId) {
        throw new Error("Tipo de servicio no encontrado");
    }
    if (tipoServicio.estado !== client_1.EstadoRegistroBasico.ACTIVO) {
        throw new Error("El tipo de servicio debe estar ACTIVO");
    }
    return tipoServicio;
}
async function validateUbicacion(clienteId, ubicacionId) {
    const ubicacion = await (0, ordenes_repository_1.findUbicacionById)(ubicacionId);
    if (!ubicacion || ubicacion.clienteId !== clienteId) {
        throw new Error("Ubicacion no encontrada para el cliente");
    }
    return ubicacion;
}
async function getOrdenes(empresaId, filters) {
    return (0, ordenes_repository_1.findOrdenesByEmpresa)(empresaId, filters);
}
async function getOrdenByIdService(id, empresaId) {
    const orden = await (0, ordenes_repository_1.findOrdenById)(id);
    if (!orden || orden.empresaId !== empresaId) {
        throw new Error("Orden de servicio no encontrada");
    }
    return orden;
}
async function createOrdenService(input) {
    const cuentaServicio = await (0, ordenes_repository_1.findCuentaServicioById)(input.cuentaServicioId);
    if (!cuentaServicio || cuentaServicio.empresaId !== input.empresaId) {
        throw new Error("Cuenta de servicio no encontrada");
    }
    if (cuentaServicio.estado === client_1.EstadoCuentaServicio.CANCELADA ||
        cuentaServicio.estado === client_1.EstadoCuentaServicio.FINALIZADA) {
        throw new Error("No se pueden crear ordenes para cuentas CANCELADA o FINALIZADA");
    }
    await Promise.all([
        validateUbicacion(cuentaServicio.clienteId, input.ubicacionId),
        validateTipoServicio(input.empresaId, input.tipoServicioId),
    ]);
    const estado = input.fechaProgramada
        ? client_1.EstadoOrdenServicio.PROGRAMADA
        : client_1.EstadoOrdenServicio.PENDIENTE;
    const numeroOrden = await generateNumeroOrden(input.empresaId);
    return (0, ordenes_repository_1.createOrden)({
        ...input,
        clienteId: cuentaServicio.clienteId,
        numeroOrden,
        estado,
        fechaProgramada: parseDateTime(input.fechaProgramada),
    });
}
async function updateOrdenService(id, empresaId, input) {
    const orden = await (0, ordenes_repository_1.findOrdenById)(id);
    if (!orden || orden.empresaId !== empresaId) {
        throw new Error("Orden de servicio no encontrada");
    }
    if (terminalStates.has(orden.estado)) {
        throw new Error("No se puede editar una orden FINALIZADA o CANCELADA");
    }
    if (input.ubicacionId) {
        await validateUbicacion(orden.clienteId, input.ubicacionId);
    }
    if (input.tipoServicioId) {
        await validateTipoServicio(empresaId, input.tipoServicioId);
    }
    return (0, ordenes_repository_1.updateOrden)(id, {
        ...input,
        fechaProgramada: parseDateTime(input.fechaProgramada),
    });
}
async function updateOrdenStatusService(id, empresaId, usuarioId, input) {
    const orden = await (0, ordenes_repository_1.findOrdenById)(id);
    if (!orden || orden.empresaId !== empresaId) {
        throw new Error("Orden de servicio no encontrada");
    }
    if (orden.estado === input.estado) {
        throw new Error("La orden ya tiene ese estado");
    }
    if (terminalStates.has(orden.estado)) {
        throw new Error("No se permiten cambios desde FINALIZADA o CANCELADA");
    }
    const allowedTransitions = allowedStatusTransitions[orden.estado];
    if (!allowedTransitions.includes(input.estado)) {
        throw new Error(`No se permite cambiar de ${orden.estado} a ${input.estado}`);
    }
    if (input.estado === client_1.EstadoOrdenServicio.CANCELADA && !input.motivo) {
        throw new Error("motivo es obligatorio para cancelar la orden");
    }
    if (input.estado === client_1.EstadoOrdenServicio.FINALIZADA &&
        orden.requiereEvidenciaFinal) {
        // TODO: validar archivos/evidencia final cuando exista el módulo de archivos.
    }
    const now = new Date();
    return (0, ordenes_repository_1.updateOrdenStatus)(id, {
        estadoAnterior: orden.estado,
        estadoNuevo: input.estado,
        motivo: input.motivo,
        usuarioId,
        fechaInicio: input.estado === client_1.EstadoOrdenServicio.EN_PROCESO && !orden.fechaInicio
            ? now
            : undefined,
        fechaCierre: input.estado === client_1.EstadoOrdenServicio.FINALIZADA ||
            input.estado === client_1.EstadoOrdenServicio.CANCELADA
            ? now
            : undefined,
        motivoCancelacion: input.estado === client_1.EstadoOrdenServicio.CANCELADA
            ? input.motivo
            : undefined,
    });
}
async function getOrdenEstadosService(id, empresaId) {
    const orden = await (0, ordenes_repository_1.findOrdenById)(id);
    if (!orden || orden.empresaId !== empresaId) {
        throw new Error("Orden de servicio no encontrada");
    }
    return (0, ordenes_repository_1.findEstadosByOrdenId)(id);
}
async function getOrdenesSelectService(empresaId, filters) {
    const cuentaServicio = await (0, ordenes_repository_1.findCuentaServicioById)(filters.cuentaServicioId);
    if (!cuentaServicio || cuentaServicio.empresaId !== empresaId) {
        throw new Error("Cuenta de servicio no encontrada");
    }
    return (0, ordenes_repository_1.findOrdenesSelect)(empresaId, filters);
}
