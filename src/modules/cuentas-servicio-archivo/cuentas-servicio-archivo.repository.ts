import prisma from "../../config/prisma";
import { EstadoArchivo } from "@prisma/client";

export const findArchivosByCuentaServicio = (cuentaServicioId: string) => {
    return prisma.cuentaServicioArchivo.findMany({
        where: { cuentaServicioId },
        orderBy: {createdAt: "desc"}
    })
}

export const findArchivoById = (id: string) => {
    return prisma.cuentaServicioArchivo.findUnique({
        where: {id}
    })
}

export const createArchivo = (data: {
    cuentaServicioId: string;
    subidoPor: string;
    nombre: string;
    categoria: string;
    mimeType: string;
    extension?: string;
    tamanoBytes?: number | null;
    storageKey: string;
    url?: string | null;
}) => {
    return prisma.cuentaServicioArchivo.create({
        data: {
            ...data,
            estado: EstadoArchivo.ACTIVO,
        },
    });
};


export const updateArchivoEstado = (id: string, estado: EstadoArchivo) => {
    return prisma.cuentaServicioArchivo.update({
        where: { id },
        data: { estado },
    });
};
