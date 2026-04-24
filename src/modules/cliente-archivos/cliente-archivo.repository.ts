import prisma from "../../config/prisma";
import { EstadoArchivo } from "@prisma/client";

export const findArchivosByCliente = (clienteId: string) => {
    return prisma.clienteArchivo.findMany({
        where: { clienteId },
        orderBy: { createdAt: "desc" },
    });
};

export const findArchivoById = (id: string) => {
    return prisma.clienteArchivo.findUnique({
        where: { id },
    });
};

export const createArchivo = (data: {
    clienteId: string;
    subidoPor: string;
    nombre: string;
    categoria: string;
    mimeType: string;
    extension?: string;
    tamanoBytes?: number | null;
    storageKey: string;
    url?: string | null;
}) => {
    return prisma.clienteArchivo.create({
        data: {
            ...data,
            estado: EstadoArchivo.ACTIVO,
        },
    });
};

export const updateArchivoEstado = (id: string, estado: EstadoArchivo) => {
    return prisma.clienteArchivo.update({
        where: { id },
        data: { estado },
    });
};