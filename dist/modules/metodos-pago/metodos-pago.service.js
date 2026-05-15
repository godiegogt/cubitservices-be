"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetodosPago = getMetodosPago;
exports.createMetodoPagoService = createMetodoPagoService;
exports.updateMetodoPagoService = updateMetodoPagoService;
exports.updateMetodoPagoStatusService = updateMetodoPagoStatusService;
const metodos_pago_repository_1 = require("./metodos-pago.repository");
async function getMetodosPago(empresaId) {
    return (0, metodos_pago_repository_1.findMetodosPagoByEmpresa)(empresaId);
}
async function createMetodoPagoService(input) {
    const existing = await (0, metodos_pago_repository_1.findMetodoPagoByName)(input.empresaId, input.nombre);
    if (existing) {
        throw new Error("Ya existe un método de pago con ese nombre");
    }
    return (0, metodos_pago_repository_1.createMetodoPago)(input);
}
async function updateMetodoPagoService(id, empresaId, input) {
    const metodo = await (0, metodos_pago_repository_1.findMetodoPagoById)(id);
    if (!metodo || metodo.empresaId !== empresaId) {
        throw new Error("Método de pago no encontrado");
    }
    if (input.nombre && input.nombre !== metodo.nombre) {
        const existing = await (0, metodos_pago_repository_1.findMetodoPagoByName)(empresaId, input.nombre);
        if (existing) {
            throw new Error("Ya existe un método de pago con ese nombre");
        }
    }
    return (0, metodos_pago_repository_1.updateMetodoPago)(id, input);
}
async function updateMetodoPagoStatusService(id, empresaId, estado) {
    const metodo = await (0, metodos_pago_repository_1.findMetodoPagoById)(id);
    if (!metodo || metodo.empresaId !== empresaId) {
        throw new Error("Método de pago no encontrado");
    }
    return (0, metodos_pago_repository_1.updateMetodoPagoStatus)(id, estado);
}
