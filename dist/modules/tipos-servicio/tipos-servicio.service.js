"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTiposServicio = getTiposServicio;
exports.createTipoServicioService = createTipoServicioService;
exports.updateTipoServicioService = updateTipoServicioService;
exports.updateTipoServicioStatusService = updateTipoServicioStatusService;
const tipos_servicio_repository_1 = require("./tipos-servicio.repository");
async function getTiposServicio(empresaId) {
    return (0, tipos_servicio_repository_1.findTiposServicioByEmpresa)(empresaId);
}
async function createTipoServicioService(input) {
    const existing = await (0, tipos_servicio_repository_1.findTipoServicioByName)(input.empresaId, input.nombre);
    if (existing) {
        throw new Error("Ya existe un tipo de servicio con ese nombre");
    }
    return (0, tipos_servicio_repository_1.createTipoServicio)(input);
}
async function updateTipoServicioService(id, empresaId, input) {
    const tipoServicio = await (0, tipos_servicio_repository_1.findTipoServicioById)(id);
    if (!tipoServicio || tipoServicio.empresaId !== empresaId) {
        throw new Error("Tipo de servicio no encontrado");
    }
    if (input.nombre && input.nombre !== tipoServicio.nombre) {
        const existing = await (0, tipos_servicio_repository_1.findTipoServicioByName)(empresaId, input.nombre);
        if (existing) {
            throw new Error("Ya existe un tipo de servicio con ese nombre");
        }
    }
    return (0, tipos_servicio_repository_1.updateTipoServicio)(id, input);
}
async function updateTipoServicioStatusService(id, empresaId, estado) {
    const tipoServicio = await (0, tipos_servicio_repository_1.findTipoServicioById)(id);
    if (!tipoServicio || tipoServicio.empresaId !== empresaId) {
        throw new Error("Tipo de servicio no encontrado");
    }
    return (0, tipos_servicio_repository_1.updateTipoServicioStatus)(id, estado);
}
