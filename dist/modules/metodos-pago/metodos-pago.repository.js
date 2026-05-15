"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMetodosPagoByEmpresa = findMetodosPagoByEmpresa;
exports.findMetodoPagoById = findMetodoPagoById;
exports.findMetodoPagoByName = findMetodoPagoByName;
exports.createMetodoPago = createMetodoPago;
exports.updateMetodoPago = updateMetodoPago;
exports.updateMetodoPagoStatus = updateMetodoPagoStatus;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
async function findMetodosPagoByEmpresa(empresaId) {
    return prisma_1.default.metodoPago.findMany({
        where: { empresaId },
        orderBy: { createdAt: "desc" },
    });
}
async function findMetodoPagoById(id) {
    return prisma_1.default.metodoPago.findUnique({
        where: { id },
    });
}
async function findMetodoPagoByName(empresaId, nombre) {
    return prisma_1.default.metodoPago.findFirst({
        where: {
            empresaId,
            nombre,
        },
    });
}
async function createMetodoPago(data) {
    return prisma_1.default.metodoPago.create({
        data: {
            empresaId: data.empresaId,
            nombre: data.nombre,
            descripcion: data.descripcion,
            estado: client_1.EstadoRegistroBasico.ACTIVO,
        },
    });
}
async function updateMetodoPago(id, data) {
    return prisma_1.default.metodoPago.update({
        where: { id },
        data,
    });
}
async function updateMetodoPagoStatus(id, estado) {
    return prisma_1.default.metodoPago.update({
        where: { id },
        data: { estado },
    });
}
