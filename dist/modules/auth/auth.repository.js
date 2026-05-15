"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.updateLastAccess = updateLastAccess;
const prisma_1 = __importDefault(require("../../config/prisma"));
async function findUserByEmail(email) {
    return prisma_1.default.usuario.findFirst({
        where: { email },
        include: {
            rol: true,
            empresa: true,
        },
    });
}
async function updateLastAccess(userId) {
    return prisma_1.default.usuario.update({
        where: { id: userId },
        data: {
            ultimoAcceso: new Date(),
        },
    });
}
