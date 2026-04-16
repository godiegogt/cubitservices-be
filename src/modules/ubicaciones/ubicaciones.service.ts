import { EstadoUbicacion } from "@prisma/client";
import { findClienteById } from "../clientes/clientes.repository";
import {
    clearPrincipalByCliente,
    createUbicacion,
    findUbicacionById,
    findUbicacionesByCliente,
    updateUbicacion,
    updateUbicacionEstado,
} from "./ubicacion.repository";
import prisma from "../../config/prisma";

async function validarClienteDeEmpresa(clienteId: string, empresaId: string) {
    const cliente = await findClienteById(clienteId);

    if (!cliente || cliente.empresaId !== empresaId) {
    throw new Error("Cliente no encontrado");
    }

    return cliente;
}

async function validarUbicacionDeCliente(
    ubicacionId: string,
    clienteId: string,
    empresaId: string
) {
    const ubicacion = await findUbicacionById(ubicacionId);

    if (!ubicacion) {
    throw new Error("Ubicación no encontrada");
    }

    if (ubicacion.clienteId !== clienteId) {
    throw new Error("La ubicación no pertenece a este cliente");
    }

    await validarClienteDeEmpresa(clienteId, empresaId);

    return ubicacion;
}

export async function getUbicacionesService(
    clienteId: string,
    empresaId: string
) {
    await validarClienteDeEmpresa(clienteId, empresaId);
    return findUbicacionesByCliente(clienteId);
}

export async function createUbicacionService(
    clienteId: string,
    empresaId: string,
    input: {
    nombre: string;
    direccion: string;
    referencia?: string;
    latitud?: number | null;
    longitud?: number | null;
    esPrincipal: boolean;
    }
) {
    await validarClienteDeEmpresa(clienteId, empresaId);

    return prisma.$transaction(async (tx) => {
    if (input.esPrincipal) {
        await tx.clienteUbicacion.updateMany({
        where: { clienteId },
        data: { esPrincipal: false },
        });
    }

    return tx.clienteUbicacion.create({
        data: {
        ...input,
        clienteId,
        estado: EstadoUbicacion.ACTIVA,
        },
    });
    });
}

export async function updateUbicacionService(
    ubicacionId: string,
    clienteId: string,
    empresaId: string,
    input: {
    nombre?: string;
    direccion?: string;
    referencia?: string;
    latitud?: number | null;
    longitud?: number | null;
    esPrincipal?: boolean;
    }
) {
    await validarUbicacionDeCliente(ubicacionId, clienteId, empresaId);

    return prisma.$transaction(async (tx) => {
    if (input.esPrincipal) {
        await tx.clienteUbicacion.updateMany({
        where: { clienteId },
        data: { esPrincipal: false },
        });
    }

    return tx.clienteUbicacion.update({
        where: { id: ubicacionId },
        data: input,
    });
    });
}

export async function updateUbicacionEstadoService(
    ubicacionId: string,
    clienteId: string,
    empresaId: string,
    estado: EstadoUbicacion
) {
    await validarUbicacionDeCliente(ubicacionId, clienteId, empresaId);

    return updateUbicacionEstado(ubicacionId, estado);
}