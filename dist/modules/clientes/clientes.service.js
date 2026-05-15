"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientes = getClientes;
exports.searchClientesForSelectService = searchClientesForSelectService;
exports.getClienteByIdService = getClienteByIdService;
exports.createClienteService = createClienteService;
exports.updateClienteService = updateClienteService;
exports.updateClienteStatusService = updateClienteStatusService;
const clientes_repository_1 = require("./clientes.repository");
async function getClientes(empresaId) {
    return (0, clientes_repository_1.findClientesByEmpresa)(empresaId);
}
async function searchClientesForSelectService(empresaId, options) {
    return (0, clientes_repository_1.searchClientesForSelect)(empresaId, options);
}
async function getClienteByIdService(id, empresaId) {
    const cliente = await (0, clientes_repository_1.findClienteById)(id);
    if (!cliente || cliente.empresaId !== empresaId) {
        throw new Error("Cliente no encontrado");
    }
    const [pagos, cuentasServicio] = await Promise.all([
        (0, clientes_repository_1.getPagosByClient)(id),
        (0, clientes_repository_1.getCuentasByClient)(id),
    ]);
    return { ...cliente, pagos, cuentasServicio };
}
async function createClienteService(input) {
    const existing = await (0, clientes_repository_1.findClienteByCodigo)(input.empresaId, input.codigo);
    if (existing) {
        throw new Error("Ya existe un cliente con ese código");
    }
    return (0, clientes_repository_1.createCliente)(input);
}
async function updateClienteService(id, empresaId, input) {
    const cliente = await (0, clientes_repository_1.findClienteById)(id);
    if (!cliente || cliente.empresaId !== empresaId) {
        throw new Error("Cliente no encontrado");
    }
    return (0, clientes_repository_1.updateCliente)(id, input);
}
async function updateClienteStatusService(id, empresaId, estado) {
    const cliente = await (0, clientes_repository_1.findClienteById)(id);
    if (!cliente || cliente.empresaId !== empresaId) {
        throw new Error("Cliente no encontrado");
    }
    return (0, clientes_repository_1.updateClienteStatus)(id, estado);
}
