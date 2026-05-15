"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTiposServicioByEmpresa = findTiposServicioByEmpresa;
exports.findTipoServicioById = findTipoServicioById;
exports.findTipoServicioByName = findTipoServicioByName;
exports.createTipoServicio = createTipoServicio;
exports.updateTipoServicio = updateTipoServicio;
exports.updateTipoServicioStatus = updateTipoServicioStatus;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
async function findTiposServicioByEmpresa(empresaId) {
    return prisma_1.default.tipoServicio.findMany({
        where: { empresaId },
        orderBy: { createdAt: "desc" },
    });
}
async function findTipoServicioById(id) {
    return prisma_1.default.tipoServicio.findUnique({
        where: { id },
    });
}
async function findTipoServicioByName(empresaId, nombre) {
    return prisma_1.default.tipoServicio.findFirst({
        where: {
            empresaId,
            nombre,
        },
    });
}
async function createTipoServicio(data) {
    return prisma_1.default.tipoServicio.create({
        data: {
            empresaId: data.empresaId,
            nombre: data.nombre,
            descripcion: data.descripcion,
            precioBase: data.precioBase,
            estado: client_1.EstadoRegistroBasico.ACTIVO,
        },
    });
}
async function updateTipoServicio(id, data) {
    return prisma_1.default.tipoServicio.update({
        where: { id },
        data,
    });
}
async function updateTipoServicioStatus(id, estado) {
    return prisma_1.default.tipoServicio.update({
        where: { id },
        data: { estado },
    });
}
