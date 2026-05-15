"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrdenesByEmpresa = findOrdenesByEmpresa;
exports.findOrdenById = findOrdenById;
exports.findOrdenByNumero = findOrdenByNumero;
exports.countOrdenesByEmpresa = countOrdenesByEmpresa;
exports.findCuentaServicioById = findCuentaServicioById;
exports.findUbicacionById = findUbicacionById;
exports.findTipoServicioById = findTipoServicioById;
exports.createOrden = createOrden;
exports.updateOrden = updateOrden;
exports.updateOrdenStatus = updateOrdenStatus;
exports.findEstadosByOrdenId = findEstadosByOrdenId;
exports.findOrdenesSelect = findOrdenesSelect;
const prisma_1 = __importDefault(require("../../config/prisma"));
const ordenServicioInclude = {
    cuentaServicio: {
        select: {
            id: true,
            codigo: true,
            nombre: true,
            estado: true,
        },
    },
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
};
const ordenServicioEstadoInclude = {
    usuario: {
        select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
        },
    },
};
async function findOrdenesByEmpresa(empresaId, filters) {
    return prisma_1.default.ordenServicio.findMany({
        where: {
            empresaId,
            estado: filters?.estado,
            clienteId: filters?.clienteId,
            cuentaServicioId: filters?.cuentaServicioId,
            tipoServicioId: filters?.tipoServicioId,
            prioridad: filters?.prioridad,
            origen: filters?.origen,
            ...(filters?.search
                ? {
                    OR: [
                        { numeroOrden: { contains: filters.search, mode: "insensitive" } },
                        { titulo: { contains: filters.search, mode: "insensitive" } },
                    ],
                }
                : {}),
        },
        include: ordenServicioInclude,
        orderBy: { createdAt: "desc" },
    });
}
async function findOrdenById(id) {
    return prisma_1.default.ordenServicio.findUnique({
        where: { id },
        include: ordenServicioInclude,
    });
}
async function findOrdenByNumero(empresaId, numeroOrden) {
    return prisma_1.default.ordenServicio.findFirst({
        where: {
            empresaId,
            numeroOrden,
        },
    });
}
async function countOrdenesByEmpresa(empresaId) {
    return prisma_1.default.ordenServicio.count({
        where: { empresaId },
    });
}
async function findCuentaServicioById(id) {
    return prisma_1.default.cuentaServicio.findUnique({
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
async function createOrden(data) {
    return prisma_1.default.$transaction(async (tx) => {
        const orden = await tx.ordenServicio.create({
            data: {
                empresaId: data.empresaId,
                cuentaServicioId: data.cuentaServicioId,
                clienteId: data.clienteId,
                ubicacionId: data.ubicacionId,
                tipoServicioId: data.tipoServicioId,
                numeroOrden: data.numeroOrden,
                titulo: data.titulo,
                descripcion: data.descripcion,
                origen: data.origen,
                prioridad: data.prioridad,
                estado: data.estado,
                fechaProgramada: data.fechaProgramada,
                requiereEvidenciaFinal: data.requiereEvidenciaFinal ?? false,
                observacionesGenerales: data.observacionesGenerales,
            },
            include: ordenServicioInclude,
        });
        await tx.ordenServicioEstado.create({
            data: {
                ordenServicioId: orden.id,
                estadoAnterior: null,
                estadoNuevo: data.estado,
                motivo: "Orden creada",
                usuarioId: data.usuarioId,
            },
        });
        return orden;
    });
}
async function updateOrden(id, data) {
    return prisma_1.default.ordenServicio.update({
        where: { id },
        data,
        include: ordenServicioInclude,
    });
}
async function updateOrdenStatus(id, data) {
    return prisma_1.default.$transaction(async (tx) => {
        const orden = await tx.ordenServicio.update({
            where: { id },
            data: {
                estado: data.estadoNuevo,
                fechaInicio: data.fechaInicio,
                fechaCierre: data.fechaCierre,
                motivoCancelacion: data.motivoCancelacion,
            },
            include: ordenServicioInclude,
        });
        await tx.ordenServicioEstado.create({
            data: {
                ordenServicioId: id,
                estadoAnterior: data.estadoAnterior,
                estadoNuevo: data.estadoNuevo,
                motivo: data.motivo,
                usuarioId: data.usuarioId,
            },
        });
        return orden;
    });
}
async function findEstadosByOrdenId(ordenServicioId) {
    return prisma_1.default.ordenServicioEstado.findMany({
        where: { ordenServicioId },
        include: ordenServicioEstadoInclude,
        orderBy: { createdAt: "asc" },
    });
}
async function findOrdenesSelect(empresaId, filters) {
    return prisma_1.default.ordenServicio.findMany({
        where: {
            empresaId,
            cuentaServicioId: filters?.cuentaServicioId,
            clienteId: filters?.clienteId,
            ...(filters?.search
                ? {
                    OR: [
                        { numeroOrden: { contains: filters.search, mode: "insensitive" } },
                        { titulo: { contains: filters.search, mode: "insensitive" } },
                    ],
                }
                : {}),
        },
        orderBy: { numeroOrden: "asc" },
        select: {
            id: true,
            numeroOrden: true,
            titulo: true,
            estado: true,
            prioridad: true,
            cliente: {
                select: {
                    id: true,
                    nombreRazonSocial: true,
                    nombreComercial: true,
                },
            },
            cuentaServicio: {
                select: {
                    id: true,
                    codigo: true,
                    nombre: true,
                },
            },
        },
    });
}
