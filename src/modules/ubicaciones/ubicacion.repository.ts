import prisma from "../../config/prisma";
import { EstadoUbicacion } from "@prisma/client";

export const findUbicacionesByCliente = (clienteId: string) => {
    return prisma.clienteUbicacion.findMany({
    where: { clienteId },
    orderBy: { esPrincipal: "desc" },
    });
};

export const findUbicacionById = (id: string) => {
    return prisma.clienteUbicacion.findUnique({
    where: { id },
    });
};

export const createUbicacion = (data: {
    clienteId: string;
    nombre: string;
    direccion: string;
    referencia?: string;
    latitud?: number | null;
    longitud?: number | null;
    esPrincipal: boolean;
}) => {
    return prisma.clienteUbicacion.create({
    data: {
        ...data,
        estado: EstadoUbicacion.ACTIVA,
    },
    });
};

export const updateUbicacion = (
    id: string,
    data: {
    nombre?: string;
    direccion?: string;
    referencia?: string;
    latitud?: number | null;
    longitud?: number | null;
    esPrincipal?: boolean;
    }
) => {
    return prisma.clienteUbicacion.update({
    where: { id },
    data,
    });
};

export const updateUbicacionEstado = (id: string, estado: EstadoUbicacion) => {
    return prisma.clienteUbicacion.update({
    where: { id },
    data: {
        estado,
        ...(estado === EstadoUbicacion.INACTIVA && { esPrincipal: false }),
    },
    });
};

export const clearPrincipalByCliente = (clienteId: string) => {
    return prisma.clienteUbicacion.updateMany({
    where: { clienteId },
    data: { esPrincipal: false },
    });
};