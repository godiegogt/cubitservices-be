"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRolesByEmpresa = findRolesByEmpresa;
exports.findRoleById = findRoleById;
exports.findRoleByName = findRoleByName;
exports.createRole = createRole;
exports.updateRole = updateRole;
exports.updateRoleStatus = updateRoleStatus;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
async function findRolesByEmpresa(empresaId) {
    return prisma_1.default.rol.findMany({
        where: { empresaId },
        orderBy: { createdAt: "desc" },
    });
}
async function findRoleById(id) {
    return prisma_1.default.rol.findUnique({
        where: { id },
    });
}
async function findRoleByName(empresaId, nombre) {
    return prisma_1.default.rol.findFirst({
        where: {
            empresaId,
            nombre,
        },
    });
}
async function createRole(data) {
    return prisma_1.default.rol.create({
        data: {
            empresaId: data.empresaId,
            nombre: data.nombre,
            descripcion: data.descripcion,
            estado: client_1.EstadoRegistroBasico.ACTIVO,
        },
    });
}
async function updateRole(id, data) {
    return prisma_1.default.rol.update({
        where: { id },
        data,
    });
}
async function updateRoleStatus(id, estado) {
    return prisma_1.default.rol.update({
        where: { id },
        data: { estado },
    });
}
