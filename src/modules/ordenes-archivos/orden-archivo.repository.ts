import prisma from "../../config/prisma";
import { EstadoArchivo } from "@prisma/client";

export const findArchivosByCliente = (ordenServicioId: string) => {
    return prisma.ordenServicioArchivo.findMany({
        where: { ordenServicioId },
        orderBy: { createdAt: "desc" },
    });
};

export const findArchivoById = (id: string) => {
    return prisma.ordenServicioArchivo.findUnique({
        where: { id },
    });
};

export const createArchivo = (data: {
    ordenServicioId: string;
    usuarioId: string;
    nombre: string;
    categoria: string;
    mimeType: string;
    extension?: string;
    tamanoBytes?: number | null;
    storageKey: string;
    url?: string | null;
}) => {
    return prisma.ordenServicioArchivo.create({
        data: {
            ...data,
            estado: EstadoArchivo.ACTIVO,
        },
    });
};

export const updateArchivoEstado = (id: string, estado: EstadoArchivo) => {
    return prisma.ordenServicioArchivo.update({
        where: { id },
        data: { estado },
    });
};