"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateArchivoEstado = exports.createArchivo = exports.findArchivoById = exports.findArchivosByCuentaServicio = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const findArchivosByCuentaServicio = (cuentaServicioId) => {
    return prisma_1.default.cuentaServicioArchivo.findMany({
        where: { cuentaServicioId },
        orderBy: { createdAt: "desc" }
    });
};
exports.findArchivosByCuentaServicio = findArchivosByCuentaServicio;
const findArchivoById = (id) => {
    return prisma_1.default.cuentaServicioArchivo.findUnique({
        where: { id }
    });
};
exports.findArchivoById = findArchivoById;
const createArchivo = (data) => {
    return prisma_1.default.cuentaServicioArchivo.create({
        data: {
            ...data,
            estado: client_1.EstadoArchivo.ACTIVO,
        },
    });
};
exports.createArchivo = createArchivo;
const updateArchivoEstado = (id, estado) => {
    return prisma_1.default.cuentaServicioArchivo.update({
        where: { id },
        data: { estado },
    });
};
exports.updateArchivoEstado = updateArchivoEstado;
