"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPrincipalByCliente = exports.updateUbicacionEstado = exports.updateUbicacion = exports.createUbicacion = exports.findUbicacionById = exports.findUbicacionesByCliente = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const findUbicacionesByCliente = (clienteId) => {
    return prisma_1.default.clienteUbicacion.findMany({
        where: { clienteId },
        orderBy: { esPrincipal: "desc" },
    });
};
exports.findUbicacionesByCliente = findUbicacionesByCliente;
const findUbicacionById = (id) => {
    return prisma_1.default.clienteUbicacion.findUnique({
        where: { id },
    });
};
exports.findUbicacionById = findUbicacionById;
const createUbicacion = (data) => {
    return prisma_1.default.clienteUbicacion.create({
        data: {
            ...data,
            estado: client_1.EstadoUbicacion.ACTIVA,
        },
    });
};
exports.createUbicacion = createUbicacion;
const updateUbicacion = (id, data) => {
    return prisma_1.default.clienteUbicacion.update({
        where: { id },
        data,
    });
};
exports.updateUbicacion = updateUbicacion;
const updateUbicacionEstado = (id, estado) => {
    return prisma_1.default.clienteUbicacion.update({
        where: { id },
        data: {
            estado,
            ...(estado === client_1.EstadoUbicacion.INACTIVA && { esPrincipal: false }),
        },
    });
};
exports.updateUbicacionEstado = updateUbicacionEstado;
const clearPrincipalByCliente = (clienteId) => {
    return prisma_1.default.clienteUbicacion.updateMany({
        where: { clienteId },
        data: { esPrincipal: false },
    });
};
exports.clearPrincipalByCliente = clearPrincipalByCliente;
