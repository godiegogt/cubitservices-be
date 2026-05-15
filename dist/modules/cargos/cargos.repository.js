"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCargosByEmpresa = findCargosByEmpresa;
exports.findCargoById = findCargoById;
exports.findCuentaServicioById = findCuentaServicioById;
exports.findOrdenServicioById = findOrdenServicioById;
exports.findPoliticaCobroById = findPoliticaCobroById;
exports.findDuplicateServicioCargo = findDuplicateServicioCargo;
exports.createCargo = createCargo;
exports.updateCargoStatus = updateCargoStatus;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../config/prisma"));
const cargoListInclude = {
    cliente: {
        select: {
            id: true,
            codigo: true,
            nombreRazonSocial: true,
        },
    },
    cuentaServicio: {
        select: {
            id: true,
            codigo: true,
            nombre: true,
            estado: true,
        },
    },
    ordenServicio: {
        select: {
            id: true,
            numeroOrden: true,
            titulo: true,
        },
    },
    politicaCobro: {
        select: {
            id: true,
            nombre: true,
        },
    },
};
const cargoDetailInclude = {
    ...cargoListInclude,
    politicaCobro: {
        select: {
            id: true,
            nombre: true,
            tipoVencimiento: true,
            diaCorte: true,
            diaVencimiento: true,
            diasGracia: true,
            aplicaMora: true,
            tipoMora: true,
            valorMora: true,
        },
    },
};
async function findCargosByEmpresa(empresaId, filters, pagination) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
        empresaId,
        clienteId: filters?.clienteId,
        cuentaServicioId: filters?.cuentaServicioId,
        estado: filters?.estado,
        tipoCargo: filters?.tipoCargo,
        periodoReferencia: filters?.periodoReferencia,
        ...(filters?.search
            ? {
                OR: [
                    { concepto: { contains: filters.search, mode: "insensitive" } },
                    {
                        periodoReferencia: {
                            contains: filters.search,
                            mode: "insensitive",
                        },
                    },
                ],
            }
            : {}),
    };
    const [cargos, total] = await Promise.all([
        prisma_1.default.cargo.findMany({
            where,
            include: cargoListInclude,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma_1.default.cargo.count({ where }),
    ]);
    return { cargos, total };
}
async function findCargoById(id) {
    return prisma_1.default.cargo.findUnique({
        where: { id },
        include: cargoDetailInclude,
    });
}
async function findCuentaServicioById(id) {
    return prisma_1.default.cuentaServicio.findUnique({
        where: { id },
    });
}
async function findOrdenServicioById(id) {
    return prisma_1.default.ordenServicio.findUnique({
        where: { id },
    });
}
async function findPoliticaCobroById(id) {
    return prisma_1.default.politicaCobro.findUnique({
        where: { id },
    });
}
async function findDuplicateServicioCargo(input) {
    return prisma_1.default.cargo.findFirst({
        where: {
            empresaId: input.empresaId,
            cuentaServicioId: input.cuentaServicioId,
            tipoCargo: client_1.TipoCargo.SERVICIO,
            periodoReferencia: input.periodoReferencia,
        },
    });
}
async function createCargo(data) {
    return prisma_1.default.cargo.create({
        data: {
            empresaId: data.empresaId,
            clienteId: data.clienteId,
            cuentaServicioId: data.cuentaServicioId,
            ordenServicioId: data.ordenServicioId,
            politicaCobroId: data.politicaCobroId,
            tipoCargo: data.tipoCargo,
            concepto: data.concepto,
            periodoReferencia: data.periodoReferencia,
            monto: data.monto,
            saldo: data.saldo,
            fechaEmision: data.fechaEmision,
            fechaVencimiento: data.fechaVencimiento,
            diasGraciaAplicados: data.diasGraciaAplicados,
            tipoMoraAplicada: data.tipoMoraAplicada,
            valorMoraAplicado: data.valorMoraAplicado,
            estado: data.estado,
        },
        include: cargoDetailInclude,
    });
}
async function updateCargoStatus(id, estado) {
    return prisma_1.default.cargo.update({
        where: { id },
        data: { estado },
        select: {
            id: true,
            estado: true,
        },
    });
}
