"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUsersByEmpresa = findUsersByEmpresa;
exports.findUserById = findUserById;
exports.findUserByEmail = findUserByEmail;
exports.createUser = createUser;
exports.updateUser = updateUser;
const prisma_1 = __importDefault(require("../../config/prisma"));
async function findUsersByEmpresa(empresaId) {
    return prisma_1.default.usuario.findMany({
        where: { empresaId },
        include: {
            rol: true,
        },
        orderBy: { createdAt: "desc" },
    });
}
async function findUserById(id) {
    return prisma_1.default.usuario.findUnique({
        where: { id },
    });
}
async function findUserByEmail(empresaId, email) {
    return prisma_1.default.usuario.findFirst({
        where: {
            empresaId,
            email,
        },
    });
}
async function createUser(data) {
    return prisma_1.default.usuario.create({
        data,
    });
}
async function updateUser(id, data) {
    return prisma_1.default.usuario.update({
        where: { id },
        data,
    });
}
