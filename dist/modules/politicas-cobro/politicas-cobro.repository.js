"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPoliticasByEmpresa = findPoliticasByEmpresa;
exports.findPoliticaById = findPoliticaById;
exports.findPoliticaByName = findPoliticaByName;
exports.createPoliticaCobro = createPoliticaCobro;
exports.updatePoliticaCobro = updatePoliticaCobro;
exports.updatePoliticaCobroStatus = updatePoliticaCobroStatus;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
async function findPoliticasByEmpresa(empresaId) {
    return prisma_1.default.politicaCobro.findMany({
        where: { empresaId },
        orderBy: { createdAt: "desc" },
    });
}
async function findPoliticaById(id) {
    return prisma_1.default.politicaCobro.findUnique({
        where: { id },
    });
}
async function findPoliticaByName(empresaId, nombre) {
    return prisma_1.default.politicaCobro.findFirst({
        where: {
            empresaId,
            nombre,
        },
    });
}
async function createPoliticaCobro(data) {
    return prisma_1.default.politicaCobro.create({
        data: {
            empresaId: data.empresaId,
            nombre: data.nombre,
            tipoVencimiento: data.tipoVencimiento,
            diaCorte: data.diaCorte,
            diaVencimiento: data.diaVencimiento,
            diasGracia: data.diasGracia,
            aplicaMora: data.aplicaMora,
            tipoMora: data.tipoMora,
            valorMora: data.valorMora,
            estado: client_1.EstadoRegistroBasico.ACTIVO,
        },
    });
}
async function updatePoliticaCobro(id, data) {
    return prisma_1.default.politicaCobro.update({
        where: { id },
        data,
    });
}
async function updatePoliticaCobroStatus(id, estado) {
    return prisma_1.default.politicaCobro.update({
        where: { id },
        data: { estado },
    });
}
