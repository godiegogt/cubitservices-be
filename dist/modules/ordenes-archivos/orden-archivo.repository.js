"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateArchivoEstado = exports.createArchivo = exports.findArchivoById = exports.findArchivosByCliente = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const findArchivosByCliente = (ordenServicioId) => {
    return prisma_1.default.ordenServicioArchivo.findMany({
        where: { ordenServicioId },
        orderBy: { createdAt: "desc" },
    });
};
exports.findArchivosByCliente = findArchivosByCliente;
const findArchivoById = (id) => {
    return prisma_1.default.ordenServicioArchivo.findUnique({
        where: { id },
    });
};
exports.findArchivoById = findArchivoById;
const createArchivo = (data) => {
    return prisma_1.default.ordenServicioArchivo.create({
        data: {
            ...data,
            estado: client_1.EstadoArchivo.ACTIVO,
        },
    });
};
exports.createArchivo = createArchivo;
const updateArchivoEstado = (id, estado) => {
    return prisma_1.default.ordenServicioArchivo.update({
        where: { id },
        data: { estado },
    });
};
exports.updateArchivoEstado = updateArchivoEstado;
