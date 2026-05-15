"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUbicacionesService = getUbicacionesService;
exports.createUbicacionService = createUbicacionService;
exports.updateUbicacionService = updateUbicacionService;
exports.updateUbicacionEstadoService = updateUbicacionEstadoService;
const client_1 = require("@prisma/client");
const clientes_repository_1 = require("../clientes/clientes.repository");
const ubicacion_repository_1 = require("./ubicacion.repository");
const prisma_1 = __importDefault(require("../../config/prisma"));
async function validarClienteDeEmpresa(clienteId, empresaId) {
    const cliente = await (0, clientes_repository_1.findClienteById)(clienteId);
    if (!cliente || cliente.empresaId !== empresaId) {
        throw new Error("Cliente no encontrado");
    }
    return cliente;
}
async function validarUbicacionDeCliente(ubicacionId, clienteId, empresaId) {
    const ubicacion = await (0, ubicacion_repository_1.findUbicacionById)(ubicacionId);
    if (!ubicacion) {
        throw new Error("Ubicación no encontrada");
    }
    if (ubicacion.clienteId !== clienteId) {
        throw new Error("La ubicación no pertenece a este cliente");
    }
    await validarClienteDeEmpresa(clienteId, empresaId);
    return ubicacion;
}
async function getUbicacionesService(clienteId, empresaId) {
    await validarClienteDeEmpresa(clienteId, empresaId);
    return (0, ubicacion_repository_1.findUbicacionesByCliente)(clienteId);
}
async function createUbicacionService(clienteId, empresaId, input) {
    await validarClienteDeEmpresa(clienteId, empresaId);
    return prisma_1.default.$transaction(async (tx) => {
        if (input.esPrincipal) {
            await tx.clienteUbicacion.updateMany({
                where: { clienteId },
                data: { esPrincipal: false },
            });
        }
        return tx.clienteUbicacion.create({
            data: {
                ...input,
                clienteId,
                estado: client_1.EstadoUbicacion.ACTIVA,
            },
        });
    });
}
async function updateUbicacionService(ubicacionId, clienteId, empresaId, input) {
    await validarUbicacionDeCliente(ubicacionId, clienteId, empresaId);
    return prisma_1.default.$transaction(async (tx) => {
        if (input.esPrincipal) {
            await tx.clienteUbicacion.updateMany({
                where: { clienteId },
                data: { esPrincipal: false },
            });
        }
        return tx.clienteUbicacion.update({
            where: { id: ubicacionId },
            data: input,
        });
    });
}
async function updateUbicacionEstadoService(ubicacionId, clienteId, empresaId, estado) {
    await validarUbicacionDeCliente(ubicacionId, clienteId, empresaId);
    return (0, ubicacion_repository_1.updateUbicacionEstado)(ubicacionId, estado);
}
