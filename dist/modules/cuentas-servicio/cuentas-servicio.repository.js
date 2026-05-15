"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCuentasServicioByEmpresa = findCuentasServicioByEmpresa;
exports.findCuentaServicioById = findCuentaServicioById;
exports.findCuentaServicioByCodigo = findCuentaServicioByCodigo;
exports.findClienteById = findClienteById;
exports.findUbicacionById = findUbicacionById;
exports.findTipoServicioById = findTipoServicioById;
exports.findPoliticaCobroById = findPoliticaCobroById;
exports.createCuentaServicio = createCuentaServicio;
exports.updateCuentaServicio = updateCuentaServicio;
exports.updateCuentaServicioStatus = updateCuentaServicioStatus;
exports.findCuentasServicioSelectByCliente = findCuentasServicioSelectByCliente;
exports.findCuentasServicioSelect = findCuentasServicioSelect;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../config/prisma"));
const cuentaServicioInclude = {
    cliente: {
        select: {
            id: true,
            codigo: true,
            nombreRazonSocial: true,
            nombreComercial: true,
            telefono: true,
            estado: true,
        },
    },
    ubicacion: {
        select: {
            id: true,
            nombre: true,
            direccion: true,
            referencia: true,
            estado: true,
        },
    },
    tipoServicio: {
        select: {
            id: true,
            nombre: true,
            descripcion: true,
            precioBase: true,
            estado: true,
        },
    },
    politicaCobro: {
        select: {
            id: true,
            nombre: true,
            tipoVencimiento: true,
            diaCorte: true,
            diaVencimiento: true,
            diasGracia: true,
            aplicaMora: true,
            estado: true,
        },
    },
};
async function findCuentasServicioByEmpresa(empresaId, filters) {
    return prisma_1.default.cuentaServicio.findMany({
        where: {
            empresaId,
            clienteId: filters?.clienteId,
            estado: filters?.estado,
            tipoServicioId: filters?.tipoServicioId,
            ...(filters?.search
                ? {
                    OR: [
                        { codigo: { contains: filters.search, mode: "insensitive" } },
                        { nombre: { contains: filters.search, mode: "insensitive" } },
                    ],
                }
                : {}),
        },
        include: cuentaServicioInclude,
        orderBy: { createdAt: "desc" },
    });
}
async function findCuentaServicioById(id) {
    return prisma_1.default.cuentaServicio.findUnique({
        where: { id },
        include: cuentaServicioInclude,
    });
}
async function findCuentaServicioByCodigo(empresaId, codigo) {
    return prisma_1.default.cuentaServicio.findFirst({
        where: {
            empresaId,
            codigo,
        },
    });
}
async function findClienteById(id) {
    return prisma_1.default.cliente.findUnique({
        where: { id },
    });
}
async function findUbicacionById(id) {
    return prisma_1.default.clienteUbicacion.findUnique({
        where: { id },
    });
}
async function findTipoServicioById(id) {
    return prisma_1.default.tipoServicio.findUnique({
        where: { id },
    });
}
async function findPoliticaCobroById(id) {
    return prisma_1.default.politicaCobro.findUnique({
        where: { id },
    });
}
async function createCuentaServicio(data) {
    return prisma_1.default.cuentaServicio.create({
        data: {
            empresaId: data.empresaId,
            clienteId: data.clienteId,
            ubicacionId: data.ubicacionId,
            tipoServicioId: data.tipoServicioId,
            politicaCobroId: data.politicaCobroId,
            codigo: data.codigo,
            nombre: data.nombre,
            descripcion: data.descripcion,
            modalidad: data.modalidad,
            frecuencia: data.frecuencia,
            fechaInicio: data.fechaInicio,
            fechaFin: data.fechaFin,
            montoBase: data.montoBase,
            diaCorte: data.diaCorte,
            diaPago: data.diaPago,
            observaciones: data.observaciones,
            estado: client_1.EstadoCuentaServicio.ACTIVA,
        },
        include: cuentaServicioInclude,
    });
}
async function updateCuentaServicio(id, data) {
    return prisma_1.default.cuentaServicio.update({
        where: { id },
        data,
        include: cuentaServicioInclude,
    });
}
async function updateCuentaServicioStatus(id, estado) {
    return prisma_1.default.cuentaServicio.update({
        where: { id },
        data: { estado },
        include: cuentaServicioInclude,
    });
}
async function findCuentasServicioSelectByCliente(clienteId, empresaId) {
    return prisma_1.default.cuentaServicio.findMany({
        where: {
            clienteId,
            empresaId,
        },
        orderBy: { nombre: "asc" },
        select: {
            id: true,
            codigo: true,
            nombre: true,
            ubicacion: {
                select: {
                    id: true,
                    nombre: true,
                    direccion: true,
                },
            },
            tipoServicio: {
                select: {
                    id: true,
                    nombre: true,
                },
            },
        },
    });
}
async function findCuentasServicioSelect(empresaId, filters) {
    return prisma_1.default.cuentaServicio.findMany({
        where: {
            empresaId,
            estado: client_1.EstadoCuentaServicio.ACTIVA, // solo activas para selects
            clienteId: filters?.clienteId,
            ...(filters?.search
                ? {
                    OR: [
                        { codigo: { contains: filters.search, mode: "insensitive" } },
                        { nombre: { contains: filters.search, mode: "insensitive" } },
                    ],
                }
                : {}),
        },
        orderBy: { nombre: "asc" },
        select: {
            id: true,
            codigo: true,
            nombre: true,
            ubicacion: {
                select: {
                    id: true,
                    nombre: true,
                    direccion: true,
                },
            },
            tipoServicio: {
                select: {
                    id: true,
                    nombre: true,
                },
            },
        },
    });
}
