"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findClientesByEmpresa = findClientesByEmpresa;
exports.findClienteById = findClienteById;
exports.getPagosByClient = getPagosByClient;
exports.getCuentasByClient = getCuentasByClient;
exports.findClienteByCodigo = findClienteByCodigo;
exports.searchClientesForSelect = searchClientesForSelect;
exports.createCliente = createCliente;
exports.updateCliente = updateCliente;
exports.updateClienteStatus = updateClienteStatus;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
async function findClientesByEmpresa(empresaId) {
    return prisma_1.default.cliente.findMany({
        where: { empresaId },
        orderBy: { createdAt: "desc" },
    });
}
async function findClienteById(id) {
    return prisma_1.default.cliente.findUnique({
        where: { id }
    });
}
async function getPagosByClient(id) {
    return prisma_1.default.pago.findMany({
        where: { clienteId: id },
        include: {
            metodoPago: {
                select: {
                    id: true,
                    nombre: true,
                },
            },
            registradoBy: {
                select: {
                    id: true,
                    nombres: true,
                    apellidos: true
                },
            },
        },
    });
}
async function getCuentasByClient(id) {
    return prisma_1.default.cuentaServicio.findMany({
        where: { clienteId: id },
        include: {
            tipoServicio: {
                select: {
                    nombre: true
                }
            }
        }
    });
}
async function findClienteByCodigo(empresaId, codigo) {
    return prisma_1.default.cliente.findFirst({
        where: {
            empresaId,
            codigo,
        },
    });
}
async function searchClientesForSelect(empresaId, options) {
    const { search } = options ?? {};
    return prisma_1.default.cliente.findMany({
        where: {
            empresaId,
            ...(search && {
                OR: [
                    { nombreRazonSocial: { contains: search, mode: "insensitive" } },
                    { codigo: { contains: search, mode: "insensitive" } },
                ],
            }),
        },
        orderBy: { nombreRazonSocial: "asc" },
        select: {
            id: true,
            codigo: true,
            nombreRazonSocial: true,
        },
    });
}
async function createCliente(data) {
    return prisma_1.default.cliente.create({
        data: {
            empresaId: data.empresaId,
            codigo: data.codigo,
            tipoCliente: data.tipoCliente,
            primerNombre: data.primerNombre,
            segundoNombre: data.segundoNombre,
            primerApellido: data.primerApellido,
            segundoApellido: data.segundoApellido,
            nombreRazonSocial: data.nombreRazonSocial,
            nombreComercial: data.nombreComercial,
            tipoIdentificacion: data.tipoIdentificacion,
            identificacion: data.identificacion,
            telefono: data.telefono,
            email: data.email,
            direccionFiscal: data.direccionFiscal,
            observaciones: data.observaciones,
            estado: client_1.EstadoRegistroBasico.ACTIVO,
        },
    });
}
async function updateCliente(id, data) {
    return prisma_1.default.cliente.update({
        where: { id },
        data,
    });
}
async function updateClienteStatus(id, estado) {
    return prisma_1.default.cliente.update({
        where: { id },
        data: { estado },
    });
}
